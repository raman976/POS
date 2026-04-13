import { INoteRepository } from '../../domain/repositories/INoteRepository';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';
import { ICalendarEventRepository } from '../../domain/repositories/ICalendarEventRepository';

export interface SearchResult {
  type: 'note' | 'task' | 'event';
  id: string;
  title: string;
  snippet: string;
  createdAt: Date;
}

export class SearchService {
  constructor(
    private readonly notes: INoteRepository,
    private readonly tasks: ITaskRepository,
    private readonly events: ICalendarEventRepository
  ) {}

  async search(ownerId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) return []

    const q = query.toLowerCase()
    const results: SearchResult[] = []

    const [userNotes, userTasks, userEvents] = await Promise.all([
      this.notes.listByOwner(ownerId),
      this.tasks.listByOwner(ownerId),
      this.events.listByOwner(ownerId)
    ])

    for (const note of userNotes) {
      if (note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q)) {
        results.push({
          type: 'note',
          id: note.id,
          title: note.title,
          snippet: note.body.slice(0, 120),
          createdAt: note.createdAt
        })
      }
    }

    for (const task of userTasks) {
      if (task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          snippet: task.description.slice(0, 120),
          createdAt: task.createdAt
        })
      }
    }

    for (const event of userEvents) {
      if (event.title.toLowerCase().includes(q) || event.description.toLowerCase().includes(q)) {
        results.push({
          type: 'event',
          id: event.id,
          title: event.title,
          snippet: event.description.slice(0, 120),
          createdAt: event.createdAt
        })
      }
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}
