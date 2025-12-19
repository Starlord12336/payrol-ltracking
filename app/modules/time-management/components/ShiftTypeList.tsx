import { ShiftType } from "../types";
import s from "../page.module.css";
import { getShiftType, updateShiftType } from "../api";

interface ShiftTypeListProps {
  shifttypes: ShiftType[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const toggleShiftTypeStatus = async (id: string) => {
  let st = await getShiftType(id);
  await updateShiftType(id, { active: !st.active });
}

export default function ShiftTypeList({
  shifttypes,
  onDelete,
  onToggleStatus // From parent
}: ShiftTypeListProps) {

  const handleToggleClick = async (id: string) => {
    try {
      // Call your API function
      await toggleShiftTypeStatus(id);
      // Notify parent to update state
      onToggleStatus(id);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  if (!shifttypes.length) return <p>No shift Types found</p>;

  return (
    <div className={s.cardContainer}>
      {shifttypes.map((shifttype) => (
        <div key={shifttype.id} className={s.Card}>
          <h4 className={s.header}>{shifttype.name}</h4>

          <p className={s.description}>
            Status: <span className={shifttype.active ? s.activeStatus : s.inactiveStatus}>
              {shifttype.active ? 'Active' : 'Inactive'}
            </span>
          </p>

          <div className={s.buttonContainer}>
            <button
              className={`${s.button} ${s.toggleButton} ${shifttype.active ? s.deactivateBtn : s.activateBtn}`}
              onClick={() => handleToggleClick(shifttype.id)} // Use local handler
            >
              {shifttype.active ? 'Deactivate' : 'Activate'}
            </button>

            <button
              className={`${s.button} ${s.deleteButton}`}
              onClick={() => onDelete(shifttype.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}