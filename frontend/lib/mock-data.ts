// TODO: replace with live API calls once backend is deployed with real credentials.

export const mockAgents = [
  { id: "1", name: "CEO", org_position: "Chief Executive Officer", level: 1, tools: ["directives", "web_research"], active: true, tasksThisWeek: 8 },
  { id: "2", name: "CEO Office", org_position: "Chief of Staff", level: 2, tools: ["gmail", "googlecalendar", "directives"], active: true, tasksThisWeek: 14 },
  { id: "3", name: "CTO", org_position: "Chief Technology Officer", level: 2, tools: ["github", "directives", "web_research"], active: true, tasksThisWeek: 22 },
  { id: "4", name: "CFO", org_position: "Chief Financial Officer", level: 2, tools: ["directives", "web_research"], active: true, tasksThisWeek: 7 },
  { id: "5", name: "Product Manager", org_position: "Product Manager", level: 3, tools: ["directives", "web_research"], active: true, tasksThisWeek: 11 },
  { id: "6", name: "Software Engineer", org_position: "Software Engineer", level: 4, tools: ["github", "directives"], active: true, tasksThisWeek: 18 },
];

export const mockTasks = [
  { id: "t1", title: "Draft Q3 board update", agent: "CEO", status: "completed", risk: "low", created: "2026-07-30", time: "2h ago" },
  { id: "t2", title: "Send investor follow-up email", agent: "CEO Office", status: "awaiting_approval", risk: "high", created: "2026-07-31", time: "35m ago" },
  { id: "t3", title: "Review infra cost roadmap", agent: "CTO", status: "running", risk: "medium", created: "2026-07-31", time: "12m ago" },
  { id: "t4", title: "Approve marketing spend increase", agent: "CFO", status: "awaiting_approval", risk: "high", created: "2026-07-31", time: "50m ago" },
  { id: "t5", title: "Draft onboarding PRD", agent: "Product Manager", status: "completed", risk: "low", created: "2026-07-29", time: "1d ago" },
  { id: "t6", title: "Triage open GitHub issues", agent: "Software Engineer", status: "completed", risk: "low", created: "2026-07-28", time: "1d ago" },
  { id: "t7", title: "Deploy staging hotfix", agent: "Software Engineer", status: "failed", risk: "medium", created: "2026-07-31", time: "3h ago" },
];

export const mockRecurring = [
  { id: "r1", title: "Weekly board digest", agent: "CEO", cron: "0 9 * * 1", active: true, lastRun: "2026-07-27" },
  { id: "r2", title: "Daily GitHub issue triage", agent: "Software Engineer", cron: "0 8 * * *", active: true, lastRun: "2026-07-31" },
  { id: "r3", title: "Monthly budget report", agent: "CFO", cron: "0 9 1 * *", active: false, lastRun: "2026-07-01" },
];

// Composio app slugs — used with https://cdn.composio.dev/apps/{slug}/logo.png
export const mockIntegrations = [
  { name: "Gmail", slug: "gmail", category: "Email", connected: true },
  { name: "Google Calendar", slug: "googlecalendar", category: "Calendar", connected: true },
  { name: "GitHub", slug: "github", category: "Engineering", connected: true },
  { name: "Slack", slug: "slack", category: "Communication", connected: false },
  { name: "Notion", slug: "notion", category: "Docs", connected: false },
  { name: "Linear", slug: "linear", category: "Engineering", connected: false },
  { name: "Salesforce", slug: "salesforce", category: "CRM", connected: false },
  { name: "HubSpot", slug: "hubspot", category: "CRM", connected: false },
  { name: "Stripe", slug: "stripe", category: "Finance", connected: false },
  { name: "Zoom", slug: "zoom", category: "Communication", connected: false },
  { name: "Google Drive", slug: "googledrive", category: "Docs", connected: false },
  { name: "Jira", slug: "jira", category: "Engineering", connected: false },
  { name: "Airtable", slug: "airtable", category: "Docs", connected: false },
  { name: "Trello", slug: "trello", category: "Engineering", connected: false },
  { name: "Asana", slug: "asana", category: "Engineering", connected: false },
  { name: "ClickUp", slug: "clickup", category: "Engineering", connected: false },
  { name: "Discord", slug: "discord", category: "Communication", connected: false },
  { name: "Figma", slug: "figma", category: "Docs", connected: false },
  { name: "Shopify", slug: "shopify", category: "Finance", connected: false },
  { name: "LinkedIn", slug: "linkedin", category: "Communication", connected: false },
  { name: "Mailchimp", slug: "mailchimp", category: "Email", connected: false },
  { name: "Outlook", slug: "outlook", category: "Email", connected: false },
  { name: "Microsoft Teams", slug: "microsoftteams", category: "Communication", connected: false },
  { name: "Bitbucket", slug: "bitbucket", category: "Engineering", connected: false },
  { name: "Sentry", slug: "sentry", category: "Engineering", connected: false },
  { name: "Zapier", slug: "zapier", category: "Engineering", connected: false },
  { name: "Google Docs", slug: "googledocs", category: "Docs", connected: false },
  { name: "Google Sheets", slug: "googlesheets", category: "Docs", connected: false },
  { name: "Dropbox", slug: "dropbox", category: "Docs", connected: false },
  { name: "Intercom", slug: "intercom", category: "CRM", connected: false },
  { name: "Zendesk", slug: "zendesk", category: "CRM", connected: false },
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

// Last 30 days of task volume, for the Dashboard line chart.
export const mockTaskVolume = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  tasks: Math.round(8 + 10 * Math.sin(i / 4) + Math.random() * 6),
}));

// Current-month agent performance, for the Dashboard bar chart.
export const mockAgentPerformance = mockAgents.map((a) => ({
  name: a.name,
  tasks: a.tasksThisWeek,
}));

export const mockRecentActivity = [
  { id: "a1", agent: "CEO", text: "Completed \"Draft Q3 board update\"", status: "completed", time: "2h ago" },
  { id: "a2", agent: "CEO Office", text: "Awaiting approval on \"Send investor follow-up email\"", status: "awaiting_approval", time: "35m ago" },
  { id: "a3", agent: "CTO", text: "Running \"Review infra cost roadmap\"", status: "running", time: "12m ago" },
  { id: "a4", agent: "CFO", text: "Awaiting approval on \"Approve marketing spend increase\"", status: "awaiting_approval", time: "50m ago" },
  { id: "a5", agent: "Software Engineer", text: "Failed \"Deploy staging hotfix\"", status: "failed", time: "3h ago" },
  { id: "a6", agent: "Product Manager", text: "Completed \"Draft onboarding PRD\"", status: "completed", time: "1d ago" },
];

export const mockAuditLog = [
  {
    id: "a1", task_id: "t2", actor: "CEO Office", action: "gmail.send_email",
    risk_level: "high", approved_by: "hasan@phratic.app", timestamp: "2026-07-31T14:02:00Z",
  },
  {
    id: "a2", task_id: "t3", actor: "CTO", action: "github.read_repo",
    risk_level: "low", approved_by: null, timestamp: "2026-07-31T13:45:00Z",
  },
];
