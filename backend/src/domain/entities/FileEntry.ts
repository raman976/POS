import { BaseEntity } from './BaseEntity';

export class FileEntry extends BaseEntity {
  public readonly filename: string;
  public readonly mimeType: string
  public readonly sizeBytes: number;
  public readonly storagePath: string;
  public readonly folder: string;
  public readonly isFolder: boolean;

  constructor(data: {
    id: string;
    ownerId: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string
    folder?: string;
    isFolder?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(data)
    this.filename = data.filename
    this.mimeType = data.mimeType
    this.sizeBytes = data.sizeBytes
    this.storagePath = data.storagePath
    this.folder = data.folder ?? '/'
    this.isFolder = data.isFolder ?? false
  }
}
