"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, FieldError } from "@/components/ui/Field";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <Card>
      <h1 className="text-xl font-bold text-zumi-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-zumi-slate-500">Log in to your Zumi parent account.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <FieldError>{state.error}</FieldError>
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zumi-slate-500">
        New to Zumi?{" "}
        <Link href="/signup" className="font-semibold text-zumi-violet-600">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
