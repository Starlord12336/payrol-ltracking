"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/hooks";
import s from "../../page.module.css";

import {
    AttendanceCorrectionRequest,
    CorrectionRequestStatus,
} from "../../types";
import {
    getAttendanceCorrection,
    updateAttendanceCorrection,
} from "../../api";

/* ----------------------------------
   Types
----------------------------------- */

interface ReviewCorrectionFormProps {
    onUpdated?: () => void;
}

interface AttendanceCorrectionAPIResponse {
    id: string;
    employeeId: string;
    attendanceRecord: any;
    reason?: string;
    status: CorrectionRequestStatus;
}

/* ----------------------------------
   Component
----------------------------------- */

export default function ReviewAttendanceCorrectionForm({
    onUpdated,
}: ReviewCorrectionFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const requestId = searchParams.get("id");

    const [attendanceCorrectionRequest, setAttendanceCorrectionRequest] =
        useState<AttendanceCorrectionAPIResponse | null>(null);

    const [status, setStatus] = useState<CorrectionRequestStatus | "">("");
    const [reviewerComment, setReviewerComment] = useState("");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ----------------------------------
       Fetch request
    ----------------------------------- */

    useEffect(() => {
        if (!requestId) {
            setError("No request ID provided");
            setFetching(false);
            return;
        }

        fetchAttendanceCorrectionRequest(requestId);
    }, [requestId]);

    const fetchAttendanceCorrectionRequest = async (id: string) => {
        setFetching(true);
        setError(null);

        try {
            const data = await getAttendanceCorrection(id);
            if (!data) {
                setError("Request not found");
                return;
            }

            setAttendanceCorrectionRequest(data);
            setStatus(data.status);
        } catch (err) {
            console.error(err);
            setError("Failed to load request. Please try again.");
        } finally {
            setFetching(false);
        }
    };

    /* ----------------------------------
       Submit update
    ----------------------------------- */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requestId || !status) return;

        setLoading(true);
        setError(null);

        try {
            const payload = {
                status,
                reviewedBy: user?.userid,
                reviewerComment: reviewerComment || undefined,
                reviewedAt: new Date().toISOString(),
            };

            const result = await updateAttendanceCorrection(requestId, payload);

            if (!result) {
                setError("Failed to update request.");
                return;
            }

            await fetchAttendanceCorrectionRequest(requestId);

            alert("Request updated successfully");

            onUpdated?.();
        } catch (err) {
            console.error(err);
            setError("An error occurred while updating.");
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------------
       Navigation
    ----------------------------------- */

    const handleBack = () => {
        router.push("/modules/time-management/attendance-correction");
    };

    /* ----------------------------------
       UI States
    ----------------------------------- */

    if (fetching) {
        return (
            <div className={s.buttonCollection}>
                <div className={s.loading}>Loading request details...</div>
            </div>
        );
    }

    if (error || !attendanceCorrectionRequest) {
        return (
            <div className={s.buttonCollection}>
                <div>{error || "Request not found"}</div>
                <button className={s.button} onClick={handleBack}>
                    Back to List
                </button>
            </div>
        );
    }

    /* ----------------------------------
       Render
    ----------------------------------- */

    return (
        <div className={s.container}>
            <div>
                <button className={s.button} onClick={handleBack}>
                    ← Back
                </button>

                <h2 className={s.header}>
                    Review Attendance Correction Request
                </h2>
            </div>

            <div className={s.description}>
                <div className={s.detailRow}>
                    <span className={s.detailLabel}>Request ID:</span>
                    <span className={s.detailValue}>
                        {attendanceCorrectionRequest.id}
                    </span>
                </div>

                <div className={s.detailRow}>
                    <span className={s.detailLabel}>Employee ID:</span>
                    <span className={s.detailValue}>
                        {attendanceCorrectionRequest.employeeId}
                    </span>
                </div>

                {attendanceCorrectionRequest.reason && (
                    <div className={s.detailRow}>
                        <span className={s.detailLabel}>Reason:</span>
                        <span className={s.detailValue}>
                            {attendanceCorrectionRequest.reason}
                        </span>
                    </div>
                )}

                <div className={s.detailRow}>
                    <span className={s.detailLabel}>Current Status:</span>
                    <span
                        className={`${s.statusBadge} ${s[attendanceCorrectionRequest.status.toLowerCase()]
                            }`}
                    >
                        {attendanceCorrectionRequest.status.replace("_", " ")}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
                <div className={s.formSection}>
                    <h3 className={s.header2}>Update Status</h3>

                    <div className={s.field}>
                        <label className={s.label}>Status *</label>
                        <select
                            className={s.select}
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as CorrectionRequestStatus)
                            }
                            disabled={loading}
                            required
                        >
                            <option value="" disabled>
                                Select new status
                            </option>

                            {Object.values(CorrectionRequestStatus)
                                .filter(
                                    (s) =>
                                        !["SUBMITTED", "IN_REVIEW", "ESCALATED"].includes(s)
                                )
                                .map((s) => (
                                    <option key={s} value={s}>
                                        {s.replace("_", " ")}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {error && <div className={s.error}>{error}</div>}

                    <div className={s.buttonGroup}>
                        <button
                            type="button"
                            className={`${s.button} ${s.secondary}`}
                            onClick={handleBack}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={s.button}
                            disabled={loading || !status}
                        >
                            {loading ? "Updating..." : "Update Status"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
