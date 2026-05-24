import { Shell } from "@/components/layout/shell";
import { AiCoachPanel } from "@/components/ai/ai-coach-panel";

export default function CoachPage() {
  return (
    <Shell
      title="AI Coach"
      subtitle="Next problems, insights, and stats tailored to your roadmap"
    >
      <div className="p-4 lg:p-8">
        <AiCoachPanel />
      </div>
    </Shell>
  );
}
