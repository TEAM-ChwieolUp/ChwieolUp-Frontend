import { api, fetcher } from '@/lib/api';
import { shouldUseTemporaryDevData } from '@/lib/api/dev-auth';
import { TEMP_DEV_CALENDAR_EVENTS } from '@/lib/api/dev-mock-data';
import type { ApiSuccessResponse, QueryParams } from '@/lib/api';
import type {
  CalendarApplicationOption,
  CalendarEvent,
  ScheduleCategory,
} from '@/components/calendar/types';
import { listApplications } from '@/features/kanban/api/applications';

interface ScheduleEventResponse {
  id: number;
  applicationId: number | null;
  category: ScheduleCategory;
  title: string;
  startAt: string;
  endAt: string | null;
}

interface CalendarResponseData {
  events: ScheduleEventResponse[];
}

export interface CalendarQueryParams extends QueryParams {
  from: string;
  to: string;
  category?: string;
}

export interface CreateScheduleEventPayload {
  category: ScheduleCategory;
  applicationId?: string | null;
  title: string;
  startAt: string;
  endAt?: string | null;
}

export interface UpdateScheduleEventPayload {
  category?: ScheduleCategory | null;
  applicationId?: string | null;
  title?: string | null;
  startAt?: string | null;
  endAt?: string | null;
}

export const scheduleKeys = {
  all: ['schedule'] as const,
  calendar: (params: CalendarQueryParams) => ['schedule', 'calendar', params] as const,
  applications: ['schedule', 'applications'] as const,
};

function mapScheduleEventToCalendarEvent(event: ScheduleEventResponse): CalendarEvent {
  return {
    id: String(event.id),
    applicationId:
      event.applicationId === null ? null : String(event.applicationId),
    category: event.category,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt ?? null,
  };
}

export async function listCalendarEvents(
  params: CalendarQueryParams
): Promise<CalendarEvent[]> {
  if (shouldUseTemporaryDevData()) {
    return TEMP_DEV_CALENDAR_EVENTS.filter((event) => {
      const eventStart = new Date(event.startAt).getTime();
      const from = new Date(params.from).getTime();
      const to = new Date(params.to).getTime();

      return eventStart >= from && eventStart <= to;
    });
  }

  const calendarResponse = await api.get<ApiSuccessResponse<CalendarResponseData>>(
    '/api/schedule/calendar',
    {
      params,
    }
  );

  return calendarResponse.data.events.map(mapScheduleEventToCalendarEvent);
}

export async function createScheduleEvent(payload: CreateScheduleEventPayload) {
  const response = await api.post<ApiSuccessResponse<ScheduleEventResponse>>(
    '/api/schedule/events',
    {
      category: payload.category,
      applicationId:
        payload.applicationId === undefined || payload.applicationId === null || payload.applicationId === ''
          ? null
          : Number(payload.applicationId),
      title: payload.title,
      startAt: payload.startAt,
      endAt: payload.endAt ?? null,
    }
  );

  return response.data;
}

export async function updateScheduleEvent(
  eventId: string,
  payload: UpdateScheduleEventPayload
) {
  const response = await api.patch<ApiSuccessResponse<ScheduleEventResponse>>(
    `/api/schedule/events/${eventId}`,
    {
      category: payload.category,
      applicationId:
        payload.applicationId === undefined
          ? undefined
          : payload.applicationId === null || payload.applicationId === ''
            ? null
            : Number(payload.applicationId),
      title: payload.title ?? null,
      startAt: payload.startAt ?? null,
      endAt: payload.endAt ?? null,
    }
  );

  return response.data;
}

export async function deleteScheduleEvent(eventId: string) {
  await api.delete(`/api/schedule/events/${eventId}`);
}

export async function listScheduleApplicationOptions(): Promise<
  CalendarApplicationOption[]
> {
  const board = await listApplications();

  return board.cards
    .map((card) => ({
      id: card.id,
      companyName: card.company,
      position: card.position,
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName, 'ko'));
}

export async function downloadScheduleEventIcs(
  eventId: string,
  fileName?: string
) {
  if (shouldUseTemporaryDevData()) {
    const calendarText = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChwieolUp//Temp Dev Event//KO',
      'BEGIN:VEVENT',
      `UID:${eventId}@chwieolup.local`,
      'DTSTAMP:20260508T000000Z',
      'DTSTART:20260510T040000Z',
      'DTEND:20260510T060000Z',
      'SUMMARY:OpenAI Korea 과제 제출',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([calendarText], {
      type: 'text/calendar;charset=utf-8',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = fileName ?? `cheerup-event-${eventId}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
    return;
  }

  const calendarText = await fetcher<string>(
    `/api/schedule/events/${eventId}/export`
  );
  const blob = new Blob([calendarText], {
    type: 'text/calendar;charset=utf-8',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = downloadUrl;
  anchor.download = fileName ?? `cheerup-event-${eventId}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
}
