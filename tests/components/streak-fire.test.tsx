import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StreakFire } from "@/components/shared/streak-fire";

describe("StreakFire", () => {
  it("renders the streak count", () => {
    render(<StreakFire count={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows tooltip with streak info", () => {
    render(<StreakFire count={42} />);
    expect(screen.getByTitle("42-day streak")).toBeInTheDocument();
  });
});
