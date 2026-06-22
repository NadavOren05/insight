import type { RequestHandler } from 'express'
import { z } from 'zod'
import { authService } from '../services/authService.js'

const loginSchema = z.object({
  identifier: z.string().min(1),
})

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const { identifier } = loginSchema.parse(request.body)
    const loginResponse = await authService.login(identifier)

    response.json(loginResponse)
  } catch (error) {
    next(error)
  }
}
