import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders a textarea and merges a custom className", () => {
    render(<Textarea placeholder="Say something" className="custom-class" />);
    const el = screen.getByPlaceholderText("Say something");
    expect(el.tagName).toBe("TEXTAREA");
    expect(el).toHaveClass("custom-class");
  });

  it("forwards arbitrary props (e.g. maxLength)", () => {
    render(<Textarea aria-label="note" maxLength={100} />);
    expect(screen.getByLabelText("note")).toHaveAttribute("maxlength", "100");
  });
});
