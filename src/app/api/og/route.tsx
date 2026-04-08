import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "The Intellectual Exchange";
  const subtitle = searchParams.get("subtitle") || "Research Community & Marketplace";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          backgroundColor: "#21293C",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "11px",
              backgroundColor: "#DA552F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
            }}
          >
            T.I.E
          </div>
          <span style={{ fontSize: "18px", color: "#9CA3AF" }}>
            The Intellectual Exchange
          </span>
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: "900px",
            letterSpacing: "-0.02em",
          }}
        >
          {title.length > 80 ? title.slice(0, 80) + "…" : title}
        </div>
        <div
          style={{
            fontSize: "22px",
            color: "#9CA3AF",
            marginTop: "20px",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            fontSize: "14px",
            color: "#6B7280",
          }}
        >
          theintellectualexchange.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
