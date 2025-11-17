"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTask } from "@/lib/hooks/use-tasks";
import { useCreateRecurrenceRule } from "@/lib/hooks/use-recurrence-rules";
import { AlertCircle } from "lucide-react";
import * as z from "zod";
import { TaskPriority } from "@/lib/api/generated-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { toUTCMidnight } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { RRule, Frequency } from "rrule";
import { Checkbox } from "@/components/ui/checkbox";

const WEEKDAYS = [
  { label: "Mon", value: RRule.MO.weekday },
  { label: "Tue", value: RRule.TU.weekday },
  { label: "Wed", value: RRule.WE.weekday },
  { label: "Thu", value: RRule.TH.weekday },
  { label: "Fri", value: RRule.FR.weekday },
  { label: "Sat", value: RRule.SA.weekday },
  { label: "Sun", value: RRule.SU.weekday },
];

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

// Unified schema that includes both task and recurrence fields
const unifiedTaskSchema = z.object({
  // Task fields
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date({ message: "Due date is required" }),

  // Recurrence fields (optional, only used when isRecurring is true)
  isRecurring: z.boolean().optional(),
  frequency: z.nativeEnum(Frequency).optional(),
  interval: z.number().min(1).optional(),
  endType: z.enum(["never", "count", "until"]).optional(),
  count: z.number().optional(),
  until: z.date().optional(),
  byweekday: z.array(z.number()).optional(),
  bymonthday: z.array(z.number()).optional(),
  bysetpos: z.number().optional(),
  bymonth: z.array(z.number()).optional(),
});

type UnifiedTaskFormData = z.infer<typeof unifiedTaskSchema>;

interface UnifiedTaskFormProps {
  onAfterSubmit?: () => void;
}

