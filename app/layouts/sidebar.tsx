import { useEffect } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigation,
  useSubmit,
} from "react-router";
import { getContacts } from "../actions/contactAction";
import { requireAuth } from "../lib/auth-utils";
import { SignOutButton } from "../components/SignOutButton";
import type { Route } from "./+types/sidebar";

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication for all routes using this layout
  const session = await requireAuth(request);
  
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q, session };
}

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  const { contacts, q, session } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        
        {/* User info and sign out */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #ddd", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
            Signed in as: <strong>{session.user.name}</strong>
          </div>
          <SignOutButton className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">
            Sign Out
          </SignOutButton>
        </div>
        <div>
          <Form
            id="search-form"
            onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, {
                replace: !isFirstSearch,
              });
            }}
            role="search"
          >
            <input
              aria-label="Search contacts"
              className={searching ? "loading" : ""}
              id="q"
              name="q"
              placeholder="Search"
              type="search"
              defaultValue={q || ""}
            />
            <div aria-hidden hidden={!searching} id="search-spinner" />
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                    to={`contacts/${contact.id}`}
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? <span>★</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        className={
          navigation.state === "loading" && !searching ? "loading" : ""
        }
        id="detail"
      >
        <Outlet />
      </div>
    </>
  );
}
