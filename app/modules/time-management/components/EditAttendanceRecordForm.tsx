"use client";

import { useEffect, useState } from "react";
import { getAttendanceRecord, updateAttendanceRecord, getAllTimeExceptions } from '../api/index';
import s from "../page.module.css";
import { Punch, PunchType, TimeException, UpdateAttendanceRecordDto } from "../types";
import Selections from "./Selections";
import { useRouter } from "next/navigation";

interface EditAttendanceRecordFormProps {
    id: string;
    onUpdated?: () => void;
}

export default function EditAttendanceRecordForm({ id, onUpdated }: EditAttendanceRecordFormProps) {
    const router = useRouter();
    const [timeExceptions, setTimeExceptions] = useState<TimeException[]>([]);
    const [employeeId, setEmployeeId] = useState("");
    const [punches, setPunches] = useState<Punch[]>([]);
    const [exceptionIds, setExceptionIds] = useState<string[]>([]);
    const [finalisedForPayroll, setFinalisedForPayroll] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            try {
                const [record, exceptions] = await Promise.all([
                    getAttendanceRecord(id),
                    getAllTimeExceptions()
                ]);

                if (record) {
                    setEmployeeId(record.employeeId);
                    setPunches(record.punches.map((p: any) => ({
                        ...p,
                        time: new Date(p.time)
                    })));
                    setExceptionIds(record.exceptionIds ?? []);
                    setFinalisedForPayroll(record.finalisedForPayroll ?? false);
                } else {
                    setError("Attendance record not found");
                }
                setTimeExceptions(exceptions);
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load attendance record details");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            const payload: UpdateAttendanceRecordDto = {
                punches: punches.map(p => ({
                    type: p.type,
                    time: p.time
                })),
                exceptionIds: exceptionIds.length > 0 ? exceptionIds : undefined,
                finalisedForPayroll
            };

            await updateAttendanceRecord(id, payload);
            alert("Attendance record updated successfully!");
            if (onUpdated) {
                onUpdated();
            } else {
                router.push("/modules/time-management/attendance-record");
            }
        } catch (err) {
            console.error("Error updating attendance record:", err);
            alert("Failed to update record.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className={s.loading}>Loading record details...</div>;
    if (error) return <div className={s.error}>{error}</div>;

    return (
        <form onSubmit={submit} className={s.formContainer}>
            <h2 className={s.header}>Edit Attendance Record</h2>
            <div className={s.grid}>
                <div className={s.field}>
                    <label className={s.description}>Employee (Read-only)</label>
                    <input className={s.select} value={employeeId} disabled />

                    <label className={s.description}>Punches</label>
                    <div className={s.punchList}>
                        {punches.map((punch, index) => (
                            <div key={index} className={s.punchRow}>
                                <input
                                    type="time"
                                    className={s.punchTime}
                                    value={punch.time.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const next = [...punches];
                                        const newTime = new Date(punch.time);
                                        newTime.setHours(hours, minutes);
                                        next[index] = { ...next[index], time: newTime };
                                        setPunches(next);
                                    }}
                                />

                                <select
                                    className={s.select}
                                    value={punch.type}
                                    onChange={(e) => {
                                        const next = [...punches];
                                        next[index] = {
                                            ...next[index],
                                            type: e.target.value as PunchType,
                                        };
                                        setPunches(next);
                                    }}
                                >
                                    <option value={PunchType.IN}>IN</option>
                                    <option value={PunchType.OUT}>OUT</option>
                                </select>

                                <button
                                    type="button"
                                    className={s.punchDelete}
                                    onClick={() => setPunches(punches.filter((_, i) => i !== index))}
                                    aria-label="Remove punch"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            className={s.punchAdd}
                            onClick={() =>
                                setPunches([
                                    ...punches,
                                    {
                                        time: new Date(),
                                        type: PunchType.IN
                                    }
                                ])
                            }
                        >
                            + Add punch
                        </button>
                    </div>

                    <label className={s.description}>Time Exceptions</label>
                    <div className={s.checkboxGroup}>
                        {timeExceptions.map((ex) => (
                            <div key={ex.id} className={s.checkboxItem}>
                                <input
                                    type="checkbox"
                                    checked={exceptionIds.includes(ex.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setExceptionIds([...exceptionIds, ex.id]);
                                        } else {
                                            setExceptionIds(exceptionIds.filter(id => id !== ex.id));
                                        }
                                    }}
                                />
                                <span>{ex.type} - {ex.reason} ({ex.id})</span>
                            </div>
                        ))}
                    </div>

                    <label className={s.description}>Finalised for Payroll</label>
                    <input type="checkbox" checked={finalisedForPayroll} onChange={e => setFinalisedForPayroll(e.target.checked)} />

                    <div className={s.buttonGroup}>
                        <button
                            type="button"
                            className={`${s.button} ${s.secondary}`}
                            onClick={() => router.push("/modules/time-management/attendance-record")}
                        >
                            Cancel
                        </button>
                        <button className={s.button} disabled={loading}>
                            {loading ? "Updating..." : "Update Record"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
