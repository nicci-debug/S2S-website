import type { Metadata } from "next";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Sign up — Zumi" };

export default function SignUpPage() {
  return <SignUpForm />;
}
