import { z } from 'zod';
import { Task } from '../../domain/entities/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

const createSchema = z.object({
  listName: z.string().min(1).max(80).default('General'),
  title: z.string().min(1).max(200),
  description: z.string().default(''),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional().nullable(),
  isRecurring: z.boolean().optional()
})

const updateSchema = z.object({
  listName: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'done']).optional(),
  dueDate: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
})

export class TaskService {
  constructor(private readonly tasks: ITaskRepository) {}

  async createTask(ownerId: string, input: unknown): Promise<Task> {
    const data = createSchema.parse(input)

    return this.tasks.create({
      ownerId,
      listName: data.listName,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      isRecurring: data.isRecurring ?? false,
    })
  }

  async listTasks(ownerId: string): Promise<Task[]> {
    return this.tasks.listByOwner(ownerId)
  }

  async getTask(ownerId: string, taskId: string): Promise<Task | null> {
    return this.tasks.findById(taskId, ownerId)
  }

  async updateTask(ownerId: string, taskId: string, input: unknown): Promise<Task | null> {
    const data = updateSchema.parse(input)

    return this.tasks.update(taskId, ownerId, {
      ...data,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
    })
  }

  async deleteTask(ownerId: string, taskId: string): Promise<boolean> {
    return this.tasks.delete(taskId, ownerId)
  }
}
