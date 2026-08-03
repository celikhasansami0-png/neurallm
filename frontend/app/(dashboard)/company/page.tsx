"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";

function LogoUpload() {
  // Stub: swap the placeholder text for an <img> once the user uploads a real logo.
  // Uploaded logos should render at 130% scale per the design brief.
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-control border border-border text-xs text-muted">
        Logo
      </div>
      <div>
        <button className="control border border-border px-3 py-1.5 text-sm font-medium">Upload logo</button>
        <p className="mt-1 text-xs text-muted">PNG or SVG, displayed at 130% scale across the app.</p>
      </div>
    </div>
  );
}

export default function CompanyPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [team, setTeam] = useState([
    { email: "sarah@acme.com", role: "Admin" },
    { email: "james@acme.com", role: "Member" },
  ]);

  function invite() {
    if (!inviteEmail.trim()) return;
    setTeam((t) => [...t, { email: inviteEmail, role: "Member" }]);
    setInviteEmail("");
  }

  return (
    <div>
      <PageHeader title="Company" subtitle="Branding, team access, and data residency for your workspace." />

      <div className="card p-5">
        <div className="text-sm font-semibold">Logo</div>
        <div className="mt-3"><LogoUpload /></div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold">Team</div>
        <div className="mt-3 flex gap-2">
          <input
            value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@company.com" className="control flex-1 border border-border px-3 py-2 text-sm"
          />
          <button onClick={invite} className="control bg-black px-4 py-2 text-sm font-medium text-white">Invite</button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {team.map((t) => (
            <div key={t.email} className="flex items-center justify-between py-2 text-sm">
              <span>{t.email}</span>
              <span className="text-xs text-muted">{t.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="text-sm font-semibold">Data region</div>
        <p className="mt-1 text-xs text-muted">Where your tenant's data and vector embeddings are stored.</p>
        <select defaultValue="us" className="control mt-3 border border-border px-3 py-2 text-sm">
          <option value="us">United States</option>
          <option value="eu">European Union</option>
          <option value="apac">Asia Pacific</option>
        </select>
      </div>
    </div>
  );
}
