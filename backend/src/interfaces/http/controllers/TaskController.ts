import { Request, Response } from 'express';
import { TaskService } from '../../../application/services/TaskService';

const getParamValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }
      const task = await this.taskService.createTask(req.userId, req.body)
      res.status(201).json({ task })
    } catch (err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }
    const tasks = await this.taskService.listTasks(req.userId)
    res.status(200).json({ tasks })
  }

  getOne = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

    const taskId = getParamValue(req.params.id)
    const task = await this.taskService.getTask(req.userId, taskId)
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    res.status(200).json({ task })
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

      const taskId = getParamValue(req.params.id)
      const task = await this.taskService.updateTask(req.userId, taskId, req.body)
      if (!task) {
        res.status(404).json({ message: 'Task not found' })
        return
      }
      res.status(200).json({ task })
    } catch(err) {
      res.status(400).json({ message: (err as Error).message })
    }
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) { res.status(401).json({ message: 'Unauthorized' }); return }

    const taskId = getParamValue(req.params.id)
    const deleted = await this.taskService.deleteTask(req.userId, taskId)
    if (!deleted) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    res.status(204).send()
  }
}
