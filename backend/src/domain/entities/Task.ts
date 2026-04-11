import { BaseEntity } from './BaseEntity';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export class Task extends BaseEntity {
  public readonly listName: string;
  public readonly title: string;
  public readonly description: string;
  public readonly priority: TaskPriority;
  public readonly status: TaskStatus
  public readonly dueDate: Date | null;
  public readonly isRecurring: boolean;

  constructor(data: {
    id: string
    ownerId: string;
    listName?: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: Date | null;
    isRecurring?: boolean
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(data);
    this.listName = (data.listName ?? 'General').trim() || 'General';
    this.title = data.title.trim();
    this.description = data.description;
    this.priority = data.priority;
    this.status = data.status;
    this.dueDate = data.dueDate ?? null
    this.isRecurring = data.isRecurring ?? false;
  }
}
