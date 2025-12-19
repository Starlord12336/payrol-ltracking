import { LatenessRule } from "../types";
import s from "../page.module.css";
import { updateLatenessRule } from "../api/index";

interface EmployeeViewLatenessProps {
  latenessrules: LatenessRule[];
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export default function EmployeeViewLateness({
  latenessrules,
  onDelete,
  onToggleStatus
}: EmployeeViewLatenessProps) {
  if (!latenessrules.length) return <p>No lateness rules found</p>;

  const handleToggleClick = async (id: string, currentActive: boolean) => {
    try {
      await updateLatenessRule(id, { active: !currentActive });
      if (onToggleStatus)
        onToggleStatus(id);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className={s.cardcontainer}>
      {latenessrules
        .filter((rule) => rule.active)
        .map((rule) => (
          <div key={rule.id} className={s.Card}>
            <h4 className={s.header}>{rule.name}</h4>

            {rule.description && (
              <p className={s.description}>
                Description: {rule.description}
              </p>
            )}

            <p className={s.description}>
              Grace Period: {rule.gracePeriodMinutes} minutes
            </p>
            <p className={s.descriptionWarn}>
              Note: This does not include your assigned shift&apos;s Grace Period
            </p>

            <p className={s.description}>
              Deduction per Minute: {rule.deductionForEachMinute}
            </p>
          </div>
        ))}
    </div>
  );
}