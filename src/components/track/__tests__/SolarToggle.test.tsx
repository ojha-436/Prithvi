import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolarToggle } from "@/components/track/SolarToggle";

describe("SolarToggle", () => {
  it("is an accessible radio group with a legend, reflecting the current value", () => {
    render(<SolarToggle value={false} onChange={() => {}} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByText("Rooftop solar?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "No" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Yes" })).not.toBeChecked();
  });

  it("calls onChange(true) when Yes is selected", async () => {
    const onChange = vi.fn();
    render(<SolarToggle value={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Yes" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange(false) when No is selected", async () => {
    const onChange = vi.fn();
    render(<SolarToggle value={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
