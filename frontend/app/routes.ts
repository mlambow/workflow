import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("auth", "routes/auth.tsx"),
  
    layout("layouts/ProtectedLayout.tsx", [
      route("dashboard", "routes/dashboard.tsx"),
      route("projects/:id", "routes/projectPage.tsx"),
    ]),
] satisfies RouteConfig;
