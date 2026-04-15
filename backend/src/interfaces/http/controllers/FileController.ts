import { Request, Response } from 'express';
import { FileService } from '../../../application/services/FileService';

const getParamValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export class FileController {
  constructor(private readonly fileService: FileService) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

      const file = (req as Request & { file?: Express.Multer.File }).file
      if (!file) {
        res.status(400).json({ message: 'No file provided' })
        return
      }

      const folder = (req.body.folder as string | undefined) ?? '/'
      const entry = await this.fileService.saveFile(
        req.userId,
        file.originalname,
        file.mimetype,
        file.buffer,
        folder
      )

      res.status(201).json({
        file: {
          id: entry.id,
          filename: entry.filename,
          mimeType: entry.mimeType,
          sizeBytes: entry.sizeBytes,
          folder: entry.folder,
          isFolder: entry.isFolder,
          createdAt: entry.createdAt
        }
      })
    } catch(err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const folder = (req.query.folder as string | undefined) ?? '/'
    const files = await this.fileService.listFiles(req.userId, folder)
    res.status(200).json({ files })
  }

  createFolder = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
      const folderPath = (req.body.folderPath as string | undefined) ?? ''
      if (!folderPath.trim()) {
        res.status(400).json({ message: 'folderPath is required' })
        return
      }

      const folder = await this.fileService.createFolder(req.userId, folderPath)
      res.status(201).json({
        folder: {
          id: folder.id,
          filename: folder.filename,
          folder: folder.folder,
          isFolder: folder.isFolder,
          createdAt: folder.createdAt,
        }
      })
    } catch (err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  download = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

    const fileId = getParamValue(req.params.id)
    const result = await this.fileService.getFile(req.userId, fileId)
    if (!result) { res.status(404).json({ message: 'File not found' }); return }

    res.setHeader('Content-Type', result.entry.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${result.entry.filename}"`)
    res.send(result.buffer)
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const fileId = getParamValue(req.params.id)
    const ok = await this.fileService.deleteFile(req.userId, fileId)
    if (!ok) { res.status(404).json({ message: 'File not found' }); return }
    res.status(204).send()
  }
}
