import { SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface AppDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>;
  dialogTrigger: React.ReactNode;
  dialogTitle: string;
  dialogDescription: string;
  dialogContent: React.ReactNode;
  dialogFooter: React.ReactNode;
}

const AppDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  dialogTrigger,
  dialogTitle,
  dialogDescription,
  dialogContent,
  dialogFooter,
}: AppDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {dialogContent}
        <DialogFooter>{dialogFooter}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
