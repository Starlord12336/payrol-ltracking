// components/Calendar.tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { addDays, format } from 'date-fns';
import { ShiftAssignmentWithType, Holiday } from '../types';

interface CalendarProps {
  shiftassignments?: ShiftAssignmentWithType[];
  holidays?: Holiday[];
}

export default function Calendar({
  shiftassignments = [],
  holidays = [],
}: CalendarProps) {
  console.log('Calendar received shift assignments:', shiftassignments);

  const shiftEvents = shiftassignments.map((sa) => {
    // Ensure dates are in ISO format
    const startDate = typeof sa.startDate === 'string' ? sa.startDate : new Date(sa.startDate).toISOString();
    const endDate = sa.endDate
      ? (typeof sa.endDate === 'string' ? sa.endDate : new Date(sa.endDate).toISOString())
      : startDate;

    return {
      id: `shift-${sa.id}`,
      title: `Shift ${sa.shiftId}`,
      start: startDate,
      end: endDate,
      color:
        sa.type === 1 ? '#2563eb' : // Department (blue)
          sa.type === 2 ? '#10b981' : // Employee (green)
            '#f59e0b',   // Position (orange)
      allDay: false,
    };
  });

  const holidayEvents = holidays.map((holiday) => ({
    id: `holiday-${holiday.id}`,
    title: `Holiday ${holiday.name ?? holiday.type}`,
    start: holiday.startDate,
    end: holiday.endDate ? addDays(new Date(holiday.endDate), 1).toISOString() : undefined,
    color: '#f87171',
    allDay: true,
  }));

  const events = [...shiftEvents, ...holidayEvents];

  console.log('Calendar events:', events);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      events={events}
      selectable
      editable
      height="auto"
    />
  );
}
