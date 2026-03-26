import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { UpvoteButton } from "@/components/shared/upvote-button";

describe("UpvoteButton", () => {
  it("renders the vote count", () => {
    render(<UpvoteButton count={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders in inactive state by default", () => {
    render(<UpvoteButton count={10} />);
    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("data-active", "true");
  });

  it("renders in active state when isActive is true", () => {
    render(<UpvoteButton count={10} isActive />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-active", "true");
  });

  it("calls onVote when clicked", async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();
    render(<UpvoteButton count={10} onVote={onVote} />);
    await user.click(screen.getByRole("button"));
    expect(onVote).toHaveBeenCalledOnce();
  });

  it("shows arrow pointing up", () => {
    render(<UpvoteButton count={5} />);
    expect(screen.getByTestId("upvote-arrow")).toBeInTheDocument();
  });
});
