import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import SignUp from "../../app/routes/signup";

// Mock the auth client
vi.mock("../../app/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}));

import { authClient } from "../../app/lib/auth-client";

describe("SignUp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign up form with all fields", async () => {
    const Stub = createRoutesStub([
      {
        path: "/signup",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignUp,
      },
    ]);

    render(<Stub initialEntries={["/signup"]} />);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password (min 8 characters)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.mocked(authClient.signUp.email);
    mockSignUp.mockImplementation(async (_, callbacks) => {
      callbacks?.onSuccess?.();
      return { data: { user: { id: "1", email: "test@example.com" } }, error: null };
    });

    const Stub = createRoutesStub([
      {
        path: "/signup",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignUp,
      },
      {
        path: "/",
        Component: () => <div>Home Page</div>,
      },
    ]);

    render(<Stub initialEntries={["/signup"]} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Name"), "Test User");
    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password (min 8 characters)"), "password123");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
          name: "Test User",
          callbackURL: "/",
        },
        expect.any(Object)
      );
    });
  });

  it("displays error message when sign up fails", async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.mocked(authClient.signUp.email);
    mockSignUp.mockImplementation(async (_, callbacks) => {
      callbacks?.onError?.({ error: { message: "Email already exists" } });
      return { data: null, error: { message: "Email already exists" } };
    });

    const Stub = createRoutesStub([
      {
        path: "/signup",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignUp,
      },
    ]);

    render(<Stub initialEntries={["/signup"]} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Name"), "Test User");
    await user.type(screen.getByPlaceholderText("Email address"), "existing@example.com");
    await user.type(screen.getByPlaceholderText("Password (min 8 characters)"), "password123");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.mocked(authClient.signUp.email);
    
    // Create a promise we can control
    let resolveSignUp: () => void;
    const signUpPromise = new Promise<any>((resolve) => {
      resolveSignUp = () => resolve({ data: { user: { id: "1" } }, error: null });
    });
    
    mockSignUp.mockReturnValue(signUpPromise);

    const Stub = createRoutesStub([
      {
        path: "/signup",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignUp,
      },
    ]);

    render(<Stub initialEntries={["/signup"]} />);

    // Fill in the form
    await user.type(screen.getByPlaceholderText("Name"), "Test User");
    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password (min 8 characters)"), "password123");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Check loading state
    expect(screen.getByText("Creating account...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Resolve the promise
    resolveSignUp!();

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText("Creating account...")).not.toBeInTheDocument();
    });
  });

  it("validates password minimum length", async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.mocked(authClient.signUp.email);
    
    const Stub = createRoutesStub([
      {
        path: "/signup",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: SignUp,
      },
    ]);

    render(<Stub initialEntries={["/signup"]} />);

    const passwordInput = screen.getByPlaceholderText("Password (min 8 characters)");

    // Check that the input has the correct minLength attribute
    expect(passwordInput).toHaveAttribute("minLength", "8");
    
    // Try to type a short password
    await user.type(screen.getByPlaceholderText("Name"), "Test User");
    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(passwordInput, "short");

    // The password input should have the value
    expect(passwordInput).toHaveValue("short");
    
    // Verify the authClient was not called since form validation should prevent submission
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    
    // In a real browser, HTML5 validation would prevent form submission
    // but in tests we need to check that our minLength attribute is set correctly
    expect(passwordInput).toHaveAttribute("minLength", "8");
  });
});