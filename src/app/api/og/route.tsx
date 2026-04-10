import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  // ── Article card ──────────────────────────────────────────────────────────
  if (type === "article") {
    const title = searchParams.get("title") || "Untitled Article";
    const author = searchParams.get("author") || "";
    const readTime = searchParams.get("readTime") || "";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px",
            backgroundColor: "#21293C",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "12px",
                height: "44px",
                borderRadius: "3px",
                backgroundColor: "#b8461f",
              }}
            />
            <span style={{ fontSize: "16px", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Article
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "960px",
              letterSpacing: "-0.02em",
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            {title.length > 90 ? title.slice(0, 90) + "…" : title}
          </div>

          {/* Footer row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              {author && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#b8461f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {author.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "18px", color: "#D1D5DB" }}>{author}</span>
                </div>
              )}
              {readTime && (
                <span style={{ fontSize: "16px", color: "#6B7280" }}>
                  {readTime} min read
                </span>
              )}
            </div>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>
              theintellectualexchange.com
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ── Question card ─────────────────────────────────────────────────────────
  if (type === "question") {
    const title = searchParams.get("title") || "Untitled Question";
    const answers = searchParams.get("answers") || "0";
    const upvotes = searchParams.get("upvotes") || "0";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px",
            backgroundColor: "#21293C",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "12px",
                height: "44px",
                borderRadius: "3px",
                backgroundColor: "#b8461f",
              }}
            />
            <span style={{ fontSize: "16px", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Forum Question
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "960px",
              letterSpacing: "-0.02em",
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            {title.length > 90 ? title.slice(0, 90) + "…" : title}
          </div>

          {/* Stats + branding */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#2D3748",
                  borderRadius: "12px",
                  padding: "12px 24px",
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: 700, color: "white" }}>{answers}</span>
                <span style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>
                  {Number(answers) === 1 ? "Answer" : "Answers"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#2D3748",
                  borderRadius: "12px",
                  padding: "12px 24px",
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#b8461f" }}>{upvotes}</span>
                <span style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>Upvotes</span>
              </div>
            </div>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>
              theintellectualexchange.com
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ── Profile card ──────────────────────────────────────────────────────────
  if (type === "profile") {
    const name = searchParams.get("name") || "Researcher";
    const expertise = searchParams.get("expertise") || "";
    const points = searchParams.get("points") || "0";
    const expertiseTags = expertise ? expertise.split(",").filter(Boolean) : [];

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px",
            backgroundColor: "#21293C",
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "12px",
                height: "44px",
                borderRadius: "3px",
                backgroundColor: "#b8461f",
              }}
            />
            <span style={{ fontSize: "16px", color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Researcher Profile
            </span>
          </div>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: "#b8461f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "52px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {name.length > 30 ? name.slice(0, 30) + "…" : name}
              </span>
              {expertiseTags.length > 0 && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "16px",
                        backgroundColor: "#2D3748",
                        color: "#9CA3AF",
                        borderRadius: "6px",
                        padding: "4px 12px",
                      }}
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Points + branding */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "32px", fontWeight: 700, color: "#b8461f" }}>{Number(points).toLocaleString()}</span>
              <span style={{ fontSize: "18px", color: "#9CA3AF" }}>reputation points</span>
            </div>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>
              theintellectualexchange.com
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ── Default (backwards-compatible) ───────────────────────────────────────
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
              backgroundColor: "#b8461f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
            }}
          >
            The Intellectual Exchange
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
