import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardWrapper } from "@/components/shared/card-wrapper";

describe("CardWrapper", () => {
  it("renders children", () => {
    render(<CardWrapper>Hello</CardWrapper>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies hover styles by default", () => {
    const { container } = render(<CardWrapper>Content</CardWrapper>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("hover:");
  });

  it("renders as a link when href is provided", () => {
    render(<CardWrapper href="/test">Link Card</CardWrapper>);
    const link = screen.getByText("Link Card").closest("a");
    expect(link).toHaveAttribute("href", "/test");
  });
});
