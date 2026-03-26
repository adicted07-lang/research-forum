import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchBar } from "@/components/shared/search-bar";

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar placeholder="Search..." onChange={onChange} />);
    await user.type(screen.getByPlaceholderText("Search..."), "test");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders search icon", () => {
    render(<SearchBar placeholder="Search..." />);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });
});
