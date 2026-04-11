import { randomUUID } from 'crypto';
import { Task } from '../../domain/entities/Task';
import { CreateTaskInput, ITaskRepository, UpdateTaskInput } from '../../domain/repositories/ITaskRepository';

export class InMemoryTaskRepository implements ITaskRepository {
  private store: Map<string, Task> = new Map()

  async create(input: CreateTaskInput): Promise<Task> {
    const task = new Task({
      id: randomUUID(),
      ownerId: input.ownerId,
      listName: input.listName ?? 'General',
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: 'pending',
      dueDate: input.dueDate ?? null,
      isRecurring: input.isRecurring ?? false,
    })
    this.store.set(task.id, task)
    return task
  }

  async findById(id: string, ownerId: string): Promise<Task | null> {
    const t = this.store.get(id)
    return t && t.ownerId === ownerId ? t : null
  }

  async listByOwner(ownerId: string): Promise<Task[]> {
    return Array.from(this.store.values())
      .filter(t => t.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async update(id: string, ownerId: string, input: UpdateTaskInput): Promise<Task | null> {
    const existing = this.store.get(id)
    if (!existing || existing.ownerId !== ownerId) return null

    const updated = new Task({
      id: existing.id,
      ownerId: existing.ownerId,
      listName: input.listName ?? existing.listName,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      priority: input.priority ?? existing.priority,
      status: input.status ?? existing.status,
      dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
      isRecurring: input.isRecurring ?? existing.isRecurring,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    })
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const t = this.store.get(id)
    if (!t || t.ownerId !== ownerId) return false
    this.store.delete(id)
    return true
  }
}
