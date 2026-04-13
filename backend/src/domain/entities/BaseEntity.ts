export abstract class BaseEntity {
  public readonly id: string;
  public readonly ownerId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  protected constructor(data: {
    id: string;
    ownerId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }
}
