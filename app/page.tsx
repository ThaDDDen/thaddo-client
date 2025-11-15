import { AuthGuard } from "@/components/auth/auth-guard";
import DailyTasks from "@/components/tasks/daily-tasks";

export default function Home() {
  return (
    <AuthGuard>
      <main className="h-full w-full flex flex-col relative">
        <DailyTasks />
      </main>
    </AuthGuard>
  );
}
