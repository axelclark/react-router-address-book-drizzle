import { Link } from "react-router";
import { useSession } from "../lib/auth-client";
import { SignOutButton } from "../components/SignOutButton";

export default function SignOut() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              You're not signed in
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to access your account.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              to="/signin"
              className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="block w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Account Settings
          </h2>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Your Account</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {session.user.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {session.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Signed in:</span>{" "}
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 text-center"
                >
                  Back to Home
                </Link>
                <SignOutButton className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}