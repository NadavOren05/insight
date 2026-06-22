import cors from 'cors'
import express from 'express'
import { authRoutes } from './routes/authRoutes.js'
import { examRoutes } from './routes/examRoutes.js'
import { lessonRoutes } from './routes/lessonRoutes.js'
import { studentRoutes } from './routes/studentRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { logger } from './middleware/logger.js'
import { notFoundHandler } from './middleware/notFound.js'

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    }),
  )
  app.use(express.json())
  app.use(logger)

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/students', studentRoutes)
  app.use('/api/exams', examRoutes)
  app.use('/api', lessonRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
