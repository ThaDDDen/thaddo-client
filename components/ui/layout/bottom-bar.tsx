"use client";

import UnifiedTaskForm from "@/components/tasks/forms/unified-task-form";
import { useAuth } from "@/lib/hooks/use-auth";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const { setTheme } = useTheme();

  return (
    <div className="sticky bottom-0 h-14 bg-secondary flex justify-between p-4">
      <FaAngleLeft className="w-6 h-6 " />
      <FaAngleRight className="w-6 h-6 " />
      <FaMagnifyingGlass className="w-6 h-6 " />

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <button className="focus:outline-none">
            <FaPlus className="w-6 h-6" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create Task</DrawerTitle>
            <DrawerDescription>
              Fill out the form to create a new task
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
            <UnifiedTaskForm onAfterSubmit={() => setIsDrawerOpen(false)} />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none">
            <FaBars className="w-6 h-6 " />
          </button>
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
