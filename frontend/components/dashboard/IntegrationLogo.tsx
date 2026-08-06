"use client";

import { useState } from "react";

// App-name slugs matching Composio's CDN path: https://cdn.composio.dev/apps/{appname}/logo.png
export const INTEGRATION_APPS = [
  "gmail", "slack", "notion", "github", "googlecalendar", "googledrive", "hubspot", "jira",
  "linear", "airtable", "trello", "salesforce", "stripe", "asana", "clickup", "discord",
  "figma", "shopify", "linkedin", "mailchimp", "outlook", "microsoftteams", "bitbucket",
  "sentry", "zapier", "googledocs", "googlesheets", "dropbox", "zoom", "intercom", "zendesk",
  "whatsapp", "telegram", "twitter", "instagram", "facebook", "youtube", "spotify", "monday",
  "pipedrive", "freshdesk", "quickbooks", "xero", "bamboohr", "greenhouse", "docusign", "box",
  "onedrive",
] as const;

export type IntegrationApp = (typeof INTEGRATION_APPS)[number];

const LABELS: Record<string, string> = {
  gmail: "Gmail", slack: "Slack", notion: "Notion", github: "GitHub",
  googlecalendar: "Google Calendar", googledrive: "Google Drive", hubspot: "HubSpot", jira: "Jira",
  linear: "Linear", airtable: "Airtable", trello: "Trello", salesforce: "Salesforce", stripe: "Stripe",
  asana: "Asana", clickup: "ClickUp", discord: "Discord", figma: "Figma", shopify: "Shopify",
  linkedin: "LinkedIn", mailchimp: "Mailchimp", outlook: "Outlook", microsoftteams: "Microsoft Teams",
  bitbucket: "Bitbucket", sentry: "Sentry", zapier: "Zapier", googledocs: "Google Docs",
  googlesheets: "Google Sheets", dropbox: "Dropbox", zoom: "Zoom", intercom: "Intercom",
  zendesk: "Zendesk", whatsapp: "WhatsApp", telegram: "Telegram", twitter: "X (Twitter)",
  instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", spotify: "Spotify",
  monday: "Monday.com", pipedrive: "Pipedrive", freshdesk: "Freshdesk", quickbooks: "QuickBooks",
  xero: "Xero", bamboohr: "BambooHR", greenhouse: "Greenhouse", docusign: "DocuSign", box: "Box",
  onedrive: "OneDrive",
};

export const CATEGORY_BY_APP: Record<string, string> = {
  gmail: "Communication", slack: "Communication", discord: "Communication", outlook: "Communication",
  microsoftteams: "Communication", zoom: "Communication", whatsapp: "Communication", telegram: "Communication",
  hubspot: "CRM", salesforce: "CRM", intercom: "CRM", zendesk: "CRM", pipedrive: "CRM", freshdesk: "CRM",
  github: "Dev Tools", jira: "Dev Tools", linear: "Dev Tools", bitbucket: "Dev Tools", sentry: "Dev Tools",
  notion: "Productivity", googlecalendar: "Productivity", airtable: "Productivity", trello: "Productivity",
  asana: "Productivity", clickup: "Productivity", figma: "Productivity", zapier: "Productivity",
  googledocs: "Productivity", googlesheets: "Productivity", monday: "Productivity", bamboohr: "Productivity",
  greenhouse: "Productivity", docusign: "Productivity",
  stripe: "Finance", shopify: "Finance", quickbooks: "Finance", xero: "Finance",
  googledrive: "Storage", dropbox: "Storage", box: "Storage", onedrive: "Storage",
  linkedin: "Marketing", mailchimp: "Marketing", twitter: "Marketing", instagram: "Marketing",
  facebook: "Marketing", youtube: "Marketing", spotify: "Marketing",
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
