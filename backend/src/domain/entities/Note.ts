import { BaseEntity } from './BaseEntity';

export class Note extends BaseEntity {
  public readonly title: string;
  public readonly body: string;

  constructor(data: {
    id: string;
    ownerId: string;
    title: string;
    body: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(data);
    this.title = data.title.trim();
    this.body = data.body;
  }
}
