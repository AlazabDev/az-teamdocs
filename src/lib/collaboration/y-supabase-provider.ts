import * as Y from "yjs";
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness";
import { supabase } from "@/integrations/supabase/client";

/**
 * Syncs a Yjs Y.Doc with Supabase Realtime Broadcast.
 */
export class SupabaseYjsProvider {
  doc: Y.Doc;
  awareness: Awareness;

  private documentId: string;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private isSynced = false;
  private isDestroyed = false;
  private isSubscribed = false;

  constructor(documentId: string, doc: Y.Doc) {
    this.doc = doc;
    this.documentId = documentId;
    this.awareness = new Awareness(doc);

    this.setupChannel();
  }

  private setupChannel() {
    this.channel = supabase.channel(`doc:${this.documentId}`, {
      config: { broadcast: { self: false } },
    });

    // Listen for remote Yjs updates
    this.channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
      if (this.isDestroyed) return;
      const update = new Uint8Array(payload.update);
      Y.applyUpdate(this.doc, update, "remote");
    });

    // Listen for remote awareness updates
    this.channel.on("broadcast", { event: "awareness" }, ({ payload }) => {
      if (this.isDestroyed) return;
      const update = new Uint8Array(payload.update);
      applyAwarenessUpdate(this.awareness, update, "remote");
    });

    // Subscribe and THEN start listening for local changes + load initial state
    this.channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        this.isSubscribed = true;
        console.log(`[yjs] Channel subscribed for doc:${this.documentId}`);

        // Now it's safe to attach local update handlers
        this.doc.on("update", this.handleDocUpdate);
        this.awareness.on("update", this.handleAwarenessUpdate);

        // Load initial state from DB
        this.loadInitialState();
      }
    });
  }

  private handleDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === "remote" || this.isDestroyed || !this.isSubscribed) return;

    this.channel?.send({
      type: "broadcast",
      event: "yjs-update",
      payload: { update: Array.from(update) },
    });

    this.debouncedSave();
  };

  private handleAwarenessUpdate = ({ added, updated, removed }: {
    added: number[];
    updated: number[];
    removed: number[];
  }) => {
    if (this.isDestroyed || !this.isSubscribed) return;
    const changedClients = [...added, ...updated, ...removed];
    const update = encodeAwarenessUpdate(this.awareness, changedClients);

    this.channel?.send({
      type: "broadcast",
      event: "awareness",
      payload: { update: Array.from(update) },
    });
  };

  private async loadInitialState() {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("y_doc")
        .eq("id", this.documentId)
        .single();

      if (this.isDestroyed) return;

      if (error) {
        console.error("[yjs] loadInitialState query error", error);
      } else if (data?.y_doc && typeof data.y_doc === "string") {
        try {
          const bin = atob(data.y_doc);
          const binary = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) binary[i] = bin.charCodeAt(i);
          Y.applyUpdate(this.doc, binary, "remote");
          console.log(`[yjs] loaded ${binary.length} bytes from DB`);
        } catch (e) {
          console.error("[yjs] failed to decode y_doc", e);
        }
      } else {
        console.log("[yjs] no y_doc in DB (empty doc)");
      }

    } catch (e) {
      console.error("[yjs] loadInitialState failed", e);
    }

    this.isSynced = true;
  }

  private debouncedSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.save(), 2000);
  }

  private async save() {
    if (this.isDestroyed || !this.isSynced) return;

    try {
      const update = Y.encodeStateAsUpdate(this.doc);
      let binary = "";
      for (let i = 0; i < update.length; i++) binary += String.fromCharCode(update[i]);
      const b64 = btoa(binary);

      const { error } = await supabase
        .from("documents")
        .update({ y_doc: b64 } as unknown as Record<string, unknown>)
        .eq("id", this.documentId);

      if (error) console.error("[yjs] save error", error);
      else console.log(`[yjs] saved ${b64.length} chars to DB`);

    } catch (e) {
      console.error("[yjs] save failed", e);
    }
  }



  destroy() {
    this.isDestroyed = true;

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.save();

    this.doc.off("update", this.handleDocUpdate);
    this.awareness.off("update", this.handleAwarenessUpdate);
    this.awareness.destroy();
    this.channel?.unsubscribe();
    this.channel = null;
  }
}
