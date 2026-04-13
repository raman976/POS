import { CalendarEvent } from '../entities/CalendarEvent';

export interface CreateEventInput {
  ownerId: string;
  title: string;
  description: string
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  reminder?: number | null;
}

export interface UpdateEventInput {
  title?: string;
  description?: string
  startTime?: Date;
  endTime?: Date
  allDay?: boolean;
  reminder?: number | null;
}

export interface ICalendarEventRepository {
  create(input: CreateEventInput): Promise<CalendarEvent>
  findById(id: string, ownerId: string): Promise<CalendarEvent | null>;
  listByOwner(ownerId: string, from?: Date, to?: Date): Promise<CalendarEvent[]>;
  update(id: string, ownerId: string, input: UpdateEventInput): Promise<CalendarEvent | null>
  delete(id: string, ownerId: string): Promise<boolean>;
}
