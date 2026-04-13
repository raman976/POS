import { Request, Response } from 'express';
import { CalendarEventService } from '../../../application/services/CalendarEventService';

const getParamValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export class CalendarEventController {
  constructor(private readonly calService: CalendarEventService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
      const event = await this.calService.createEvent(req.userId, req.body)
      res.status(201).json({ event })
    } catch(err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const { from, to } = req.query as { from?: string; to?: string }
    const events = await this.calService.listEvents(req.userId, from, to)
    res.status(200).json({ events })
  }

  getOne = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const eventId = getParamValue(req.params.id)
    const event = await this.calService.getEvent(req.userId, eventId)
    if (!event) { res.status(404).json({ message: 'Event not found' }); return }
    res.status(200).json({ event })
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
      const eventId = getParamValue(req.params.id)
      const event = await this.calService.updateEvent(req.userId, eventId, req.body)
      if (!event) { res.status(404).json({ message: 'Event not found' }); return }
      res.status(200).json({ event })
    } catch(err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const eventId = getParamValue(req.params.id)
    const ok = await this.calService.deleteEvent(req.userId, eventId)
    if (!ok) { res.status(404).json({ message: 'Event not found' }); return }
    res.status(204).send()
  }
}
