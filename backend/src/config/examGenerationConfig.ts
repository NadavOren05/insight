import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface ExamGenerationConfig {
  questionTypes: string[]
  numberOfQuestions: number
  allowFewerQuestions: boolean
  shuffleQuestions: boolean
  preferRecommendations: boolean
  fallbackToLowestGrade: boolean
}

const DEFAULT_CONFIG: ExamGenerationConfig = {
  questionTypes: ['mcq'],
  numberOfQuestions: 3,
  allowFewerQuestions: true,
  shuffleQuestions: true,
  preferRecommendations: true,
  fallbackToLowestGrade: true,
}

const CONFIG_PATH = resolve(process.cwd(), 'config', 'exam-generation.yaml')

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

const normalizeQuestionTypes = (questionTypes: string[]): string[] => {
  const normalizedTypes = questionTypes
    .map((questionType) => questionType.trim())
    .filter((questionType) => questionType.length > 0)

  return normalizedTypes.length > 0 ? Array.from(new Set(normalizedTypes)) : DEFAULT_CONFIG.questionTypes
}

const parseExamGenerationYaml = (content: string): Partial<ExamGenerationConfig> => {
  const partialConfig: Partial<ExamGenerationConfig> = {}
  const questionTypes: string[] = []
  let activeListKey: 'question_types' | null = null

  for (const rawLine of content.split(/\r?\n/)) {
    const lineWithoutComment = rawLine.split('#')[0]?.trimEnd() ?? ''
    const line = lineWithoutComment.trim()

    if (line.length === 0) {
      continue
    }

    if (activeListKey && line.startsWith('- ')) {
      questionTypes.push(line.slice(2).trim().replace(/^["']|["']$/g, ''))
      continue
    }

    activeListKey = null
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()

    if (key === 'question_types') {
      activeListKey = 'question_types'

      if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
        questionTypes.push(
          ...rawValue
            .slice(1, -1)
            .split(',')
            .map((value) => value.trim().replace(/^["']|["']$/g, ''))
            .filter((value) => value.length > 0),
        )
      }

      continue
    }

    if (key === 'number_of_questions') {
      const parsedNumber = Number(rawValue)

      if (Number.isInteger(parsedNumber) && parsedNumber > 0) {
        partialConfig.numberOfQuestions = parsedNumber
      }

      continue
    }

    if (key === 'allow_fewer_questions') {
      partialConfig.allowFewerQuestions = parseBoolean(rawValue, DEFAULT_CONFIG.allowFewerQuestions)
      continue
    }

    if (key === 'shuffle_questions') {
      partialConfig.shuffleQuestions = parseBoolean(rawValue, DEFAULT_CONFIG.shuffleQuestions)
      continue
    }

    if (key === 'prefer_recommendations') {
      partialConfig.preferRecommendations = parseBoolean(rawValue, DEFAULT_CONFIG.preferRecommendations)
      continue
    }

    if (key === 'fallback_to_lowest_grade') {
      partialConfig.fallbackToLowestGrade = parseBoolean(rawValue, DEFAULT_CONFIG.fallbackToLowestGrade)
    }
  }

  if (questionTypes.length > 0) {
    partialConfig.questionTypes = normalizeQuestionTypes(questionTypes)
  }

  return partialConfig
}

export const loadExamGenerationConfig = (): ExamGenerationConfig => {
  try {
    const fileContent = readFileSync(CONFIG_PATH, 'utf8')
    const parsedConfig = parseExamGenerationYaml(fileContent)

    return {
      ...DEFAULT_CONFIG,
      ...parsedConfig,
      questionTypes: normalizeQuestionTypes(parsedConfig.questionTypes ?? DEFAULT_CONFIG.questionTypes),
    }
  } catch (error) {
    console.warn(
      '[exam-generation-config] using-default-config',
      JSON.stringify({
        configPath: CONFIG_PATH,
        reason: error instanceof Error ? error.message : 'Unknown config load error',
      }),
    )

    return DEFAULT_CONFIG
  }
}
