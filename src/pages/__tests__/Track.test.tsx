import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Track from "@/pages/Track";

describe("Track page", () => {
  it("renders the questionnaire sections and the live estimate", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Track />
        </AuthProvider>
      </MemoryRouter>,
    );

    // findBy flushes the AuthProvider effect before assertions.
    expect(await screen.findByText("Live estimate")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /track your footprint/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly electricity")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument(); // solar toggle
    expect(screen.getByRole("button", { name: /save & see insights/i })).toBeInTheDocument();
    expect(screen.getByText(/CO2e per year/i)).toBeInTheDocument();
  });
});
