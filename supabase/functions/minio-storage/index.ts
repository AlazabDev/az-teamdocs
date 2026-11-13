
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.654.0";

import { getSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.654.0";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { corsHeaders } from "../_shared/cors.ts";

const endpoint = Deno.env.get("MINIO_ENDPOINT_URL")?.replace(/\/+$/, "");
const accessKeyId = Deno.env.get("MINIO_ACCESS_KEY");
const secretAccessKey = Deno.env.get("MINIO_SECRET_KEY");
const bucketName = Deno.env.get("MINIO_BUCKET_NAME") || "alazab-app";
const region = Deno.env.get("MINIO_REGION") || "us-east-1";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

function validProjectId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-zA-Z0-9_-]{1,128}$/.test(value)
  );
}

function validFileName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 255 &&
    value !== "." &&
    value !== ".."
  );
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 180);
}

function validContentType(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+$/.test(value)
  );
}

function ownsFileKey(
  fileKey: unknown,
  projectId: string,
  userId: string,
): fileKey is string {
  if (typeof fileKey !== "string") return false;

  const prefix = `projects/${projectId}/users/${userId}/`;

  if (!fileKey.startsWith(prefix)) return false;
  if (fileKey.length <= prefix.length) return false;

  const segments = fileKey.split("/");

  if (segments.some(segment =>
    segment === "." ||
    segment === ".." ||
    segment === ""
  )) {
    return false;
  }

  return true;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method Not Allowed" },
      405,
    );
  }

  try {
    if (
      !endpoint ||
      !accessKeyId ||
      !secretAccessKey ||
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      return jsonResponse(
        { error: "إعدادات الاتصال غير مكتملة" },
        500,
      );
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        { error: "غير مصرح: يجب تسجيل الدخول" },
        401,
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse(
        { error: "جلسة العمل غير صالحة" },
        401,
      );
    }

    let input: Record<string, unknown>;

    try {
      const parsed = await req.json();

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return jsonResponse(
          { error: "صيغة الطلب غير صحيحة" },
          400,
        );
      }

      input = parsed;
    } catch {
      return jsonResponse(
        { error: "JSON غير صالح" },
        400,
      );
    }

    const {
      action,
      projectId,
      fileName,
      fileKey,
      contentType,
    } = input;

    const allowedActions = [
      "get-upload-url",
      "get-view-url",
      "delete-file",
    ];

    if (
      typeof action !== "string" ||
      !allowedActions.includes(action)
    ) {
      return jsonResponse(
        { error: "العملية غير معروفة" },
        400,
      );
    }

    if (!validProjectId(projectId)) {
      return jsonResponse(
        { error: "معرف المشروع غير صالح" },
        400,
      );
    }

    const s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    // 1. Generate presigned upload URL
    if (action === "get-upload-url") {
      if (!validFileName(fileName)) {
        return jsonResponse(
          { error: "اسم الملف غير صالح" },
          400,
        );
      }

      const mimeType =
        contentType === undefined || contentType === null
          ? "application/pdf"
          : contentType;

      if (!validContentType(mimeType)) {
        return jsonResponse(
          { error: "نوع الملف غير صالح" },
          400,
        );
      }

      const cleanFileName = sanitizeFileName(fileName);

      const storageKey = [
        "projects",
        projectId,
        "users",
        user.id,
        `${crypto.randomUUID()}-${cleanFileName}`,
      ].join("/");

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(
        s3Client,
        command,
        { expiresIn: 900 },
      );

      return jsonResponse({
        success: true,
        uploadUrl,
        storageKey,
        bucket: bucketName,
        expiresIn: 900,
        uploadHeaders: {
          "Content-Type": mimeType,
        },
      });
    }

    // 2. Generate presigned view URL
    if (action === "get-view-url") {
      if (!ownsFileKey(fileKey, projectId, user.id)) {
        return jsonResponse(
          { error: "غير مصرح بالوصول إلى الملف" },
          403,
        );
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      const viewUrl = await getSignedUrl(
        s3Client,
        command,
        { expiresIn: 3600 },
      );

      return jsonResponse({
        success: true,
        viewUrl,
        expiresIn: 3600,
      });
    }

    // 3. Delete owned file
    if (action === "delete-file") {
      if (!ownsFileKey(fileKey, projectId, user.id)) {
        return jsonResponse(
          { error: "غير مصرح بحذف الملف" },
          403,
        );
      }

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      await s3Client.send(command);

      return jsonResponse({
        success: true,
        deletedKey: fileKey,
      });
    }

    return jsonResponse(
      { error: "العملية غير معروفة" },
      400,
    );
  } catch (err: unknown) {
    console.error("MinIO operation failed", err);

    return jsonResponse(
      { error: "فشلت عملية التخزين" },
      500,
    );
  }
});
