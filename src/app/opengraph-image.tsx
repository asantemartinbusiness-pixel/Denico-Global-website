import { ImageResponse } from "next/og";

export const alt = "Denico Global — long-term holding company";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#111111",
          color: "#f2f0ea",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontSize: 44 }}>Denico</span>
          <span style={{ fontSize: 20, letterSpacing: 8, textTransform: "uppercase" }}>Global</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ width: 64, height: 2, background: "#b9a57e" }} />
          <div style={{ fontSize: 64, lineHeight: 1.1, maxWidth: 900 }}>A long-term holding company.</div>
          <div style={{ fontSize: 28, color: "#a8a49b", maxWidth: 900 }}>
            Disciplined capital allocation with active operational oversight.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
