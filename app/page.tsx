import DailyTasks from "@/components/tasks/daily-tasks";

export default function Home() {
  return (
    <main className="h-full w-full flex flex-col relative">
      <DailyTasks />
    </main>
  );
}
