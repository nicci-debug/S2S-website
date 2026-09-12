"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, FieldError } from "@/components/ui/Field";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <Card>
      <h1 className="text-xl font-bold text-zumi-ink">Create your parent account</h1>
      <p className="mt-1 text-sm text-zumi-slate-500">
        Set up Zumi in under a minute, then add your first child.
      </p>

      {state.info ? (
        <p className="mt-4 rounded-xl bg-zumi-mint-400/15 p-3 text-sm font-medium text-zumi-mint-500">
          {state.info}
        </p>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <FieldLabel htmlFor="displayName">Your name</FieldLabel>
            <Input id="displayName" name="displayName" autoComplete="name" required />
          </div>
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <FieldLabel htmlFor="password" hint="8+ characters">
              Password
            </FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <FieldError>{state.error}</FieldError>
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zumi-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-zumi-violet-600">
          Log in
        </Link>
      </p>
    </Card>
  );
}
