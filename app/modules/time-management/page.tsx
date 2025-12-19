'use client';

import React, { useEffect, useState } from 'react';
import s from './page.module.css';
import { getAllLatenessRule, getAllSchedule, getAllShifts, getAllShiftsType } from './api/index';
import { LatenessRule, ScheduleRule, Shift, ShiftType } from './types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks';
import { SystemRole } from '@/shared/types';
import SystemInit from './components/SystemInit';

export default function TimeManagementPage() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [latenessRules, setLatenessRules] = useState<LatenessRule[]>([]);
  const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const roles = user?.roles;

  const shiftTypeHref = `${pathname}/shift-type`;
  const shiftsHref = `${pathname}/shifts`;
  const latenessHref = `${pathname}/lateness`;
  const scheduleHref = `${pathname}/schedule`;

  useEffect(() => {
    async function fetchThem() {
      try {
        const st = await getAllShiftsType();
        const s = await getAllShifts();
        const l = await getAllLatenessRule();
        const sr = await getAllSchedule();

        setShiftTypes(st);
        setShifts(s);
        setLatenessRules(l);
        setScheduleRules(sr);
      } catch (err) {
        console.error('Failed to fetch', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchThem();
    }
  }, [user]);

  function Action({
    icon,
    label,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }) {
    return (
      <div className={s.actionCard} onClick={onClick}>
        <span className={s.actionIcon}>{icon}</span>
        <span className={s.actionLabel}>{label}</span>
      </div>
    );
  }


  const nextStep = (() => {
    const label = 'Get started';
    if (shiftTypes.length === 0) {
      return {
        label: label,
        href: shiftTypeHref,
      };
    }

    if (shifts.length === 0) {
      return {
        label: label,
        href: shiftsHref,
      };
    }

    if (latenessRules.length === 0) {
      return {
        label: label,
        href: latenessHref,
      };
    }

    if (scheduleRules.length === 0) {
      return {
        label: label,
        href: scheduleHref,
      };
    }

    return null;
  })();

  return (
    <div className={s.welcomeContainer}>
      <section className={s.welcomeSection}>
        <div className={s.welcomeContent}>
          <button
            className={s.backButton}
            onClick={() => router.back()}
            title="Go back"
          >
            ← Back
          </button>
          <h1 className={s.welcomeTitle}>Time Management</h1>
        </div>
      </section>

      {!roles?.includes(SystemRole.SYSTEM_ADMIN) && !roles?.includes(SystemRole.HR_ADMIN) ? (
        /* NON ADMIN VIEW*/
        <section className={s.quickActionsSection}>
          <div
            className={s.actionCard}
            onClick={() => router.push('/modules/time-management/EmployeeDashboard')}
          >
            <span className={s.actionIcon}>🏠</span>
            <span className={s.actionLabel}>Dashboard</span>
          </div>

        </section>
      ) : (
        <div className={s.welcomeContainer}>
          {/* Show SystemInit if essential data is missing */}
          {(shiftTypes.length === 0 || shifts.length === 0 || latenessRules.length === 0) && (
            <SystemInit
              shiftTypesCount={shiftTypes.length}
              shiftsCount={shifts.length}
              latenessRulesCount={latenessRules.length}
              scheduleRulesCount={scheduleRules.length}
            />
          )}

          <section className={s.quickActionsSection}>
            <h2 className={s.sectionTitle}>Admin actions</h2>
            <p className={s.welcomeSubtitle}>
              Manage attendance, shifts, and policies in one place.
            </p>

            {/* DAILY OPERATIONS */}
            <div className={s.actionGroup}>
              <h3 className={s.groupTitle}>Daily operations</h3>
              <div className={s.actionsGrid}>
                <Action
                  icon="📊"
                  label="Attendance record"
                  onClick={() => router.push('/modules/time-management/attendance-record')}
                />
                <Action
                  icon="⚠️"
                  label="Attendance correction"
                  onClick={() => router.push('/modules/time-management/attendance-correction')}
                />
                <Action
                  icon="📊"
                  label="Generate reports"
                  onClick={() => router.push('/modules/time-management/reports')}
                />
                <Action
                  icon="📊"
                  label="Notifications"
                  onClick={() => router.push('/modules/time-management/notification')}
                />
              </div>
            </div>

            {/* SHIFTS & SCHEDULES */}
            <div className={s.actionGroup}>
              <h3 className={s.groupTitle}>Shifts & schedules</h3>
              <div className={s.actionsGrid}>
                <Action
                  icon="🧩"
                  label="Shift types"
                  onClick={() => router.push('/modules/time-management/shift-type')}
                />
                <Action
                  icon="⏱"
                  label="Shifts"
                  onClick={() => router.push('/modules/time-management/shifts')}
                />
                <Action
                  icon="👥"
                  label="Assign shifts"
                  onClick={() => router.push('/modules/time-management/shift-assignment')}
                />
                <Action
                  icon="📅"
                  label="Schedules"
                  onClick={() => router.push('/modules/time-management/schedule')}
                />
              </div>
            </div>

            {/* RULES & POLICIES */}
            <div className={s.actionGroup}>
              <h3 className={s.groupTitle}>Rules & policies</h3>
              <div className={s.actionsGrid}>
                <Action
                  icon="⚠️"
                  label="Lateness rules"
                  onClick={() => router.push('/modules/time-management/lateness')}
                />
                <Action
                  icon="💰"
                  label="Overtime rules"
                  onClick={() => router.push('/modules/time-management/overtime')}
                />
                <Action
                  icon="📊"
                  label="Time exceptions"
                  onClick={() => router.push('/modules/time-management/time-exception')}
                />
                <Action
                  icon="🏖"
                  label="Holidays"
                  onClick={() => router.push('/modules/time-management/holiday')}
                />
              </div>
            </div>
          </section>
        </div>

      )
      }

    </div >
  );
}