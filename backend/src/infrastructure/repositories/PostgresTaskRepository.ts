import { Task } from '../../domain/entities/Task';
import { CreateTaskInput, ITaskRepository, UpdateTaskInput } from '../../domain/repositories/ITaskRepository';
import { pool } from '../db/pool';

interface TaskRow {
  id: string;
  owner_id: string
  list_name: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: Date | null;
  is_recurring: boolean;
  created_at: Date;
  updated_at: Date
}

const toTask = (row: TaskRow): Task =>
  new Task({
    id: row.id,
    ownerId: row.owner_id,
    listName: row.list_name,
    title: row.title,
    description: row.description,
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    dueDate: row.due_date,
    isRecurring: row.is_recurring,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

export class PostgresTaskRepository implements ITaskRepository {

  async create(input: CreateTaskInput): Promise<Task> {
    const { rows } = await pool.query<TaskRow>(
      `INSERT INTO tasks (owner_id, list_name, title, description, priority, due_date, is_recurring)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.ownerId, input.listName ?? 'General', input.title, input.description, input.priority, input.dueDate ?? null, input.isRecurring ?? false]
    )
    return toTask(rows[0])
  }

  async findById(id: string, ownerId: string): Promise<Task | null> {
    const { rows } = await pool.query<TaskRow>(
      `SELECT * FROM tasks WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    )
    return rows.length > 0 ? toTask(rows[0]) : null
  }

  async listByOwner(ownerId: string): Promise<Task[]> {
    const { rows } = await pool.query<TaskRow>(
      `SELECT * FROM tasks WHERE owner_id = $1 ORDER BY created_at DESC`,
      [ownerId]
    )
    return rows.map(toTask)
  }

  async update(id: string, ownerId: string, input: UpdateTaskInput): Promise<Task | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIdx = 1

    if (input.title !== undefined) { fields.push(`title = $${paramIdx++}`); values.push(input.title) }
    if (input.listName !== undefined) { fields.push(`list_name = $${paramIdx++}`); values.push(input.listName) }
    if (input.description !== undefined) { fields.push(`description = $${paramIdx++}`); values.push(input.description) }
    if (input.priority !== undefined) { fields.push(`priority = $${paramIdx++}`); values.push(input.priority) }
    if (input.status !== undefined) { fields.push(`status = $${paramIdx++}`); values.push(input.status) }
    if (input.dueDate !== undefined) { fields.push(`due_date = $${paramIdx++}`); values.push(input.dueDate) }
    if (input.isRecurring !== undefined) { fields.push(`is_recurring = $${paramIdx++}`); values.push(input.isRecurring) }

    if (fields.length === 0) return this.findById(id, ownerId)

    fields.push(`updated_at = NOW()`)
    values.push(id, ownerId)

    const { rows } = await pool.query<TaskRow>(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIdx++} AND owner_id = $${paramIdx} RETURNING *`,
      values
    )
    return rows.length > 0 ? toTask(rows[0]) : null
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    )
    return (result.rowCount ?? 0) > 0
  }
}
