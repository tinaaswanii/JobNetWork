import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { POSITIONING_LINE } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// 1200x630 share card: logo, brand, the positioning line and an optional
// section label. Colours are the site's own (navy, electric blue, cyan).
export async function renderOg(section?: { label: string; line: string }) {
  // public/Logo.png is a JPEG; read it once and inline it.
  const logo = await readFile(path.join(process.cwd(), "public", "Logo.png"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#EAF0FF",
          backgroundColor: "#09152B",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(65,105,241,0.55), rgba(9,21,43,0) 55%), radial-gradient(circle at 95% 100%, rgba(114,229,255,0.30), rgba(9,21,43,0) 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" style={{ borderRadius: 48 }} />
          <div style={{ display: "flex", marginLeft: 28, fontSize: 52, fontWeight: 700 }}>JobNetWork</div>
          {section && (
            <div
              style={{
                display: "flex",
                marginLeft: 32,
                padding: "10px 24px",
                borderRadius: 999,
                fontSize: 30,
                fontWeight: 600,
                color: "#09152B",
                backgroundColor: "#72E5FF",
              }}
            >
              {section.label}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: section ? 68 : 74, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
            {section ? section.line : POSITIONING_LINE}
          </div>
          {section && (
            <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#A9B8D2" }}>{POSITIONING_LINE}</div>
          )}
        </div>

        <div style={{ display: "flex", height: 10, width: "100%", borderRadius: 5, backgroundImage: "linear-gradient(90deg, #4169F1, #72E5FF)" }} />
      </div>
    ),
    OG_SIZE
  );
}
