import { formatDateString, getDateTitle } from "@/lib/utils/dates";

interface DateHeaderProps {
  date: Date;
}

const DateHeader = ({ date }: DateHeaderProps) => {
  return (
    <div className="flex flex-col pt-8 pb-16 items-center gap-4 sticky top-0">
      <h3 className="mx-auto  font-semibold w-fit">{formatDateString(date)}</h3>
      <h1 className=" text-4xl font-bold">{getDateTitle(date)}</h1>
    </div>
  );
};

export default DateHeader;
