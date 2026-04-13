import { randomUUID } from 'crypto';
import { CalendarEvent } from '../../domain/entities/CalendarEvent';
import { CreateEventInput, ICalendarEventRepository, UpdateEventInput } from '../../domain/repositories/ICalendarEventRepository';

export class InMemoryCalendarEventRepository implements ICalendarEventRepository {
  private store: Map<string, CalendarEvent> = new Map()

  async create(input: CreateEventInput): Promise<CalendarEvent> {
    const event = new CalendarEvent({
      id: randomUUID(),
      ownerId: input.ownerId,
      title: input.title,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      allDay: input.allDay,
      reminder: input.reminder
    })
    this.store.set(event.id, event)
    return event
  }

  async findById(id: string, ownerId: string): Promise<CalendarEvent | null> {
    const e = this.store.get(id)
    return e && e.ownerId === ownerId ? e : null
  }

  async listByOwner(ownerId: string, from?: Date, to?: Date): Promise<CalendarEvent[]> {
    let results = Array.from(this.store.values()).filter(e => e.ownerId === ownerId)

    if (from) results = results.filter(e => e.startTime >= from)
    if (to) results = results.filter(e => e.endTime <= to)

    return results.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  async update(id: string, ownerId: string, input: UpdateEventInput): Promise<CalendarEvent | null> {
    const existing = this.store.get(id)
    if (!existing || existing.ownerId !== ownerId) return null

    const updated = new CalendarEvent({
      id: existing.id,
      ownerId: existing.ownerId,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      allDay: input.allDay ?? existing.allDay,
      reminder: input.reminder !== undefined ? input.reminder : existing.reminder,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    })
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const e = this.store.get(id)
    if (!e || e.ownerId !== ownerId) return false
    this.store.delete(id)
    return true
  }
}
