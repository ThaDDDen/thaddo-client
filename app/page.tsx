"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTodaysTasks } from "@/lib/hooks/use-tasks";
import { todayAsString } from "@/lib/utils/dates";

export default function Home() {
  const { data: tasks, isLoading, isError, error } = useTodaysTasks();
  if (!tasks || isLoading) return <span>Loading..</span>;
  return (
    <main className="h-full w-full flex flex-col relative">
      <div className="flex flex-col pt-8 pb-16 items-center gap-4 sticky top-0">
        <h3 className="mx-auto text-white font-semibold w-fit">
          {todayAsString}
        </h3>
        <h1 className="text-white text-4xl font-bold">Todays Tasks</h1>
      </div>
      <div className="bg-background flex-1 px-4 flex flex-col relative">
        <div className="-mt-10 relative flex-1 ">
          <div className="absolute inset-0 overflow-y-scroll">
            <Card className="gap-0 p-0 overflow-hidden">
              {tasks
                .filter((t) => !t.completed)
                .map((task) => (
                  <div key={task.id}>
                    <Card className="ring-0 rounded-none border-none">
                      <CardHeader>
                        <CardTitle>{task.title}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {task.recurrenceRuleId && "reccuring"}
                      </CardContent>
                    </Card>
                    <Separator />
                  </div>
                ))}
            </Card>
            <div className="py-4">Completed</div>
            <Card className="gap-0 p-0 overflow-hidden">
              {tasks
                .filter((t) => t.completed)
                .map((task) => (
                  <div key={task.id}>
                    <div className="p-4 w-full line-through">{task.title}</div>
                    <Separator />
                  </div>
                ))}
            </Card>
          </div>
        </div>
        <Button className="w-full rounded-full sticky bottom-4">
          Add new task
        </Button>
      </div>
    </main>
  );
}
