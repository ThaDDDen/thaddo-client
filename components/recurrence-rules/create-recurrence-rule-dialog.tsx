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
      ruleOptions.until = new Date(data.until);
    }

    // Add weekdays for weekly recurrence
    if (data.frequency === Frequency.WEEKLY && data.byweekday?.length > 0) {
      ruleOptions.byweekday = data.byweekday;
    }

    // Generate RRULE string
    const rule = new RRule(ruleOptions);
    // Remove "RRULE:" prefix for Ical.Net compatibility
    const rRuleString = rule.toString().replace(/^RRULE:/, '');

    // Create the request
    createRecurrenceRuleMutation.mutate(
      {
        rRule: rRuleString,
        startDate: new Date(data.startDate),
        endDate: data.until ? new Date(data.until) : undefined,
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
