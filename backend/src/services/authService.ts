import { AppError } from '../middleware/appError.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type { LoginResponse } from '../types/api.js'

export class AuthService {
  private readonly repository: StudentRepository

  public constructor(repository: StudentRepository = studentRepository) {
    this.repository = repository
  }

  public async login(identifier: string): Promise<LoginResponse> {
    const parentWithChildren = await this.repository.findParentWithChildren(identifier)

    if (!parentWithChildren) {
      throw new AppError('Parent or student was not found', 404)
    }

    return {
      parentId: parentWithChildren.parent.id,
      parentName: parentWithChildren.parent.fullName,
      children: parentWithChildren.children.map((student) => ({
        id: student.id,
        name: student.fullName,
        grade: student.gradeLevel,
      })),
    }
  }
}

export const authService = new AuthService()
