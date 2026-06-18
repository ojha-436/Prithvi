import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberField } from "@/components/track/NumberField";

describe("NumberField", () => {
  it("associates the visible label with the input via id/htmlFor", () => {
    render(<NumberField id="elec" label="Monthly electricity" value={250} onChange={() => {}} />);
    expect(screen.getByLabelText("Monthly electricity")).toHaveAttribute("id", "elec");
  });

  it("links the hint to the input via aria-describedby", () => {
    render(
      <NumberField
        id="elec"
        label="Electricity"
        value={0}
        onChange={() => {}}
        hint="From your bill"
      />,
    );
    const input = screen.getByLabelText("Electricity");
    const hint = screen.getByText("From your bill");
    expect(hint.id).toBeTruthy();
    expect(input).toHaveAttribute("aria-describedby", hint.id);
  });

  it("clamps negative input to zero", () => {
    const onChange = vi.fn();
    render(<NumberField id="x" label="X" value={5} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "-3" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("passes a valid number straight through", () => {
    const onChange = vi.fn();
    render(<NumberField id="x" label="X" value={0} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "300" } });
    expect(onChange).toHaveBeenCalledWith(300);
  });
});
