import { redirect } from "next/navigation";

// Deprecated route, removed as part of the Phratic pivot (no AI agents / tasks).
export default function DeprecatedPage() {
  redirect("/dashboard");
}
