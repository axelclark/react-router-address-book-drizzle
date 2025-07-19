import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
  // Authentication routes (public)
  route("signin", "routes/signin.tsx"),
  route("signup", "routes/signup.tsx"),
  route("signout", "routes/signout.tsx"),
  route("api/auth/*", "routes/api.auth.$.ts"),
  
  // Protected routes (require authentication)
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("contacts/:contactId", "routes/contact.tsx"),
    route("contacts/:contactId/edit", "routes/edit-contact.tsx"),
    route("contacts/:contactId/destroy", "routes/destroy-contact.tsx"),
  ]),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
