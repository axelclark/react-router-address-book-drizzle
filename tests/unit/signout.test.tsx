import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import SignOut from "../../app/routes/signout";

// Mock the auth client
vi.mock("../../app/lib/auth-client", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

import { useSession, signOut } from "../../app/lib/auth-client";

const mockSession = {
  user: {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
  },
  createdAt: "2024-01-01T00:00:00.000Z",
};

describe("SignOut Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when session is pending", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    });

    const Stub = createRoutesStub([
      {
        path: "/signout",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignOut,
      },
    ]);

    render(<Stub initialEntries={["/signout"]} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    // Check for the spinner div
    const spinnerDiv = screen.getByText("Loading...").previousElementSibling;
    expect(spinnerDiv).toHaveClass("animate-spin");
  });

  it("shows not signed in message when no session", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    });

    const Stub = createRoutesStub([
      {
        path: "/signout",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignOut,
      },
    ]);

    render(<Stub initialEntries={["/signout"]} />);

    expect(screen.getByText("You're not signed in")).toBeInTheDocument();
    expect(screen.getByText("Please sign in to access your account.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: /create account/i })).toHaveAttribute("href", "/signup");
  });

  it("displays user session information when signed in", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    });

    const Stub = createRoutesStub([
      {
        path: "/signout",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignOut,
      },
    ]);

    render(<Stub initialEntries={["/signout"]} />);

    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("12/31/2023")).toBeInTheDocument(); // formatted date
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("handles sign out successfully", async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.mocked(signOut);
    
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    });

    mockSignOut.mockImplementation(async (options) => {
      options?.fetchOptions?.onSuccess?.();
      return { data: null, error: null };
    });

    const Stub = createRoutesStub([
      {
        path: "/signout",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignOut,
      },
      {
        path: "/signin",
        Component: () => <div>Sign In Page</div>,
      },
    ]);

    render(<Stub initialEntries={["/signout"]} />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    await user.click(signOutButton);

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
    
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    });

    // Create a promise we can control
    let resolveSignOut: () => void;
    const signOutPromise = new Promise<any>((resolve) => {
      resolveSignOut = () => resolve({ data: null, error: null });
    });
    
    mockSignOut.mockReturnValue(signOutPromise);

    const Stub = createRoutesStub([
      {
        path: "/signout",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignOut,
      },
    ]);

    render(<Stub initialEntries={["/signout"]} />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    await user.click(signOutButton);

    // Check loading state
    expect(screen.getByText("Signing out...")).toBeInTheDocument();
    expect(signOutButton).toBeDisabled();

    // Resolve the promise
    resolveSignOut!();

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Signing out...")).not.toBeInTheDocument();
    });
  });
});