const UnifiedTaskForm = ({ onAfterSubmit }: UnifiedTaskFormProps) => {
  const [isRecurring, setIsRecurring] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UnifiedTaskFormData>({
    resolver: zodResolver(unifiedTaskSchema),
    defaultValues: {
      priority: TaskPriority.Medium,
      isRecurring: false,
      frequency: Frequency.DAILY,
      interval: 1,
      endType: "never",
      byweekday: [],
      bymonthday: [],
      bymonth: [],
    },
  });

  const createTaskMutation = useCreateTask();
  const createRecurrenceRuleMutation = useCreateRecurrenceRule();

  const frequency = watch("frequency");
  const endType = watch("endType");
  const byweekday = watch("byweekday") || [];
  const bymonthday = watch("bymonthday") || [];
  const bymonth = watch("bymonth") || [];

  const toggleWeekday = (weekday: number) => {
    const current = byweekday || [];
    if (current.includes(weekday)) {
      setValue(
        "byweekday",
        current.filter((d) => d !== weekday)
      );
    } else {
      setValue("byweekday", [...current, weekday]);
    }
  };

  const toggleMonthDay = (day: number) => {
    const current = bymonthday || [];
    if (current.includes(day)) {
      setValue(
        "bymonthday",
        current.filter((d) => d !== day)
      );
    } else {
      setValue("bymonthday", [...current, day]);
    }
  };

  const toggleMonth = (month: number) => {
    const current = bymonth || [];
    if (current.includes(month)) {
      setValue(
        "bymonth",
        current.filter((m) => m !== month)
      );
    } else {
      setValue("bymonth", [...current, month]);
    }
  };

  const onSubmit = (data: UnifiedTaskFormData) => {
    if (isRecurring) {
      // Create recurrence rule
      const rruleOptions: any = {
        freq: data.frequency!,
        interval: data.interval!,
      };

      if (data.byweekday && data.byweekday.length > 0) {
        rruleOptions.byweekday = data.byweekday;
      }

      if (data.bymonthday && data.bymonthday.length > 0) {
        rruleOptions.bymonthday = data.bymonthday;
      }

      if (data.bymonth && data.bymonth.length > 0) {
        rruleOptions.bymonth = data.bymonth;
      }

      if (data.bysetpos) {
        rruleOptions.bysetpos = data.bysetpos;
      }

      if (data.endType === "count" && data.count) {
        rruleOptions.count = data.count;
      } else if (data.endType === "until" && data.until) {
        rruleOptions.until = toUTCMidnight(data.until);
      }

      const rule = new RRule(rruleOptions);
      // Remove "RRULE:" prefix for Ical.Net compatibility
      const rRuleString = rule.toString().replace(/^RRULE:/, '');

      createRecurrenceRuleMutation.mutate(
        {
          taskTitle: data.title,
          taskDescription: data.description || "",
          taskPriority: data.priority,
          rRule: rRuleString,
          startDate: toUTCMidnight(data.dueDate),
          endDate: data.endType === "until" && data.until ? toUTCMidnight(data.until) : undefined,
          maxOccurrences: data.endType === "count" && data.count ? data.count : undefined,
        },
        {
          onSuccess: () => {
            reset();
            setIsRecurring(false);
            if (onAfterSubmit) {
              onAfterSubmit();
            }
          },
        }
      );
    } else {
      // Create single task
      createTaskMutation.mutate(
        {
          title: data.title,
          description: data.description || "",
          priority: data.priority,
          dueDate: toUTCMidnight(data.dueDate),
        },
        {
          onSuccess: () => {
            reset();
            if (onAfterSubmit) {
              onAfterSubmit();
            }
          },
        }
      );
    }
  };

  const isSubmitting = createTaskMutation.isPending || createRecurrenceRuleMutation.isPending;
  const error = createTaskMutation.error || createRecurrenceRuleMutation.error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to create {isRecurring ? "recurring task" : "task"}. Please
            try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Task Fields - Always Visible */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Task title"
          {...register("title")}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Task description"
          {...register("description")}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={watch("priority")?.toString()}
          onValueChange={(value) =>
            setValue("priority", parseInt(value) as TaskPriority)
          }
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TaskPriority.Low.toString()}>Low</SelectItem>
            <SelectItem value={TaskPriority.Medium.toString()}>
              Medium
            </SelectItem>
            <SelectItem value={TaskPriority.High.toString()}>High</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">{isRecurring ? "Start Date" : "Due Date"}</Label>
        <DatePicker
          date={watch("dueDate") ? new Date(watch("dueDate")) : undefined}
          onSelect={(date) =>
            setValue("dueDate", date ? toUTCMidnight(date) : new Date())
          }
          disabled={isSubmitting}
        />
        {errors.dueDate && (
          <p className="text-sm text-destructive">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Recurrence Toggle */}
      <div className="flex items-center space-x-2 pt-2 border-t">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => {
            setIsRecurring(checked);
            setValue("isRecurring", checked);
          }}
          disabled={isSubmitting}
        />
        <Label htmlFor="recurring" className="cursor-pointer">
          Make this a recurring task
        </Label>
      </div>

      {/* Recurrence Fields - Conditionally Visible */}
      {isRecurring && (
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={watch("frequency")?.toString()}
              onValueChange={(value) =>
                setValue("frequency", parseInt(value) as Frequency)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Frequency.DAILY.toString()}>Daily</SelectItem>
                <SelectItem value={Frequency.WEEKLY.toString()}>Weekly</SelectItem>
                <SelectItem value={Frequency.MONTHLY.toString()}>
                  Monthly
                </SelectItem>
                <SelectItem value={Frequency.YEARLY.toString()}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Interval</Label>
            <Input
              id="interval"
              type="number"
              min="1"
              placeholder="1"
              {...register("interval", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.interval && (
              <p className="text-sm text-destructive">{errors.interval.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Repeat every {watch("interval") || 1}{" "}
              {frequency === Frequency.DAILY
                ? "day(s)"
                : frequency === Frequency.WEEKLY
                  ? "week(s)"
                  : frequency === Frequency.MONTHLY
                    ? "month(s)"
                    : "year(s)"}
            </p>
          </div>

          {/* Weekly Options */}
          {frequency === Frequency.WEEKLY && (
            <div className="space-y-2">
              <Label>Repeat On</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`weekday-${day.value}`}
                      checked={byweekday.includes(day.value)}
                      onCheckedChange={() => toggleWeekday(day.value)}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={`weekday-${day.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Options */}
          {frequency === Frequency.MONTHLY && (
            <>
              <div className="space-y-2">
                <Label>Repeat On Weekdays (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`monthly-weekday-${day.value}`}
                        checked={byweekday.includes(day.value)}
                        onCheckedChange={() => toggleWeekday(day.value)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`monthly-weekday-${day.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>On Month Days (Optional)</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`monthday-${day}`}
                        checked={bymonthday.includes(day)}
                        onCheckedChange={() => toggleMonthDay(day)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`monthday-${day}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bysetpos">Position in Set (Optional)</Label>
                <Select
                  value={watch("bysetpos")?.toString() || "none"}
                  onValueChange={(value) =>
                    setValue("bysetpos", value !== "none" ? parseInt(value) : undefined)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any occurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any occurrence</SelectItem>
                    <SelectItem value="1">First</SelectItem>
                    <SelectItem value="2">Second</SelectItem>
                    <SelectItem value="3">Third</SelectItem>
                    <SelectItem value="4">Fourth</SelectItem>
                    <SelectItem value="-1">Last</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Yearly Options */}
          {frequency === Frequency.YEARLY && (
            <>
              <div className="space-y-2">
                <Label>In Months</Label>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month) => (
                    <div key={month.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${month.value}`}
                        checked={bymonth.includes(month.value)}
                        onCheckedChange={() => toggleMonth(month.value)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`month-${month.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {month.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>On Weekdays (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`yearly-weekday-${day.value}`}
                        checked={byweekday.includes(day.value)}
                        onCheckedChange={() => toggleWeekday(day.value)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`yearly-weekday-${day.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>On Month Days (Optional)</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`yearly-monthday-${day}`}
                        checked={bymonthday.includes(day)}
                        onCheckedChange={() => toggleMonthDay(day)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`yearly-monthday-${day}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* End Condition */}
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="endType">Ends</Label>
            <Select
              value={watch("endType")}
              onValueChange={(value) =>
                setValue("endType", value as "never" | "count" | "until")
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select end condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="count">After X occurrences</SelectItem>
                <SelectItem value="until">On specific date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {endType === "count" && (
            <div className="space-y-2">
              <Label htmlFor="count">Number of Occurrences</Label>
              <Input
                id="count"
                type="number"
                min="1"
                placeholder="10"
                {...register("count", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.count && (
                <p className="text-sm text-destructive">{errors.count.message}</p>
              )}
            </div>
          )}

          {endType === "until" && (
            <div className="space-y-2">
              <Label htmlFor="until">End Date</Label>
              <DatePicker
                date={watch("until")}
                onSelect={(date) =>
                  setValue("until", date ? toUTCMidnight(date) : undefined)
                }
                disabled={isSubmitting}
              />
              {errors.until && (
                <p className="text-sm text-destructive">{errors.until.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Creating..."
            : isRecurring
              ? "Create Recurring Task"
              : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default UnifiedTaskForm;
