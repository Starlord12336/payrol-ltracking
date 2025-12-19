import { AttendanceCorrectionRequest } from "../types";
import s from "../page.module.css";
import { SystemRole } from "@/shared/types";
import { useAuth } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Add this

interface AttendanceCorrectionRequestListProps {
  attendancecorrectionrequests: AttendanceCorrectionRequest[];
  onDelete: (id: string) => void;
  onReview?: (request: AttendanceCorrectionRequest) => void; // Optional callback
}

export default function AttendanceCorrectionRequestList({
  attendancecorrectionrequests,
  onDelete,
  onReview,
}: AttendanceCorrectionRequestListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null); // Track loading state

  const handleReview = async (request: AttendanceCorrectionRequest) => {
    // Optional: Add pre-navigation logic
    console.log("Reviewing request:", request.id);

    // Optional: Call parent callback
    if (onReview) {
      onReview(request);
    }

    // Optional: Set loading state
    setLoadingId(request.id);

    try {
      // Optional: Fetch additional data before navigation
      // const requestDetails = await fetchRequestDetails(request.id);

      // Optional: Check if review is allowed based on status
      if (request.status === "APPROVED" || request.status === "REJECTED") {
        if (window.confirm(`This request is already ${request.status}. Do you still want to review?`)) {
          router.push(`/modules/time-management/attendance-correction/review?id=${request.id}`);
        }
        return;
      }

      // Navigate to review page
      router.push(`/modules/time-management/attendance-correction/review?id=${request.id}`);
    } catch (error) {
      console.error("Error preparing review:", error);
      alert("Failed to prepare review. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      onDelete(id);
    }
  };

  if (!attendancecorrectionrequests.length) return <p>No attendance correction requests found</p>;

  return (
    <div className={s.attendancecorrectionrequestContainer}>
      {attendancecorrectionrequests.map((request) => (
        <div key={request.id} className={s.Card}>
          <h4 className={s.header}>Employee ID: {request.employeeId}</h4>

          {request.reason && (
            <p className={s.description}>
              Reason: {request.reason}
            </p>
          )}

          <p className={s.description}>
            Status: <span className={`${s.button} ${s[request.status.toLowerCase()]}`}>
              {request.status.replace("_", " ")}
            </span>
          </p>

          {(user?.roles?.includes(SystemRole.SYSTEM_ADMIN) || user?.roles?.includes(SystemRole.HR_ADMIN)) && (
            <div className={s.buttonCollection}>
              <button
                className={s.button}
                onClick={() => handleDelete(request.id)}
                disabled={loadingId === request.id}
              >
                Delete
              </button>
              <button
                className={s.button}
                onClick={() => handleReview(request)}
                disabled={loadingId === request.id}
              >
                {loadingId === request.id ? (
                  <>
                    <span className={s.button}></span> Loading...
                  </>
                ) : (
                  "Review"
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}