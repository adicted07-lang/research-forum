import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EndorseButton } from "@/components/profile/endorse-button";

vi.mock("@/server/actions/endorsements", () => ({
  toggleEndorsement: vi.fn(),
}));

describe("EndorseButton", () => {
  it("renders +1 button when not endorsed", () => {
    render(<EndorseButton endorseeId="user2" skill="survey-design" endorsed={false} />);
    expect(screen.getByRole("button", { name: /endorse/i })).toBeInTheDocument();
  });

  it("renders filled state when already endorsed", () => {
    render(<EndorseButton endorseeId="user2" skill="survey-design" endorsed={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-endorsed", "true");
  });

  it("calls toggleEndorsement on click", async () => {
    const user = userEvent.setup();
    const { toggleEndorsement } = await import("@/server/actions/endorsements");
    vi.mocked(toggleEndorsement).mockResolvedValue({ success: true, endorsed: true });

    render(<EndorseButton endorseeId="user2" skill="survey-design" endorsed={false} />);
    await user.click(screen.getByRole("button"));
    expect(toggleEndorsement).toHaveBeenCalledWith("user2", "survey-design");
  });
});
