import { Request, Response } from 'express';
import { PasswordVaultService } from '../../../application/services/PasswordVaultService';

const getParamValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export class PasswordVaultController {
  constructor(private readonly vaultService: PasswordVaultService) {}

  add = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
      const entry = await this.vaultService.addEntry(req.userId, req.body)

      res.status(201).json({
        entry: {
          id: entry.id,
          siteName: entry.siteName,
          siteUrl: entry.siteUrl,
          username: entry.username,
          notes: entry.notes,
          expiresAt: entry.expiresAt,
          createdAt: entry.createdAt
        }
      })
    } catch(err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const entries = await this.vaultService.listEntries(req.userId)
    res.status(200).json({
      entries: entries.map(e => ({
        id: e.id,
        siteName: e.siteName,
        siteUrl: e.siteUrl,
        username: e.username,
        notes: e.notes,
        expiresAt: e.expiresAt,
        createdAt: e.createdAt
      }))
    })
  }

  reveal = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

    const entryId = getParamValue(req.params.id)
    const entry = await this.vaultService.getEntryWithPassword(req.userId, entryId)
    if (!entry) { res.status(404).json({ message: 'Entry not found' }); return }

    res.status(200).json({
      id: entry.id,
      siteName: entry.siteName,
      username: entry.username,
      password: entry.password
    })
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
      const entryId = getParamValue(req.params.id)
      const entry = await this.vaultService.updateEntry(req.userId, entryId, req.body)
      if (!entry) { res.status(404).json({ message: 'Entry not found' }); return }
      res.status(200).json({ entry })
    } catch(err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const entryId = getParamValue(req.params.id)
    const ok = await this.vaultService.deleteEntry(req.userId, entryId)
    if (!ok) { res.status(404).json({ message: 'Entry not found' }); return }
    res.status(204).send()
  }
}
