import React from "react";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { vi } from "vitest";
import Contact from "../../app/routes/contact";

vi.mock("../../app/actions/contactAction", () => ({
  getContact: vi.fn(),
  updateContact: vi.fn(),
}));

const mockContact = {
  id: "1",
  first: "John",
  last: "Doe",
  avatar: "https://example.com/avatar.jpg",
  twitter: "johndoe",
  notes: "A test contact",
  favorite: false,
};

describe("Contact Component", () => {
  it("renders contact information correctly", async () => {
    const Stub = createRoutesStub([
      {
        path: "/contact/:contactId",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: Contact,
        loader() {
          return { contact: mockContact };
        },
      },
    ]);

    render(<Stub initialEntries={["/contact/1"]} />);

    await screen.findByText("John Doe");
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("A test contact")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("displays no name when first and last are empty", async () => {
    const contactWithoutName = { ...mockContact, first: "", last: "" };
    
    const Stub = createRoutesStub([
      {
        path: "/contact/:contactId",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: Contact,
        loader() {
          return { contact: contactWithoutName };
        },
      },
    ]);

    render(<Stub initialEntries={["/contact/1"]} />);

    await screen.findByText("No Name");
    expect(screen.getByText("No Name")).toBeInTheDocument();
  });

  it("shows favorite star when contact is favorited", async () => {
    const favoriteContact = { ...mockContact, favorite: true };
    
    const Stub = createRoutesStub([
      {
        path: "/contact/:contactId",
        // @ts-expect-error - Known issue with createRoutesStub and Route.ComponentProps in React Router v7
        Component: Contact,
        loader() {
          return { contact: favoriteContact };
        },
      },
    ]);

    render(<Stub initialEntries={["/contact/1"]} />);

    await screen.findByText("★");
    expect(screen.getByRole("button", { name: /remove from favorites/i })).toBeInTheDocument();
    expect(screen.getByText("★")).toBeInTheDocument();
  });
});