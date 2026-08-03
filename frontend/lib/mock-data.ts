// TODO: replace with live API calls once backend is deployed with real credentials.

export const mockAgents = [
  { id: "1", name: "CEO", org_position: "Chief Executive Officer", level: 1, tools: ["directives", "web_research"] },
  { id: "2", name: "CEO Office", org_position: "Chief of Staff", level: 2, tools: ["gmail", "calendar", "directives"] },
  { id: "3", name: "CTO", org_position: "Chief Technology Officer", level: 2, tools: ["github", "directives", "web_research"] },
  { id: "4", name: "CFO", org_position: "Chief Financial Officer", level: 2, tools: ["directives", "web_research"] },
  { id: "5", name: "Product Manager", org_position: "Product Manager", level: 3, tools: ["directives", "web_research"] },
  { id: "6", name: "Software Engineer", org_position: "Software Engineer", level: 4, tools: ["github_issues", "github_repos", "directives"] },
];

export const mockTasks = [
  { id: "t1", title: "Draft Q3 board update", agent: "CEO", status: "completed", risk: "low", created: "2026-07-30" },
  { id: "t2", title: "Send investor follow-up email", agent: "CEO Office", status: "awaiting_approval", risk: "high", created: "2026-07-31" },
  { id: "t3", title: "Review infra cost roadmap", agent: "CTO", status: "running", risk: "medium", created: "2026-07-31" },
  { id: "t4", title: "Approve marketing spend increase", agent: "CFO", status: "awaiting_approval", risk: "high", created: "2026-07-31" },
  { id: "t5", title: "Draft onboarding PRD", agent: "Product Manager", status: "completed", risk: "low", created: "2026-07-29" },
  { id: "t6", title: "Triage open GitHub issues", agent: "Software Engineer", status: "completed", risk: "low", created: "2026-07-28" },
];

export const mockRecurring = [
  { id: "r1", title: "Weekly board digest", agent: "CEO", cron: "0 9 * * 1", active: true, lastRun: "2026-07-27" },
  { id: "r2", title: "Daily GitHub issue triage", agent: "Software Engineer", cron: "0 8 * * *", active: true, lastRun: "2026-07-31" },
  { id: "r3", title: "Monthly budget report", agent: "CFO", cron: "0 9 1 * *", active: false, lastRun: "2026-07-01" },
];

export const mockIntegrations = [
  { name: "Gmail", category: "Email", connected: true },
  { name: "Google Calendar", category: "Calendar", connected: true },
  { name: "GitHub", category: "Engineering", connected: true },
  { name: "Slack", category: "Communication", connected: false },
  { name: "Notion", category: "Docs", connected: false },
  { name: "Linear", category: "Engineering", connected: false },
  { name: "Salesforce", category: "CRM", connected: false },
  { name: "HubSpot", category: "CRM", connected: false },
  { name: "Stripe", category: "Finance", connected: false },
  { name: "QuickBooks", category: "Finance", connected: false },
  { name: "Zoom", category: "Communication", connected: false },
  { name: "Google Drive", category: "Docs", connected: false },
];

export const mockKnowledgeDocs = [
  { id: "k1", filename: "Employee Handbook 2026.pdf", status: "indexed", chunks: 84, size: "2.1 MB" },
  { id: "k2", filename: "Series A Pitch Deck.pdf", status: "indexed", chunks: 22, size: "6.4 MB" },
  { id: "k3", filename: "Q3 OKRs.docx", status: "processing", chunks: 0, size: "310 KB" },
];

export const mockROI = [
  { month: "Feb", hoursSaved: 12, dollarsSaved: 720 },
  { month: "Mar", hoursSaved: 28, dollarsSaved: 1680 },
  { month: "Apr", hoursSaved: 41, dollarsSaved: 2460 },
  { month: "May", hoursSaved: 55, dollarsSaved: 3300 },
  { month: "Jun", hoursSaved: 74, dollarsSaved: 4440 },
  { month: "Jul", hoursSaved: 96, dollarsSaved: 5760 },
];

export const mockAuditLog = [
  {
    id: "a1", task_id: "t2", actor: "CEO Office", action: "gmail.send_email",
    risk_level: "high", approved_by: "sarah@acme.com", timestamp: "2026-07-31T14:02:00Z",
  },
  {
    id: "a2", task_id: "t3", actor: "CTO", action: "github.read_repo",
    risk_level: "low", approved_by: null, timestamp: "2026-07-31T13:45:00Z",
  },
];
