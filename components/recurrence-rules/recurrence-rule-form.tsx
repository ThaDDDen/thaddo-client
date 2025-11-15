"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RRule, Frequency } from "rrule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TaskPriority } from "@/lib/api/generated-client";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { toUTCMidnight } from "@/lib/utils";

const recurrenceRuleSchema = z.object({
  frequency: z.nativeEnum(Frequency),
  interval: z.number().min(1, "Interval must be at least 1"),
  endType: z.enum(["never", "count", "until"]),
  count: z.number().optional(),
  until: z.date().optional(),
  byweekday: z.array(z.number()).optional(),
  bymonthday: z.array(z.number()).optional(), // Day of month (1-31)
  bysetpos: z.number().optional(), // Position in set (e.g., 1st, 2nd, -1 for last)
  bymonth: z.array(z.number()).optional(), // Month numbers (1-12)
  taskTitle: z.string().min(1, "Task title is required"),
  taskDescription: z.string().optional(),
  taskPriority: z.nativeEnum(TaskPriority),
  startDate: z.date({ message: "Start date is required" }),
});

type RecurrenceRuleFormData = z.infer<typeof recurrenceRuleSchema>;

interface RecurrenceRuleFormProps {
  onSubmit: (data: RecurrenceRuleFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: Error | null;
}

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

export function RecurrenceRuleForm({
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: RecurrenceRuleFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecurrenceRuleFormData>({
    resolver: zodResolver(recurrenceRuleSchema),
    defaultValues: {
      frequency: Frequency.DAILY,
      interval: 1,
      endType: "never",
      taskPriority: TaskPriority.Medium,
      byweekday: [],
      bymonthday: [],
      bymonth: [],
    },
  });

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to create recurrence rule. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Task Information */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-sm">Task Information</h3>

        <div className="space-y-2">
          <Label htmlFor="taskTitle">Task Title</Label>
          <Input
            id="taskTitle"
            placeholder="Task title"
            {...register("taskTitle")}
            disabled={isSubmitting}
          />
          {errors.taskTitle && (
            <p className="text-sm text-destructive">{errors.taskTitle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskDescription">Description (Optional)</Label>
          <Input
            id="taskDescription"
            placeholder="Task description"
            {...register("taskDescription")}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskPriority">Priority</Label>
          <Select
            value={watch("taskPriority")?.toString()}
            onValueChange={(value) =>
              setValue("taskPriority", parseInt(value) as TaskPriority)
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
        </div>
      </div>

      {/* Recurrence Pattern */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-sm">Recurrence Pattern</h3>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <DatePicker
            date={watch("startDate")}
            onSelect={(date) => setValue("startDate", date ? toUTCMidnight(date) : new Date())}
            disabled={isSubmitting}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

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
              <p className="text-xs text-muted-foreground">
                Select specific days of the month (1-31)
              </p>
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
              <p className="text-xs text-muted-foreground">
                E.g., "First Friday" or "Last Monday"
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="yearly-bysetpos">Position in Set (Optional)</Label>
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
              <p className="text-xs text-muted-foreground">
                E.g., "First Friday of March" or "Last Monday of December"
              </p>
            </div>
          </>
        )}
      </div>

      {/* End Condition */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-sm">End Condition</h3>

        <div className="space-y-2">
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
              onSelect={(date) => setValue("until", date ? toUTCMidnight(date) : undefined)}
              disabled={isSubmitting}
            />
            {errors.until && (
              <p className="text-sm text-destructive">{errors.until.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creating..." : "Create Recurrence Rule"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
