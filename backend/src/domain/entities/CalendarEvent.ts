import { BaseEntity } from './BaseEntity';

export class CalendarEvent extends BaseEntity {
  public readonly title: string;
  public readonly description: string;
  public readonly startTime: Date
  public readonly endTime: Date;
  public readonly allDay: boolean;
  public readonly reminder: number | null;

  constructor(data: {
    id: string;
    ownerId: string
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    reminder?: number | null
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(data)
    this.title = data.title.trim()
    this.description = data.description
    this.startTime = data.startTime
    this.endTime = data.endTime
    this.allDay = data.allDay ?? false
    this.reminder = data.reminder ?? null
  }
}
