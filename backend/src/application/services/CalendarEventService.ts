import { z } from 'zod';
import { CalendarEvent } from '../../domain/entities/CalendarEvent';
import { ICalendarEventRepository } from '../../domain/repositories/ICalendarEventRepository';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().default(''),
  startTime: z.string(),
  endTime: z.string(),
  allDay: z.boolean().optional(),
  reminder: z.number().int().min(0).nullable().optional()
})

const updateSchema = createSchema.partial()

export class CalendarEventService {
  constructor(private readonly events: ICalendarEventRepository) {}

  async createEvent(ownerId: string, input: unknown): Promise<CalendarEvent> {
    const data = createSchema.parse(input)

    const start = new Date(data.startTime)
    const end = new Date(data.endTime)

    if (end <= start) throw new Error('endTime must be after startTime')

    return this.events.create({
      ownerId,
      title: data.title,
      description: data.description,
      startTime: start,
      endTime: end,
      allDay: data.allDay,
      reminder: data.reminder
    })
  }

  async listEvents(ownerId: string, from?: string, to?: string): Promise<CalendarEvent[]> {
    return this.events.listByOwner(
      ownerId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    )
  }

  async getEvent(ownerId: string, eventId: string): Promise<CalendarEvent | null> {
    return this.events.findById(eventId, ownerId)
  }

  async updateEvent(ownerId: string, eventId: string, input: unknown): Promise<CalendarEvent | null> {
    const data = updateSchema.parse(input)
    return this.events.update(eventId, ownerId, {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    })
  }

  async deleteEvent(ownerId: string, eventId: string): Promise<boolean> {
    return this.events.delete(eventId, ownerId)
  }
}
