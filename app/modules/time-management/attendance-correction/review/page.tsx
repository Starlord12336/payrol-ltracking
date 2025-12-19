import { Suspense } from "react";
import ReviewAttendanceCorrectionForm from "./ReviewAttendanceCorrectionForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewAttendanceCorrectionForm />
    </Suspense>
  );
}
