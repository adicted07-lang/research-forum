import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BadgePill } from "@/components/shared/badge-pill";

describe("BadgePill", () => {
  it("renders label text", () => {
    render(<BadgePill label="NLP" />);
    expect(screen.getByText("NLP")).toBeInTheDocument();
  });

  it("applies variant styles", () => {
    const { container } = render(<BadgePill label="Bounty" variant="bounty" />);
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toContain("text-yellow");
  });

  it("applies default variant when none specified", () => {
    const { container } = render(<BadgePill label="Tag" />);
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toContain("bg-surface");
  });
});
