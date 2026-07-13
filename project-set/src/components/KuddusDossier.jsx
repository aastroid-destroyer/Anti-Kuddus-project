import { Folder, Warning } from "@phosphor-icons/react";

const violations = [
  {
    code: "WB-001",
    title: "The Washroom Bribe",
    description: "Collected unauthorized fees for bathroom access during lunch break",
    severity: "HIGH",
  },
  {
    code: "TT-002",
    title: "The Tiffin Tax",
    description: "Systematically seized chicken portions from classmates' lunch boxes",
    severity: "CRITICAL",
  },
  {
    code: "FS-003",
    title: "Fake Syllabus Mandates",
    description: "Spread false rumors about surprise exams to induce panic",
    severity: "MEDIUM",
  },
];

// Severity ladder. These warm accents read on both themes; the translucent
// chip tint blends with whatever surface sits behind it, so it never needs a
// per-theme override the way the neutral structure does (that runs on tokens).
const severity = {
  CRITICAL: {
    text: "text-red-500",
    chip: "bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/25",
    bars: 4,
  },
  HIGH: {
    text: "text-orange-500",
    chip: "bg-orange-500/10 text-orange-500 ring-1 ring-inset ring-orange-500/25",
    bars: 3,
  },
  MEDIUM: {
    text: "text-amber-500",
    chip: "bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/25",
    bars: 2,
  },
};

const stats = [
  { label: "Incidents", value: "17" },
  { label: "Victims", value: "43" },
  { label: "Zone", value: "C-4" },
];

const KuddusDossier = () => {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <div className="rise">
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-danger" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-danger/80">
              Classified Dossier — Do Not Distribute
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Subject Profile
          </h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Violations */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rise mb-6 flex items-center gap-2 text-muted" style={{ animationDelay: "0.05s" }}>
              <Folder className="h-4 w-4" weight="duotone" />
              <span className="font-mono text-sm uppercase tracking-wider">
                Recorded Violations
              </span>
              <span className="ml-auto rounded-control border border-danger/25 bg-danger/10 px-2 py-0.5 font-mono text-xs text-danger">
                3 Charges
              </span>
            </div>

            {violations.map((v, i) => {
              const s = severity[v.severity];
              return (
                <div
                  key={v.code}
                  className="rise group relative overflow-hidden rounded-card border border-border bg-surface p-5 shadow-raised transition-[transform,border-color] duration-200 hover:translate-x-1 hover:border-accent/40 motion-reduce:hover:translate-x-0"
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                >
                  <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-br-2xl rounded-tl-card bg-bg font-mono text-xs font-bold text-muted/60">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex flex-col justify-between gap-3 pl-4 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <div className="mb-1.5 flex items-center gap-3">
                        <span className="font-mono text-[10px] tracking-wider text-muted/70">
                          {v.code}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${s.chip}`}>
                          {v.severity}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{v.title}</h3>
                      <p className="text-sm leading-relaxed text-muted">{v.description}</p>
                    </div>

                    <div className={`hidden flex-col items-end gap-1 sm:flex ${s.text}`}>
                      {[...Array(4)].map((_, bar) => (
                        <div
                          key={bar}
                          className={`h-1.5 w-6 rounded-full ${
                            bar < s.bars ? "bg-current opacity-90" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Profile Card */}
          <div className="rise lg:col-span-2" style={{ animationDelay: "0.34s" }}>
            <div className="sticky top-6 overflow-hidden rounded-card border border-border bg-surface shadow-menu">
              <div className="h-1.5 bg-linear-to-r from-red-600 via-red-500 to-orange-500" />

              {/* Illustration */}
              <div className="relative mx-6 mb-4 mt-6 flex aspect-4/3 items-center justify-center overflow-hidden rounded-card border border-border bg-bg">
                <svg
                  viewBox="0 0 200 260"
                  className="h-40 w-32 text-muted/40"
                  fill="currentColor"
                >
                  <ellipse cx="100" cy="45" rx="28" ry="32" />
                  <path d="M55 90 C55 75, 75 70, 100 70 C125 70, 145 75, 145 90 L150 180 C150 190, 140 195, 130 195 L70 195 C60 195, 50 190, 50 180 Z" />
                  <path d="M55 95 L25 145 L35 150 L60 105" />
                  <path d="M145 95 L175 145 L165 150 L140 105" />
                </svg>
                {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map(
                  (pos, i) => (
                    <div
                      key={i}
                      className={`absolute ${pos} h-4 w-4 border border-danger/40 ${
                        i < 2 ? "border-b-0 border-r-0" : "border-l-0 border-t-0"
                      }`}
                    />
                  )
                )}
              </div>

              {/* Info */}
              <div className="space-y-4 px-6 pb-6">
                <div>
                  <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.25em] text-muted">
                    The Top Bully
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">"Kuddus The Taxman"</h2>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">
                    Threat Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
                    </span>
                    <span className="font-mono text-sm font-bold text-danger">Active Menace</span>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-3 gap-3 rounded-control bg-bg py-2">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-control border border-danger/30 bg-danger-bg p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-danger/15 text-danger">
                      <Warning className="h-3.5 w-3.5" weight="fill" />
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-danger">
                        Protocol Advisory
                      </p>
                      <p className="text-sm leading-relaxed text-danger/90">
                        If spotted in the canteen, trigger Protocol immediately. Do not engage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <span className="-rotate-2 rounded-control border border-border bg-bg px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    File #KDS-2024-071
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KuddusDossier;
