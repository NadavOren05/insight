import type { RequestHandler } from 'express'

export const logger: RequestHandler = (request, _response, next) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} ${request.method} ${request.originalUrl}`)
  next()
}
