import { Router } from 'express'
import { generateLessonController } from '../controllers/lessonController.js'

export const lessonRoutes = Router()

lessonRoutes.post('/generate-lesson', generateLessonController)
