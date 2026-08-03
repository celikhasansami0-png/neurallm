import Link from "next/link";
import { ShieldCheck, Lock, FileCheck, Globe, Eye, KeyRound } from "lucide-react";

const AGENTS = [
  { name: "CEO", role: "Chief Executive Officer", desc: "Drafts directives and routes work across the company." },
  { name: "CEO Office", role: "Chief of Staff", desc: "Owns executive comms and calendar." },
  { name: "CTO", role: "Chief Technology Officer", desc: "Runs the technical roadmap and briefs." },
  { name: "CFO", role: "Chief Financial Officer", desc: "Owns budgets, fiscal briefs, spend approvals." },
  { name: "Product Manager", role: "Product Manager", desc: "Writes PRDs and maintains the roadmap." },
  { name: "Software Engineer", role: "Software Engineer", desc: "Triages issues and reviews code." },
];

const INTEGRATIONS = [
  "Gmail", "Google Calendar", "Slack", "GitHub", "Notion", "Linear", "Salesforce", "HubSpot",
  "Stripe", "QuickBooks", "Zoom", "Google Drive", "Jira", "Zendesk", "Airtable", "Asana",
  "Confluence", "Dropbox", "Intercom", "DocuSign",
];

const SECURITY_BADGES = [
  { icon: ShieldCheck, label: "SOC 2" },
  { icon: Globe, label: "GDPR" },
  { icon: Lock, label: "AES-256" },
  { icon: KeyRound, label: "TLS 1.3" },
  { icon: Eye, label: "PII Redaction" },
  { icon: FileCheck, label: "Audit Trail" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">NeuraLLM</span>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#architecture" className="hover:text-foreground">Architecture</a>
            <a href="#agents" className="hover:text-foreground">Agents</a>
            <a href="#integrations" className="hover:text-foreground">Integrations</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium">Log in</Link>
            <Link href="/signup" className="control bg-black px-4 py-2 text-sm font-medium text-white">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-5xl font-semibold tracking-tight">Your company's AI operating system.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          NeuraLLM connects the tools you already use, staffs a full org chart of AI agents, and
          logs every action for audit — so your team ships more without giving up control.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="control bg-black px-6 py-3 text-sm font-medium text-white">Start free</Link>
          <a href="#architecture" className="control border border-border px-6 py-3 text-sm font-medium">See how it works</a>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">How it works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Connect", desc: "Link Gmail, GitHub, Slack, and 1,000+ other tools through secure OAuth in a few clicks." },
              { step: "02", title: "Ask", desc: "Tell NeuraLLM what you need in plain language — it routes the request to the right agent." },
              { step: "03", title: "Act", desc: "Agents plan, execute, and log every step. High-risk actions pause for your approval." },
            ].map((item) => (
              <div key={item.step} className="card p-6">
                <div className="text-xs font-mono text-muted">{item.step}</div>
                <div className="mt-2 text-lg font-semibold">{item.title}</div>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">A three-layer architecture built for control</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
            Every request passes through three distinct layers, each with a clear job and a clear boundary.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-muted">Layer 1</div>
              <div className="mt-1 text-lg font-semibold">Router</div>
              <p className="mt-2 text-sm text-muted">
                Classifies each request with keyword matching first, LLM classification as a
                fallback, targeting sub-150ms decisions. Defaults to the CEO agent when unsure.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-muted">Layer 2</div>
              <div className="mt-1 text-lg font-semibold">Orchestrator</div>
              <p className="mt-2 text-sm text-muted">
                Runs on Groq's llama-3.3-70b-versatile to break work into a multi-step plan and
                coordinate the agents needed to complete it.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-muted">Layer 3</div>
              <div className="mt-1 text-lg font-semibold">Executors</div>
              <p className="mt-2 text-sm text-muted">
                Each agent runs with its own system prompt, allowed tools, org position, and
                persistent memory. Every tool call is logged and never exceeds its IAM scope.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">Six agents, staffed on day one</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
            Every new workspace is seeded with a working org chart. Add more agents any time.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {AGENTS.map((agent) => (
              <div key={agent.name} className="card p-5">
                <div className="agent-name text-sm font-semibold">{agent.name}</div>
                <div className="mt-0.5 text-xs text-muted">{agent.role}</div>
                <p className="mt-3 text-sm">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">Connects to 1,000+ tools</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
            Powered by Composio's OAuth infrastructure — connect once, and every agent can use it
            within its permitted scope.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {INTEGRATIONS.map((name) => (
              <span key={name} className="control border border-border px-3 py-1.5 text-sm">{name}</span>
            ))}
            <span className="control border border-border px-3 py-1.5 text-sm text-muted">+980 more</span>
          </div>
        </div>
      </section>

      {/* Runs on NeuraLLM */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">Runs on NeuraLLM</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card p-6">
              <div className="text-lg font-semibold">Org</div>
              <p className="mt-2 text-sm text-muted">
                Agents mirror your actual org chart — position, reporting lines, and scope — so
                work moves the way it already moves inside your company.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-lg font-semibold">Work</div>
              <p className="mt-2 text-sm text-muted">
                Tasks, recurring jobs, and multi-agent workflows all run through the same
                router → orchestrator → executor pipeline, so behavior stays predictable.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-lg font-semibold">Guardrails</div>
              <p className="mt-2 text-sm text-muted">
                Risk scoring, human approval gates, PII redaction, and a full audit trail keep
                every agent action inside the boundaries you set.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {SECURITY_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted">
                <Icon size={18} strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">Pricing</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: "Team", desc: "For small teams standing up their first agents.", price: "TBD" },
              { name: "Business", desc: "For growing companies running agents across departments.", price: "TBD" },
              { name: "Enterprise", desc: "For organizations needing custom guardrails and SSO.", price: "TBD" },
            ].map((tier) => (
              <div key={tier.name} className="card p-6">
                <div className="text-lg font-semibold">{tier.name}</div>
                <p className="mt-2 text-sm text-muted">{tier.desc}</p>
                <div className="mt-6 text-2xl font-semibold">{tier.price}</div>
                <Link href="/signup" className="control mt-6 block border border-border py-2 text-center text-sm font-medium">
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted md:flex-row">
          <span>© 2026 NeuraLLM. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
