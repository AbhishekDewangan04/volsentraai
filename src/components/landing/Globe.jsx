import { cn } from "@/lib/utils";

/** Wireframe grid globe — CSS 3D so it stays crisp and needs no WebGL. */
export default function Globe({ size = 320, className = "", nodes = [] }) {
  const R = size / 2;
  const meridians = Array.from({ length: 9 }, (_, i) => i * 22.5);
  const latitudes = [-62, -32, 0, 32, 62];

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size, perspective: 1000 }} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-brand/15 blur-[70px]" />
      <div className="absolute inset-0 globe-shell" style={{ transformStyle: "preserve-3d" }}>
        {meridians.map((deg) => (
          <div
            key={`m-${deg}`}
            className="absolute inset-0 rounded-full border border-brand/25"
            style={{ transform: `rotateY(${deg}deg)` }}
          />
        ))}
        {latitudes.map((lat) => {
          const r = R * Math.cos((lat * Math.PI) / 180) * 0.97;
          const y = R * Math.sin((lat * Math.PI) / 180);
          return (
            <div
              key={`l-${lat}`}
              className="absolute left-1/2 top-1/2 rounded-full border border-brand/20"
              style={{
                width: r * 2,
                height: r * 2,
                marginLeft: -r,
                marginTop: -r,
                transform: `translateZ(${y}px) rotateX(90deg)`,
              }}
            />
          );
        })}
        {(nodes.length
          ? nodes
          : [
            { a: 20, b: 12, tone: "bg-rose", s: 7 },
            { a: 96, b: -18, tone: "bg-mint", s: 6 },
            { a: 168, b: 24, tone: "bg-sky", s: 6 },
            { a: 244, b: -6, tone: "bg-amber", s: 7 },
            { a: 300, b: 30, tone: "bg-violet", s: 5 },
          ]
        ).map((n, i) => (
          <span
            key={`n-${i}`}
            className="absolute left-1/2 top-1/2 block rounded-full"
            style={{
              width: n.s ?? 6,
              height: n.s ?? 6,
              marginLeft: -(n.s ?? 6) / 2,
              marginTop: -(n.s ?? 6) / 2,
              transform: `rotateY(${n.a}deg) rotateX(${n.b}deg) translateZ(${R * 0.98}px)`,
            }}
          >
            <span className={cn("block h-full w-full rounded-full", n.tone ?? "bg-rose")} />
            <span className={cn("absolute inset-0 animate-pulse-ring rounded-full", n.tone ?? "bg-rose")} />
          </span>
        ))}
      </div>
      <div className="absolute inset-[18%] rounded-full border border-white/5" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(124,92,255,0.22),transparent_58%)]" />
    </div>
  );
}