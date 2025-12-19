"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditAttendanceRecordForm from "../../components/EditAttendanceRecordForm";

function EditPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    if (!id) return <div>No ID provided</div>;

    return <EditAttendanceRecordForm id={id} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditPageContent />
        </Suspense>
    );
}
