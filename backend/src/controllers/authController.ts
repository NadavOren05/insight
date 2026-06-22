import type { RequestHandler } from 'express'
import { z } from 'zod'
import { authService } from '../services/authService.js'

const loginSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
})

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const { fullName, phone } = loginSchema.parse(request.body)
    const loginResponse = await authService.login(fullName, phone)

    response.json(loginResponse)
  } catch (error) {
    next(error)
  }
}
