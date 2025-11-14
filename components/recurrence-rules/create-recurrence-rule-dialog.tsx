"use client";

import { useState } from "react";
import { RRule, Frequency } from "rrule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecurrenceRuleForm } from "./recurrence-rule-form";
import { useCreateRecurrenceRule } from "@/lib/hooks/use-recurrence-rules";
import { TaskPriority } from "@/lib/api/generated-client";

interface CreateRecurrenceRuleDialogProps {
  children: React.ReactNode;
}

export function CreateRecurrenceRuleDialog({
  children,
}: CreateRecurrenceRuleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createRecurrenceRuleMutation = useCreateRecurrenceRule();

  const handleSubmit = (data: any) => {
    // Build RRule options
    const ruleOptions: any = {
      freq: data.frequency,
      interval: data.interval,
    };

    // Add end condition
    if (data.endType === "count" && data.count) {
      ruleOptions.count = parseInt(data.count);
    } else if (data.endType === "until" && data.until) {
      ruleOptions.until = data.until; // Already a Date object
    }

    // Add weekdays (for weekly, monthly, or yearly recurrence)
    if (data.byweekday?.length > 0) {
      ruleOptions.byweekday = data.byweekday;
    }

    // Add month days (for monthly or yearly recurrence)
    if (data.bymonthday?.length > 0) {
      ruleOptions.bymonthday = data.bymonthday;
    }

    // Add months (for yearly recurrence)
    if (data.bymonth?.length > 0) {
      ruleOptions.bymonth = data.bymonth;
    }

    // Add position in set (for monthly or yearly recurrence)
    if (data.bysetpos !== undefined && data.bysetpos !== null) {
      ruleOptions.bysetpos = parseInt(data.bysetpos);
    }

    // Generate RRULE string
    const rule = new RRule(ruleOptions);
    // Remove "RRULE:" prefix for Ical.Net compatibility
    const rRuleString = rule.toString().replace(/^RRULE:/, '');

    // Create the request
    createRecurrenceRuleMutation.mutate(
      {
        rRule: rRuleString,
        startDate: data.startDate, // Already a Date object
        endDate: data.until || undefined, // Already a Date object
        maxOccurrences: data.count ? parseInt(data.count) : undefined,
        taskTitle: data.taskTitle,
        taskDescription: data.taskDescription || "",
        taskPriority: data.taskPriority,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recurrence Rule</DialogTitle>
          <DialogDescription>
            Set up a recurring task pattern. Tasks will be automatically generated
            based on this rule.
          </DialogDescription>
        </DialogHeader>
        <RecurrenceRuleForm
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          isSubmitting={createRecurrenceRuleMutation.isPending}
          error={
            createRecurrenceRuleMutation.isError
              ? createRecurrenceRuleMutation.error
              : null
          }
        />
      </DialogContent>
    </Dialog>
  );
}
