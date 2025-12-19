"use client";

import { useRouter } from "next/navigation";
import s from "../EmployeeDashboard.module.css";
import EmployeeClock from "../components/EmployeeClock";
import EmployeeViewCalendar from "../components/EmployeeViewCalendar";

export default function EmployeeDashboard() {
  const router = useRouter();

  return (
    <main>
      <div className={s.content}>
        <header className={s.dashboardHeader}>
          <div>
            <h1 className={s.headerTitle}>Work Dashboard</h1>
            <p className={s.headerSubtitle}>Manage your time and shifts effortlessly</p>
          </div>
          <button className={s.backButton} onClick={() => router.back()}>
            <span>←</span> Back
          </button>
        </header>

        <div className={s.dashboardLayout}>
          <section className={s.section}>
            <h2 className={s.sectionTitle}>⏱ Quick Punch</h2>
            <EmployeeClock />
          </section>

          <section className={s.section}>
            <h2 className={s.sectionTitle}>📅 Calendar View</h2>
            <EmployeeViewCalendar />
          </section>
        </div>
      </div>
    </main>
  );
}