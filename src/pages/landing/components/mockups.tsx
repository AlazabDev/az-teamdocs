/**
 * Skeleton UI mockups for the feature showcase.
 * Uses shadcn Skeleton component for all placeholder bars.
 * Each renders inside the browser chrome frame (.screen-content).
 * Layout mirrors our workspace: sidebar + header + content.
 */

import { Skeleton } from "@/components/ui/skeleton";

function Sidebar() {
  return (
    <div className="w-[200px] shrink-0 border-r border-border bg-muted/30 p-3 flex flex-col gap-1">
      <div className="flex items-center gap-2 px-2 h-8 mb-2">
        <div className="h-4 w-4 rounded bg-primary" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center gap-2 px-2 h-7 rounded">
        <Skeleton className="h-3 w-3 rounded shrink-0" />
        <Skeleton className="h-1.5 w-20" />
      </div>
      <div className="flex items-center gap-2 px-2 h-7 rounded">
        <Skeleton className="h-3 w-3 rounded shrink-0" />
        <Skeleton className="h-1.5 w-16" />
      </div>
      <div className="flex items-center gap-2 px-2 h-7 rounded bg-accent">
        <div className="h-3 w-3 rounded bg-primary/40 shrink-0" />
        <Skeleton className="h-1.5 w-24 bg-foreground/20" />
      </div>
      <div className="flex items-center gap-2 px-2 h-7 rounded">
        <Skeleton className="h-3 w-3 rounded shrink-0" />
        <Skeleton className="h-1.5 w-14" />
      </div>
      <div className="h-px bg-border my-1" />
      <div className="px-2 mb-1">
        <Skeleton className="h-1.5 w-14" />
      </div>
      {[24, 16, 20].map((w, i) => (
        <div key={i} className="flex items-center gap-2 px-2 h-7">
          <div className="h-2 w-2 rounded-full bg-primary/40 shrink-0" />
          <Skeleton className="h-1.5" style={{ width: w * 4 }} />
        </div>
      ))}
    </div>
  );
}

function Header({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 h-10 border-b border-border">
      {children}
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}

/* ── Tab 1: Automate — workflow pipeline ─────────────────────── */

export function AutomateMockup() {
  const steps = [
    { color: "bg-primary" },
    { color: "bg-primary/60" },
    { color: "bg-primary/40" },
    { color: "bg-primary/20" },
  ];

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header>
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-2 w-10" />
        </Header>
        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex items-start gap-3 justify-center pt-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-[120px] rounded-lg border border-border bg-card p-3 space-y-2 shadow-xs">
                  <Skeleton className="h-1.5 w-16" />
                  <Skeleton className="h-1.5 w-12" />
                  <div className={`h-2.5 w-2.5 rounded-full ${step.color}`} />
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px w-4 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[72%] rounded-full bg-primary/60" />
            </div>
            <span className="text-[11px] text-foreground font-mono font-medium">72%</span>
          </div>
          <div className="space-y-0">
            {[
              { w: 200, dot: "bg-primary", time: "2m ago" },
              { w: 160, dot: "bg-primary/60", time: "5m ago" },
              { w: 180, dot: "bg-muted-foreground/20", time: "12m ago" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-4 h-8">
                <div className={`h-2 w-2 rounded-full ${row.dot} shrink-0`} />
                <Skeleton className="h-1.5" style={{ width: row.w }} />
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">{row.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab 2: Analyze — dashboard with stats + chart ───────────── */

export function AnalyzeMockup() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header>
          <Skeleton className="h-2 w-14" />
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-12" />
        </Header>
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "2,847", change: "+12.5%", changeColor: "text-primary", tint: "from-primary/5" },
              { value: "94.2%", change: "+3.1%", changeColor: "text-primary", tint: "from-primary/5" },
              { value: "1,204", change: "-8%", changeColor: "text-destructive", tint: "from-destructive/5" },
            ].map((stat) => (
              <div
                key={stat.value}
                className={`rounded-lg border border-border bg-gradient-to-t ${stat.tint} to-card p-4 space-y-1 shadow-xs`}
              >
                <Skeleton className="h-1.5 w-16" />
                <span className="text-lg font-semibold text-foreground tabular-nums">{stat.value}</span>
                <span className={`text-[11px] ${stat.changeColor} font-mono font-medium`}>{stat.change}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-2 w-20" />
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <Skeleton className="h-1.5 w-10" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary/30" />
                  <Skeleton className="h-1.5 w-10" />
                </div>
              </div>
            </div>
            <div className="h-[140px] flex items-end gap-1">
              {[40, 55, 35, 65, 45, 70, 50, 80, 60, 75, 55, 85, 65, 90, 70, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/25"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab 3: Act — task tracker with detail panel ─────────────── */

export function ActMockup() {
  const rows = [
    { id: "TRG-142", w: 180, status: "bg-warning", statusDot: "bg-warning" },
    { id: "TRG-139", w: 220, status: "bg-destructive", statusDot: "bg-destructive" },
    { id: "TRG-138", w: 160, status: "bg-warning", statusDot: "bg-primary" },
    { id: "TRG-135", w: 200, status: "bg-primary", statusDot: "bg-primary" },
    { id: "TRG-131", w: 140, status: "bg-muted-foreground/30", statusDot: "bg-primary" },
    { id: "TRG-128", w: 190, status: "bg-warning", statusDot: "bg-warning" },
    { id: "TRG-125", w: 170, status: "bg-primary", statusDot: "bg-primary" },
  ];

  const detailProps = [
    { label: "Status", color: "bg-warning" },
    { label: "Priority", color: "bg-destructive" },
    { label: "Assignee", color: "bg-primary" },
    { label: "Due", color: "bg-muted-foreground/20" },
  ];

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header>
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-12" />
        </Header>
        <div className="flex-1 flex">
          <div className="flex-1">
            {rows.map((row, i) => (
              <div
                key={row.id}
                className={`flex items-center gap-3 px-4 h-9 border-b border-border ${i === 1 ? "bg-muted/50" : ""}`}
              >
                <div className="h-3.5 w-3.5 rounded border border-border flex items-center justify-center shrink-0">
                  <div className={`h-1.5 w-1.5 rounded-sm ${row.status}`} />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">{row.id}</span>
                <Skeleton className="h-1.5" style={{ width: row.w }} />
                <div className="ml-auto flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${row.statusDot}`} />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-[280px] border-l border-border shrink-0 hidden lg:flex flex-col">
            <div className="flex items-center justify-between px-4 h-10 border-b border-border">
              <Skeleton className="h-2.5 w-20" />
              <div className="flex gap-1.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
            <div className="p-4 space-y-4">
              <Skeleton className="h-2.5 w-32" />
              <div className="space-y-1.5">
                <Skeleton className="h-1.5 w-full" />
                <Skeleton className="h-1.5 w-3/4" />
              </div>
              <div className="h-px bg-border" />
              {detailProps.map((prop) => (
                <div key={prop.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{prop.label}</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${prop.color}`} />
                </div>
              ))}
              <div className="h-px bg-border" />
              <div className="space-y-3 pt-1">
                <Skeleton className="h-1.5 w-14" />
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-1.5 w-full" />
                      <Skeleton className="h-1.5 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
