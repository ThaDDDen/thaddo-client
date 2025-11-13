import { TaskDto } from "@/lib/api/generated-client";
import { DayProps } from "react-day-picker";

interface CustomDayProps extends DayProps {
  tasks: TaskDto[];
}

const CustomDay = (props: CustomDayProps) => {
  const { day, tasks } = props;
  return (
    <div className="relative">
      <button>{day.date.getDay()}</button>
      {tasks.length > 0 && <span className="badge">{tasks.length}</span>}
    </div>
  );
};

export default CustomDay;
