import { Request, Response } from 'express';
import { NoteService } from '../../../application/services/NoteService';

export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const note = await this.noteService.createNote(req.userId, req.body);

      res.status(201).json({
        note: {
          id: note.id,
          title: note.title,
          body: note.body,
          createdAt: note.createdAt,
        },
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  public list = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notes = await this.noteService.listNotes(req.userId);
    res.status(200).json({ notes });
  };
}
