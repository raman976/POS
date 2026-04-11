import { Task, TaskPriority, TaskStatus } from '../entities/Task';

export interface CreateTaskInput {
  ownerId: string;
  listName?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: Date | null
  isRecurring?: boolean;
}

export interface UpdateTaskInput {
  listName?: string;
  title?: string
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date | null;
  isRecurring?: boolean
}

export interface ITaskRepository {
  create(input: CreateTaskInput): Promise<Task>;
  findById(id: string, ownerId: string): Promise<Task | null>;
  listByOwner(ownerId: string): Promise<Task[]>;
  update(id: string, ownerId: string, input: UpdateTaskInput): Promise<Task | null>;
  delete(id: string, ownerId: string): Promise<boolean>
}
