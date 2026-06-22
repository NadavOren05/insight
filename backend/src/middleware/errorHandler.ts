import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from './appError.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request payload',
      issues: error.issues,
    })
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.name,
      message: error.message,
      details: error.details,
    })
    return
  }

  console.error(error)

  response.status(500).json({
    error: 'InternalServerError',
    message: 'Unexpected server error',
  })
}
