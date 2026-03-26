import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TopNav } from "@/components/layout/top-nav";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/forum",
}));

describe("TopNav", () => {
  it("renders the logo", () => {
    render(<TopNav />);
    expect(screen.getByText("ResearchHub")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<TopNav />);
    expect(screen.getByText("Forum")).toBeInTheDocument();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Hire")).toBeInTheDocument();
    expect(screen.getByText("News")).toBeInTheDocument();
    expect(screen.getByText("Advertise")).toBeInTheDocument();
  });

  it("renders search bar", () => {
    render(<TopNav />);
    expect(
      screen.getByPlaceholderText("Search questions, researchers, tools...")
    ).toBeInTheDocument();
  });

  it("renders ask question button", () => {
    render(<TopNav />);
    expect(screen.getByText("Ask Question")).toBeInTheDocument();
  });
});
