import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zumi-violet-50 px-4 py-12">
      <Link href="/" className="mb-8 text-2xl font-extrabold text-zumi-violet-700">
        zumi
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
