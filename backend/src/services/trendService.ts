export type Trend = 'Up' | 'Down' | 'Neutral'

export interface TrendClassification {
  trend: Trend
  latestShortTermEma: number
  latestLongTermEma: number
  shortTermEma: number[]
  longTermEma: number[]
}

const assertValidSpan = (span: number): void => {
  if (!Number.isInteger(span) || span <= 0) {
    throw new Error('EMA span must be a positive integer')
  }
}

const assertFiniteData = (data: number[]): void => {
  if (data.some((value) => !Number.isFinite(value))) {
    throw new Error('EMA data must contain only finite numbers')
  }
}

export const calculateEMA = (data: number[], span: number): number[] => {
  assertValidSpan(span)
  assertFiniteData(data)

  if (data.length === 0) {
    return []
  }

  const multiplier = 2 / (span + 1)
  const [firstValue, ...remainingValues] = data
  const emaValues = [firstValue]

  for (const value of remainingValues) {
    const previousEma = emaValues[emaValues.length - 1]
    emaValues.push((value * multiplier) + (previousEma * (1 - multiplier)))
  }

  return emaValues
}

export const classifyTrend = (
  data: number[],
  shortTermSpan: number,
  longTermSpan: number,
  trendThreshold: number,
): TrendClassification => {
  if (data.length === 0) {
    throw new Error('Trend classification requires at least one data point')
  }

  if (!Number.isFinite(trendThreshold) || trendThreshold < 0) {
    throw new Error('Trend threshold must be a non-negative finite number')
  }

  const shortTermEma = calculateEMA(data, shortTermSpan)
  const longTermEma = calculateEMA(data, longTermSpan)
  const latestShortTermEma = shortTermEma[shortTermEma.length - 1]
  const latestLongTermEma = longTermEma[longTermEma.length - 1]

  if (latestShortTermEma > latestLongTermEma + trendThreshold) {
    return { trend: 'Up', latestShortTermEma, latestLongTermEma, shortTermEma, longTermEma }
  }

  if (latestShortTermEma < latestLongTermEma - trendThreshold) {
    return { trend: 'Down', latestShortTermEma, latestLongTermEma, shortTermEma, longTermEma }
  }

  return { trend: 'Neutral', latestShortTermEma, latestLongTermEma, shortTermEma, longTermEma }
}
