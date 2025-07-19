import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import { SignOutButton } from "../../app/components/SignOutButton";

// Mock the auth client
vi.mock("../../app/lib/auth-client", () => ({
  signOut: vi.fn(),
}));

import { signOut } from "../../app/lib/auth-client";

describe("SignOutButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default text and styling", async () => {
    const TestComponent = () => (
      <div>
        <SignOutButton />
      </div>
    );

    const Stub = createRoutesStub([
      {
        path: "/",
        Component: TestComponent,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    const button = screen.getByRole("button", { name: /sign out/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-red-600", "hover:bg-red-700", "text-white");
  });

  it("renders with custom children and className", async () => {
    const TestComponent = () => (
      <div>
        <SignOutButton className="custom-class">
          Custom Sign Out Text
        </SignOutButton>
      </div>
    );

    const Stub = createRoutesStub([
      {
        path: "/",
        Component: TestComponent,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    const button = screen.getByRole("button", { name: /custom sign out text/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("custom-class");
  });

  it("calls signOut and navigates on successful sign out", async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.mocked(signOut);
    
    mockSignOut.mockImplementation(async (options) => {
      options?.fetchOptions?.onSuccess?.();
      return { data: null, error: null };
    });

    const TestComponent = () => (
      <div>
        <SignOutButton />
      </div>
    );

    const Stub = createRoutesStub([
      {
        path: "/",
        Component: TestComponent,
      },
      {
        path: "/signin",
        Component: () => <div>Sign In Page</div>,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    const button = screen.getByRole("button", { name: /sign out/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        fetchOptions: {
          onSuccess: expect.any(Function),
        },
      });
    });
  });

  it("shows loading state during sign out", async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.mocked(signOut);
    
    // Create a promise we can control
    let resolveSignOut: () => void;
    const signOutPromise = new Promise<any>((resolve) => {
      resolveSignOut = () => resolve({ data: null, error: null });
    });
    
    mockSignOut.mockReturnValue(signOutPromise);

    const TestComponent = () => (
      <div>
        <SignOutButton />
      </div>
    );

    const Stub = createRoutesStub([
      {
        path: "/",
        Component: TestComponent,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    const button = screen.getByRole("button", { name: /sign out/i });
    await user.click(button);

    // Check loading state
    expect(screen.getByText("Signing out...")).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Resolve the promise
    resolveSignOut!();

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Signing out...")).not.toBeInTheDocument();
    });
  });

  it("handles sign out errors gracefully", async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.mocked(signOut);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    mockSignOut.mockRejectedValue(new Error("Sign out failed"));

    const TestComponent = () => (
      <div>
        <SignOutButton />
      </div>
    );

    const Stub = createRoutesStub([
      {
        path: "/",
        Component: TestComponent,
      },
    ]);

    render(<Stub initialEntries={["/"]} />);

    const button = screen.getByRole("button", { name: /sign out/i });
    await user.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Sign out error:", expect.any(Error));
    });

    // Button should not be disabled anymore
    expect(button).not.toBeDisabled();
    expect(screen.getByText("Sign out")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});