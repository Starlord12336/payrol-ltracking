import { LatenessRule } from "../types";
import s from "../page.module.css";
import { updateLatenessRule } from "../api/index";

interface LatenessRuleListProps {
  latenessrules: LatenessRule[];
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export default function LatenessRuleList({ 
  latenessrules, 
  onDelete, 
  onToggleStatus 
}: LatenessRuleListProps) {
  if (!latenessrules.length) return <p>No lateness rules found</p>;

  const handleToggleClick = async (id: string, currentActive: boolean) => {
    try {
      await updateLatenessRule(id, { active: !currentActive });
      if(onToggleStatus)onToggleStatus(id);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className={s.cardcontainer}>
      {latenessrules.map((rule) => (
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

          <p className={s.description}>
            Deduction per Minute: {rule.deductionForEachMinute}
          </p>

          <p className={s.description}>
            Active? {rule.active ? "Yes" : "No"}
          </p>

          <button
            className={`${s.button} ${rule.active ? s.deactivateBtn : s.activateBtn}`}
            onClick={() => handleToggleClick(rule.id, rule.active)}
          >
            {rule.active ? "Deactivate" : "Activate"}
          </button>

          <button
            className={s.button}
            onClick={() => onDelete(rule.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}