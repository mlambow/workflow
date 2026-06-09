import AuthPage from "../../pages/AuthPage";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Authentication Page" },
    { name: "description", content: "Register or Login to access workspace" },
  ];
}

export default function Auth() {
  return <AuthPage />;
}