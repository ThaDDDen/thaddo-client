"use client";

import { useTasks, useTodaysTasks } from "@/lib/hooks/use-tasks";
import { TaskPriority } from "@/lib/api/generated-client";

// Force dynamic rendering to avoid SSR issues with API client
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Calendar, Clock } from "lucide-react";

export default function TestApiPage() {
  const { data: tasks, isLoading, isError, error } = useTodaysTasks();

  const getPriorityVariant = (
    priority: TaskPriority,
  ): "default" | "secondary" | "destructive" => {
    switch (priority) {
      case TaskPriority.Low:
        return "secondary";
      case TaskPriority.Medium:
        return "default";
      case TaskPriority.High:
        return "destructive";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low:
        return "Low";
      case TaskPriority.Medium:
        return "Medium";
      case TaskPriority.High:
        return "High";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            API Connection Test
          </h1>
          <p className="text-muted-foreground">
            Testing TanStack Query with backend API
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Base URL:</span>
            <code className="px-2 py-1 bg-muted rounded">
              {process.env.NEXT_PUBLIC_API_URL || "Not configured"}
            </code>
          </div>
        </div>

        <Separator />

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Tasks</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "An unknown error occurred"}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {tasks && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Connection Successful</AlertTitle>
              <AlertDescription>
                Successfully fetched {tasks.length} task
                {tasks.length !== 1 ? "s" : ""} from the API
              </AlertDescription>
            </Alert>

            {tasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Create some tasks in your API to see them here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-xl">
                              {task.title}
                            </CardTitle>
                            <Badge variant={getPriorityVariant(task.priority!)}>
                              {getPriorityLabel(task.priority!)}
                            </Badge>
                            {task.completed && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <CardDescription className="text-sm">
                              {task.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">ID:</span>
                          <span>{task.id}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {task.taskListId && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">List:</span>
                            <Badge variant="outline" className="text-xs">
                              {task.taskListId}
                            </Badge>
                          </div>
                        )}
                        {task.createdAt && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
