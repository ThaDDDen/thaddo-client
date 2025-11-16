"use client";

import {
  FaAngleLeft,
  FaAngleRight,
  FaBars,
  FaMagnifyingGlass,
  FaPlus,
} from "react-icons/fa6";
import { Button } from "../button";
import AppDialog from "@/components/shared/app-dialog";
import { useState } from "react";
import CreateTaskForm from "@/components/tasks/forms/create-task-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTheme } from "next-themes";

const BottomBar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { logout } = useAuth();
  const { setTheme } = useTheme();

  return (
    <div className="sticky bottom-0 h-14 bg-secondary flex justify-between p-4">
      <FaAngleLeft className="w-6 h-6 " />
      <FaAngleRight className="w-6 h-6 " />
      <FaMagnifyingGlass className="w-6 h-6 " />

      <AppDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        dialogTrigger={<FaPlus className="w-6 h-6 " />}
        dialogTitle="Create Task"
        dialogDescription="Fill out the form to create a new task"
        dialogContent={
          <CreateTaskForm onAfterSubmit={() => setIsDialogOpen(false)} />
        }
        dialogFooter={
          <Button onClick={() => setIsDialogOpen(false)} variant="destructive">
            Cancel
          </Button>
        }
      />
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
