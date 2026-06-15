import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

describe("ProtectedRoute (authorization gate)", () => {
  it("redirects an unauthenticated visitor to /login", async () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/app/dashboard" element={<div>SECRET DASHBOARD</div>} />
            </Route>
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    // After auth resolves (demo mode, no session), the guard sends us to login.
    expect(await screen.findByText("LOGIN PAGE")).toBeInTheDocument();
    expect(screen.queryByText("SECRET DASHBOARD")).not.toBeInTheDocument();
  });
});
