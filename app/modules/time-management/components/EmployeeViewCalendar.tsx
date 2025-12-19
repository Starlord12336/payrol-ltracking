'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '@/shared/hooks'; // Add this import
import { getAllHolidays, getShiftAssignmentsByEmployee } from '../api/index';
import { getShiftName } from './utils';
import s from './EmployeeViewCalendar.module.css';
import Calendar from './Calendar';

const getHolidayColor = (type: string) => {
  switch (type) {
    case 'NATIONAL':
      return '#584d4dff';
    case 'ORGANIZATIONAL':
      return '#00ff2fff';
    case 'WEEKLY_REST':
      return '#ff0000ff';
    default:
      return '#6d65ff';
  }
};

const getShiftAssignmentColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return '#10b981'; // Green
    case 'PENDING':
      return '#f59e0b'; // Yellow
    case 'REJECTED':
      return '#ef4444'; // Red
    case 'CANCELLED':
      return '#6b7280'; // Gray
    default:
      return '#3b82f6'; // Blue
  }
};

export default function EmployeeViewCalendar({ defaultView = 'holidays' }: { defaultView?: 'holidays' | 'shifts' }) {
  const { user } = useAuth(); // Get the logged-in user
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<'holidays' | 'shifts'>(defaultView);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (calendarView === 'holidays') {
          // Fetch holidays
          const holidays = await getAllHolidays();
          const holidayEvents = holidays
            .filter(h => h.active)
            .map(h => ({
              id: `holiday-${h.id}`,
              title: h.name,
              start: h.startDate,
              end: h.endDate ?? h.startDate,
              allDay: true,
              color: getHolidayColor(h.type),
              extendedProps: { type: 'holiday' }
            }));
          setEvents(holidayEvents);
        } else {
          // Fetch shift assignments for the current employee
          if (user?.userid) {
            const shiftAssignments = await getShiftAssignmentsByEmployee(user.userid);

            // Transform shift assignments into calendar events
            const shiftEvents = await Promise.all(
              shiftAssignments.map(async (assignment: any) => {
                // Fetch shift details to get name and times
                const shift = await getShiftAssignmentsByEmployee(assignment.shiftId);

                const startDate = new Date(assignment.startDate);
                const endDate = assignment.endDate ? new Date(assignment.endDate) : null;

                // Create recurring events for each day in the date range
                const events = [];
                const currentDate = new Date(startDate);

                while (!endDate || currentDate <= endDate) {
                  if (shift) {
                    // Create event with shift timing
                    const eventDate = new Date(currentDate);
                    const eventStart = new Date(eventDate);
                    const eventEnd = new Date(eventDate);

                    // Parse shift start/end times
                    if (shift.startTime && shift.endTime) {
                      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
                      const [endHour, endMinute] = shift.endTime.split(':').map(Number);

                      eventStart.setHours(startHour, startMinute, 0);
                      eventEnd.setHours(endHour, endMinute, 0);
                    }

                    events.push({
                      id: `shift-${assignment._id}-${eventDate.toISOString().split('T')[0]}`,
                      title: `${getShiftName(shift, assignment.shiftId)}`,
                      start: eventStart.toISOString(),
                      end: eventEnd.toISOString(),
                      allDay: true,
                      color: getShiftAssignmentColor(assignment.status),
                      extendedProps: {
                        type: 'shift',
                        shiftName: shift.name,
                        status: assignment.status,
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        assignmentId: assignment._id
                      }
                    });
                  }

                  // Move to next day
                  currentDate.setDate(currentDate.getDate() + 1);

                  // If no end date, only show one day
                  if (!endDate) break;
                }

                return events;
              })
            );

            // Flatten the array of arrays
            const flattenedEvents = shiftEvents.flat();
            setEvents(flattenedEvents);
          }
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userid, calendarView]);

  if (loading) return <p>Loading calendar data...</p>;

  return (
    <div className={s.calendarContainer}>
      <div className={s.controls}>
        <div className={s.toggleContainer}>
          <button
            onClick={() => setCalendarView('shifts')}
            className={`${s.toggleBtn} ${calendarView === 'shifts' ? s.active : ''}`}
          >
            My Shifts
          </button>
          <button
            onClick={() => setCalendarView('holidays')}
            className={`${s.toggleBtn} ${calendarView === 'holidays' ? s.active : ''}`}
          >
            Holidays
          </button>
        </div>

        <div className={s.legend}>
          {calendarView === 'shifts' ? (
            <>
              <div className={s.legendItem}>
                <div className={s.dot} style={{ backgroundColor: '#10b981' }}></div>
                <span>Approved</span>
              </div>
              <div className={s.legendItem}>
                <div className={s.dot} style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Pending</span>
              </div>
              <div className={s.legendItem}>
                <div className={s.dot} style={{ backgroundColor: '#ef4444' }}></div>
                <span>Rejected</span>
              </div>
            </>
          ) : (
            <>
              <div className={s.legendItem}>
                <div className={s.dot} style={{ backgroundColor: '#584d4d' }}></div>
                <span>National</span>
              </div>
              <div className={s.legendItem}>
                <div className={s.dot} style={{ backgroundColor: '#00ff2f' }}></div>
                <span>Org</span>
              </div>
              <div className={s.legendItem}>
                <div className={s.dot} style={{ backgroundColor: '#ff0000' }}></div>
                <span>Rest</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={s.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          eventClick={(info) => {
            const event = info.event;
            const extendedProps = event.extendedProps;

            if (extendedProps.type === 'shift') {
              alert(
                `Shift: ${extendedProps.shiftName}\n` +
                `Status: ${extendedProps.status}\n` +
                `Time: ${extendedProps.startTime} - ${extendedProps.endTime}\n` +
                `Date: ${event.start?.toLocaleDateString()}`
              );
            } else {
              alert(
                `Holiday: ${event.title}\n` +
                `Date: ${event.start?.toLocaleDateString()}`
              );
            }
          }}
          eventContent={(eventInfo) => {
            const timeText = eventInfo.event.allDay ? '' : eventInfo.timeText;
            return (
              <div style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                {eventInfo.event.title}
                {timeText && <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{timeText}</div>}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
