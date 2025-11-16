import { AuthGuard } from "@/components/auth/auth-guard";
import DailyTasks from "@/components/tasks/daily-tasks";

export default function Home() {
  return (
    <AuthGuard>
      <DailyTasks />
    </AuthGuard>
  );
}
