import MembersView from "@/features/discovery/components/MembersView";
// Import JSON directly on server
import committee2026 from "@/data/committee2026.json";

export const metadata = {
  title: "The Community | UIUPC",
  description: "Meet the visionaries, storytellers, and leaders of the UIU Photography Club community.",
};

export default function MembersPage() {
  return <MembersView committee2026={committee2026} />;
}
