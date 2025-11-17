"use client";

import { CreateRecurrenceRuleDialog } from "@/components/recurrence-rules/create-recurrence-rule-dialog";
import AppDialog from "@/components/shared/app-dialog";
import CreateTaskForm from "@/components/tasks/forms/create-task-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { Repeat } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBars,
  FaMagnifyingGlass,
  FaPlus,
} from "react-icons/fa6";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../drawer";

const BottomBar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { logout } = useAuth();
  const { setTheme } = useTheme();

  return (
    <div className="sticky bottom-0 h-14 bg-secondary flex justify-between p-4">
      <FaAngleLeft className="w-6 h-6 " />
      <FaAngleRight className="w-6 h-6 " />
      <FaMagnifyingGlass className="w-6 h-6 " />

      <Drawer>
        <DrawerTrigger asChild>
          <FaPlus className="w-6 h-6 " />
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <CreateTaskForm onAfterSubmit={() => setIsDialogOpen(false)} />
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      <CreateRecurrenceRuleDialog>
        <Repeat className="h-6 w-6" />
      </CreateRecurrenceRuleDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <FaBars className="w-6 h-6 " />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="dark:hidden block"
            onClick={() => setTheme("dark")}
          >
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            className="dark:block hidden"
            onClick={() => setTheme("light")}
          >
            Light
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BottomBar;
