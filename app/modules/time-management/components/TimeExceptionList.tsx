import { TimeException } from "../types";
import s from "../page.module.css";

interface TimeExceptionListProps {
  timeexceptions: TimeException[];
  onDelete: (id: string) => void;
}

export default function TimeExceptionList({ timeexceptions, onDelete }: TimeExceptionListProps) {
  if (!timeexceptions.length) return <p>No time Exceptions found!</p>;

  return (
    <div className={s.cardContainer}>
      {timeexceptions.map((timeexception) => (
        <div key={timeexception.id} className={s.Card}>
          <p className={s.description}>
            Time Exception Assigned to: {timeexception.assignedTo}
          </p>

          <p className={s.description}>
            Reason: {timeexception.reason}
          </p>

          <p className={s.description}>
            Status: {timeexception.status}
          </p>

          <p className={s.description}>
            Type: {timeexception.type}
          </p>

          <button className={s.button} onClick={() => onDelete(timeexception.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
