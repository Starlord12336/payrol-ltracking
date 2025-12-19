import { NotificationLog } from "../types";
import s from "../page.module.css";

interface NotificationLogListProps {
  notifications: NotificationLog[];
  onDelete: (id: string) => void;
}

export default function NotificationLogList({ notifications, onDelete }: NotificationLogListProps) {
  if (!notifications.length) return <p>No notifications found</p>;

  /*
    id: string;
    to: string;
    type: string;
    message?: string;
  */

  return (
    <div className={s.cardContainer}>
      {notifications.map((notification) => (
        <div key={notification.id} className={s.Card}>
          <h4 className={s.header}>{notification.to}</h4>

          <p className={s.description}>
            Type: {notification.type}
          </p>

          {notification.message && (
            <p className={s.description}>
              Message: {notification.message}
            </p>
          )}

          <button
            className={s.button}
            onClick={() => onDelete(notification.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
