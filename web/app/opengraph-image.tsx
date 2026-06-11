import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#0B0D12",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "8px",
          height: "100%",
          backgroundColor: "#E8643C",
          display: "flex",
        }}
      />

      {/* Site name */}
      <div
        style={{
          display: "flex",
          fontSize: "24px",
          color: "#8A8F98",
          letterSpacing: "0.2em",
          marginBottom: "24px",
        }}
      >
        LEAKWIRE
      </div>

      {/* Main headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: "72px",
          fontWeight: "bold",
          color: "#F2F3F5",
          lineHeight: 1.1,
          marginBottom: "24px",
        }}
      >
        <span>
          Every <span style={{ color: "#E8643C" }}>GTA VI</span> signal.
        </span>
        <span>One feed.</span>
      </div>

      {/* Tagline */}
      <div style={{ display: "flex", fontSize: "28px", color: "#8A8F98" }}>
        Confirmed news · Credible leaks · Community rumours
      </div>

      {/* Bottom stats bar */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "80px",
          display: "flex",
          gap: "40px",
        }}
      >
        {[
          { color: "#5BC98A", label: "CONFIRMED" },
          { color: "#EDB14F", label: "LIKELY" },
          { color: "#E0716F", label: "RUMOUR" },
        ].map((tier) => (
          <div
            key={tier.label}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: tier.color,
                display: "flex",
              }}
            />
            <span
              style={{
                color: tier.color,
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {tier.label}
            </span>
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
