"use client";

import { useState } from "react";

// App-name slugs matching Composio's CDN path: https://cdn.composio.dev/apps/{appname}/logo.png
export const INTEGRATION_APPS = [
  "gmail", "slack", "notion", "github", "googlecalendar", "googledrive", "hubspot", "jira",
  "linear", "airtable", "trello", "salesforce", "stripe", "asana", "clickup", "discord",
  "figma", "shopify", "linkedin", "mailchimp", "outlook", "microsoftteams", "bitbucket",
  "sentry", "zapier", "googledocs", "googlesheets", "dropbox", "zoom", "intercom", "zendesk",
] as const;

export type IntegrationApp = (typeof INTEGRATION_APPS)[number];

const LABELS: Record<string, string> = {
  gmail: "Gmail",
  slack: "Slack",
  notion: "Notion",
  github: "GitHub",
  googlecalendar: "Google Calendar",
  googledrive: "Google Drive",
  hubspot: "HubSpot",
  jira: "Jira",
  linear: "Linear",
  airtable: "Airtable",
  trello: "Trello",
  salesforce: "Salesforce",
  stripe: "Stripe",
  asana: "Asana",
  clickup: "ClickUp",
  discord: "Discord",
  figma: "Figma",
  shopify: "Shopify",
  linkedin: "LinkedIn",
  mailchimp: "Mailchimp",
  outlook: "Outlook",
  microsoftteams: "Microsoft Teams",
  bitbucket: "Bitbucket",
  sentry: "Sentry",
  zapier: "Zapier",
  googledocs: "Google Docs",
  googlesheets: "Google Sheets",
  dropbox: "Dropbox",
  zoom: "Zoom",
  intercom: "Intercom",
  zendesk: "Zendesk",
};

export function appLabel(app: string): string {
  return LABELS[app] || app;
}

export function IntegrationLogo({ app, size = 28 }: { app: string; size?: number }) {
  const [errored, setErrored] = useState(false);
  const label = appLabel(app);

  if (errored) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-[6px] bg-[#1A1A1A] text-white agent-name"
        style={{ width: size, height: size, fontSize: 11 }}
      >
        {label.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.composio.dev/apps/${app}/logo.png`}
      alt={label}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: 6 }}
      className="shrink-0 object-cover"
      onError={() => setErrored(true)}
    />
  );
}
