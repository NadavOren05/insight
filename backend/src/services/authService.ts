import { AppError } from '../middleware/appError.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type { LoginResponse } from '../types/api.js'

export class AuthService {
  private readonly repository: StudentRepository

  public constructor(repository: StudentRepository = studentRepository) {
    this.repository = repository
  }

  public async login(fullName: string, phone: string): Promise<LoginResponse> {
    const parentWithChildren = await this.repository.findParentWithChildren(fullName, phone)

    if (!parentWithChildren) {
      throw new AppError('Parent or student was not found', 404)
    }

    return {
      _source: parentWithChildren.parent._source ?? 'mock',
      parentId: parentWithChildren.parent.id,
      parentName: parentWithChildren.parent.fullName,
      children: await Promise.all(
        parentWithChildren.children.map(async (student) => {
          const classRow = await this.repository.findClassById(student.classId)

          return {
            _source: student._source ?? 'mock',
            id: student.id,
            name: student.fullName,
            grade: classRow ? `כיתה ${classRow.grade}` : '',
          }
        }),
      ),
    }
  }
}

export const authService = new AuthService()
