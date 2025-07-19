import { vi } from "vitest";

// Mock session data for tests
export const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  emailVerified: false,
  image: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const mockSession = {
  id: "test-session-id",
  userId: mockUser.id,
  user: mockUser,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  expiresAt: "2024-12-31T23:59:59.000Z",
  token: "test-session-token",
  ipAddress: "127.0.0.1",
  userAgent: "test-user-agent",
};

// Mock the auth utility functions
export function mockAuthUtils() {
  return {
    requireAuth: vi.fn(),
    redirectIfAuthenticated: vi.fn(),
  };
}

// Helper to mock authenticated state
export function mockAuthenticatedUser() {
  const authUtils = mockAuthUtils();
  authUtils.requireAuth.mockResolvedValue(mockSession);
  authUtils.redirectIfAuthenticated.mockResolvedValue(null);
  
  // Mock the auth module
  vi.doMock("../../app/lib/auth-utils", () => authUtils);
  
  return { authUtils, session: mockSession, user: mockUser };
}

// Helper to mock unauthenticated state
export function mockUnauthenticatedUser() {
  const authUtils = mockAuthUtils();
  
  // Mock redirect by throwing it (as requireAuth does)
  const redirectError = new Response(null, {
    status: 302,
    headers: { Location: "/signin" },
  });
  
  authUtils.requireAuth.mockImplementation(() => {
    throw redirectError;
  });
  authUtils.redirectIfAuthenticated.mockResolvedValue(null);
  
  // Mock the auth module
  vi.doMock("../../app/lib/auth-utils", () => authUtils);
  
  return { authUtils, redirectError };
}

// Helper to reset auth mocks
export function resetAuthMocks() {
  vi.clearAllMocks();
  vi.resetModules();
}