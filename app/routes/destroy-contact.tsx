import { redirect } from "react-router";
import type { Route } from "./+types/edit-contact";

import { deleteContact } from "../actions/contactAction";

export async function action({ params }: Route.ActionArgs) {
  await deleteContact(params.contactId);
  return redirect(`/`);
}
