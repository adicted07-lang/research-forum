import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders status text in uppercase", () => {
    render(<StatusBadge status="open" />);
    expect(screen.getByText("OPEN")).toBeInTheDocument();
  });

  it("applies success style for open status", () => {
    const { container } = render(<StatusBadge status="open" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-success");
  });

  it("applies info style for answered status", () => {
    const { container } = render(<StatusBadge status="answered" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-info");
  });
});
