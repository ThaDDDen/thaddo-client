"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTask } from "@/lib/hooks/use-tasks";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { TaskPriority } from "@/lib/api/generated-client";
import { Calendar, CheckCircle2, Circle, Repeat, List } from "lucide-react";
import { format } from "date-fns";
import CompleteTaskToggle from "@/components/tasks/complete-task-toggle";
import { RRule } from "rrule";
import { Button } from "@/components/ui/button";

const TaskPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const { data: task, isLoading } = useTask(Number(slug));

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Task not found</h2>
          <p className="text-muted-foreground">
            The task you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High:
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case TaskPriority.Medium:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case TaskPriority.Low:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityLabel = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.High:
        return "High Priority";
      case TaskPriority.Medium:
        return "Medium Priority";
      case TaskPriority.Low:
        return "Low Priority";
      default:
        return "No Priority";
    }
  };

  return (
    <div className="w-full h-full flex flex-col mb-16 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col pt-8 pb-8 px-4 gap-4 border-b">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1
              className={`text-3xl text-center font-bold ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </Badge>

          {task.recurrenceRuleId && (
            <Badge variant="outline" className="gap-1">
              <Repeat className="w-3 h-3" />
              Recurring
            </Badge>
          )}

          {task.taskList && (
            <Badge variant="outline" className="gap-1">
              <List className="w-3 h-3" />
              {task.taskList.title}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 bg-background py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="w-full flex justify-between items-center">
            <div className="gap-4 flex items-center">
              <CompleteTaskToggle task={task} />
              <span>Completed</span>
            </div>

            <div className="gap-4 flex items-center">
              <Button variant="destructive">Delete</Button>
              <Button variant="secondary">Edit</Button>
            </div>
          </div>
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "PPP")
                      : "No due date"}
                  </p>
                </div>
              </div>

              {task.completed && task.completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(task.completedAt), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {task.recurrenceRule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recurrance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-12">
                  <span className="text-muted-foreground col-span-5 ">
                    RRULE
                  </span>
                  <span className=" col-span-7 text-right capitalize ">
                    {RRule.fromString(task.recurrenceRule.rRule!).toText()}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="text-muted-foreground col-span-5">
                    Active
                  </span>
                  <span className="text-right col-span-7">
                    {task.recurrenceRule.isActive!.toString()}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="text-muted-foreground col-span-5">
                    Generated count
                  </span>
                  <span className="text-right col-span-7">
                    {task.recurrenceRule.generatedCount}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="text-muted-foreground col-span-5">
                    Start date
                  </span>
                  <span className="text-right col-span-7">
                    {format(new Date(task.recurrenceRule.startDate!), "PPP")}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="text-muted-foreground col-span-5">
                    End date
                  </span>
                  <span className="text-right col-span-7">
                    {task.recurrenceRule?.endDate
                      ? format(new Date(task.recurrenceRule.endDate), "PPP")
                      : "none"}
                  </span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="text-muted-foreground col-span-5">
                    Max occurrences
                  </span>
                  <span className="text-right col-span-7">
                    {task.recurrenceRule?.maxOccurrences
                      ? format(
                          new Date(task.recurrenceRule.maxOccurrences),
                          "PPP",
                        )
                      : "none"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {task.createdAt
                    ? format(new Date(task.createdAt), "PPP")
                    : "Unknown"}
                </span>
              </div>
              {task.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(task.updatedAt), "PPP")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Task ID</span>
                <span className="font-mono">#{task.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
