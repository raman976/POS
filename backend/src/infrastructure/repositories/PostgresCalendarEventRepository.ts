import { CalendarEvent } from '../../domain/entities/CalendarEvent';
import { CreateEventInput, ICalendarEventRepository, UpdateEventInput } from '../../domain/repositories/ICalendarEventRepository';
import { pool } from '../db/pool';

interface EventRow {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date
  all_day: boolean;
  reminder: number | null;
  created_at: Date;
  updated_at: Date;
}

const toEvent = (row: EventRow): CalendarEvent =>
  new CalendarEvent({
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    startTime: row.start_time,
    endTime: row.end_time,
    allDay: row.all_day,
    reminder: row.reminder,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

export class PostgresCalendarEventRepository implements ICalendarEventRepository {

  async create(input: CreateEventInput): Promise<CalendarEvent> {
    const { rows } = await pool.query<EventRow>(
      `INSERT INTO calendar_events (owner_id, title, description, start_time, end_time, all_day, reminder)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.ownerId, input.title, input.description, input.startTime, input.endTime, input.allDay ?? false, input.reminder ?? null]
    )
    return toEvent(rows[0])
  }

  async findById(id: string, ownerId: string): Promise<CalendarEvent | null> {
    const { rows } = await pool.query<EventRow>(
      `SELECT * FROM calendar_events WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    )
    return rows.length > 0 ? toEvent(rows[0]) : null
  }

  async listByOwner(ownerId: string, from?: Date, to?: Date): Promise<CalendarEvent[]> {
    let query = `SELECT * FROM calendar_events WHERE owner_id = $1`
    const params: unknown[] = [ownerId]

    if (from) { query += ` AND start_time >= $${params.length + 1}`; params.push(from) }
    if (to) { query += ` AND end_time <= $${params.length + 1}`; params.push(to) }

    query += ' ORDER BY start_time ASC'

    const { rows } = await pool.query<EventRow>(query, params)
    return rows.map(toEvent)
  }

  async update(id: string, ownerId: string, input: UpdateEventInput): Promise<CalendarEvent | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (input.title !== undefined) { fields.push(`title = $${idx++}`); values.push(input.title) }
    if (input.description !== undefined) { fields.push(`description = $${idx++}`); values.push(input.description) }
    if (input.startTime !== undefined) { fields.push(`start_time = $${idx++}`); values.push(input.startTime) }
    if (input.endTime !== undefined) { fields.push(`end_time = $${idx++}`); values.push(input.endTime) }
    if (input.allDay !== undefined) { fields.push(`all_day = $${idx++}`); values.push(input.allDay) }
    if (input.reminder !== undefined) { fields.push(`reminder = $${idx++}`); values.push(input.reminder) }

    if (fields.length === 0) return this.findById(id, ownerId)

    fields.push(`updated_at = NOW()`)
    values.push(id, ownerId)

    const { rows } = await pool.query<EventRow>(
      `UPDATE calendar_events SET ${fields.join(', ')} WHERE id = $${idx++} AND owner_id = $${idx} RETURNING *`,
      values
    )
    return rows.length > 0 ? toEvent(rows[0]) : null
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const r = await pool.query(`DELETE FROM calendar_events WHERE id = $1 AND owner_id = $2`, [id, ownerId])
    return (r.rowCount ?? 0) > 0
  }
}
