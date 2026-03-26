import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectionHeader } from "@/components/shared/section-header";

describe("SectionHeader", () => {
  it("renders title", () => {
    render(<SectionHeader title="Trending Questions" />);
    expect(screen.getByText("Trending Questions")).toBeInTheDocument();
  });

  it("renders link when href is provided", () => {
    render(<SectionHeader title="News" href="/news" linkText="View all" />);
    const link = screen.getByText("View all");
    expect(link).toHaveAttribute("href", "/news");
  });

  it("does not render link when href is not provided", () => {
    render(<SectionHeader title="News" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
