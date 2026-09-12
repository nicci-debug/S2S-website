import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in — Zumi" };

export default function LoginPage() {
  return <LoginForm />;
}
