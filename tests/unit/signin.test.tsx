import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import SignIn from "../../app/routes/signin";

// Mock the auth client
vi.mock("../../app/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

import { authClient } from "../../app/lib/auth-client";

describe("SignIn Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in form with all fields", async () => {
    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create a new account/i })).toBeInTheDocument();
  });

  it("submits form with valid data and remember me checked", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(authClient.signIn.email);
    mockSignIn.mockImplementation(async (_, callbacks) => {
      callbacks?.onSuccess?.();
      return { data: { user: { id: "1", email: "test@example.com" } }, error: null };
    });

    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
      {
        path: "/",
        Component: () => <div>Home Page</div>,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");

    // Submit the form (remember me is checked by default)
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
          callbackURL: "/",
          rememberMe: true,
        },
        expect.any(Object)
      );
    });
  });

  it("submits form with remember me unchecked", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(authClient.signIn.email);
    mockSignIn.mockImplementation(async (_, callbacks) => {
      callbacks?.onSuccess?.();
      return { data: { user: { id: "1", email: "test@example.com" } }, error: null };
    });

    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
      {
        path: "/",
        Component: () => <div>Home Page</div>,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    // Uncheck remember me
    await user.click(screen.getByRole("checkbox", { name: /remember me/i }));

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
          callbackURL: "/",
          rememberMe: false,
        },
        expect.any(Object)
      );
    });
  });

  it("displays error message when sign in fails", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(authClient.signIn.email);
    mockSignIn.mockImplementation(async (_, callbacks) => {
      callbacks?.onError?.({ error: { message: "Invalid email or password" } });
      return { data: null, error: { message: "Invalid email or password" } };
    });

    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Email address"), "invalid@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrongpassword");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(authClient.signIn.email);
    
    // Create a promise we can control
    let resolveSignIn: () => void;
    const signInPromise = new Promise<any>((resolve) => {
      resolveSignIn = () => resolve({ data: { user: { id: "1" } }, error: null });
    });
    
    mockSignIn.mockReturnValue(signInPromise);

    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Check loading state
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Resolve the promise
    resolveSignIn!();

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Signing in...")).not.toBeInTheDocument();
    });
  });

  it("has required fields", async () => {
    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("links to sign up page", async () => {
    const Stub = createRoutesStub([
      {
        path: "/signin",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignIn,
      },
    ]);

    render(<Stub initialEntries={["/signin"]} />);

    const signUpLink = screen.getByRole("link", { name: /create a new account/i });
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });
});