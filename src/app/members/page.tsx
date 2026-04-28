import MembersView from "@/features/discovery/components/MembersView";
// Dynamic data fetching is now handled internally by MembersView

export const metadata = {
  title: "The Community | UIUPC",
  description: "Meet the visionaries, storytellers, and leaders of the UIU Photography Club community.",
};

export default function MembersPage() {
  return <MembersView />;
}
