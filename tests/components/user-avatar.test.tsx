import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UserAvatar } from "@/components/shared/user-avatar";

describe("UserAvatar", () => {
  it("renders initials when no image is provided", () => {
    render(<UserAvatar name="Sarah Chen" />);
    expect(screen.getByText("SC")).toBeInTheDocument();
  });

  it("renders single initial for single-word name", () => {
    render(<UserAvatar name="Sarah" />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("renders image when src is provided", () => {
    render(<UserAvatar name="Sarah Chen" src="/avatar.jpg" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src");
  });

  it("applies size classes", () => {
    const { container } = render(<UserAvatar name="Sarah" size="lg" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain("w-10");
  });
});
