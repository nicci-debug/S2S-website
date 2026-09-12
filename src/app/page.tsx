import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SUBJECT_CHIPS = ["English", "Afrikaans", "Mathematics"];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zumi-cloud">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <span className="text-xl font-extrabold text-zumi-violet-700">zumi</span>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        <section className="grid gap-10 py-12 sm:grid-cols-2 sm:items-center sm:py-20">
          <div>
            <span className="inline-block rounded-full bg-zumi-violet-100 px-4 py-1 text-sm font-semibold text-zumi-violet-700">
              Made for South African families
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-zumi-ink sm:text-5xl">
              Turn this week&apos;s schoolwork into{" "}
              <span className="text-zumi-violet-600">10 minutes</span> of personalised practice.
            </h1>
            <p className="mt-4 text-lg text-zumi-slate-500">
              Paste a spelling list, a vocab sheet, or a maths topic. Zumi turns it into a short,
              game-based session your child can play on their own.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SUBJECT_CHIPS.map((subject) => (
                <span
                  key={subject}
                  className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-zumi-ink shadow-sm ring-1 ring-zumi-slate-200"
                >
                  {subject}
                </span>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Link href="/signup">
                <Button size="lg">Create your child&apos;s first practice</Button>
              </Link>
            </div>
          </div>

          <Card className="bg-white">
            <p className="text-xs font-bold uppercase tracking-wide text-zumi-coral-500">
              Parent input
            </p>
            <div className="mt-2 rounded-2xl bg-zumi-violet-50 p-4 text-sm text-zumi-ink">
              Afrikaans spelling:
              <br />
              padda, fabel, sprokie, goue bal, belowe
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-zumi-mint-500">
              Zumi generates
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {["Flash cards", "Matching", "Spelling", "Quick quiz"].map((activity) => (
                <span
                  key={activity}
                  className="rounded-full bg-zumi-mint-400/15 px-3 py-1 font-semibold text-zumi-mint-500"
                >
                  {activity}
                </span>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Your content, gamified",
              body: "Spelling lists, vocab, homework — turned into flash cards, quizzes and games.",
            },
            {
              title: "Adapts as they learn",
              body: "Zumi tracks mastery per skill and brings back what needs more practice.",
            },
            {
              title: "Built for parents",
              body: "Clear weekly insights: what's improving, what needs focus, no noise.",
            },
          ].map((feature) => (
            <Card key={feature.title}>
              <h3 className="font-bold text-zumi-ink">{feature.title}</h3>
              <p className="mt-2 text-sm text-zumi-slate-500">{feature.body}</p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
