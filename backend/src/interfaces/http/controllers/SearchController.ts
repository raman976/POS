import { Request, Response } from 'express';
import { SearchService } from '../../../application/services/SearchService';

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

    const q = req.query.q as string | undefined
    if (!q) {
      res.status(400).json({ message: 'Query parameter "q" is required' })
      return
    }

    const results = await this.searchService.search(req.userId, q)
    res.status(200).json({ results, total: results.length })
  }
}
