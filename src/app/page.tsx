// Server Component — no client-side state here.
// All interactivity lives in DocumentGrid and its children.
import { DocumentGrid } from "@/components/dashboard/DocumentGrid";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <DocumentGrid />
    </main>
  );
}
