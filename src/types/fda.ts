// Raw openFDA API response shapes

export interface FDACountResult {
  term: string
  count: number
}

export interface FDAQueryResponse {
  meta: {
    disclaimer: string
    terms: string
    license: string
    last_updated: string
    results: {
      skip: number
      limit: number
      total: number
    }
  }
  results: FDACountResult[]
}

// Processed data shapes used by components

export interface SideEffect {
  name: string
  count: number
  percentage: number
}

export interface TrendPoint {
  quarter: string  // e.g. "2023 Q1"
  count: number
}

export interface AgeGroup {
  label: string   // e.g. "18-44"
  count: number
  percentage: number
}

export interface GenderBreakdown {
  male: number
  female: number
  unknown: number
}

export interface DrugReport {
  name: string
  totalReports: number
  seriousReports: number
  nonSeriousReports: number
  topSideEffects: SideEffect[]
  trend: TrendPoint[]
  ageGroups: AgeGroup[]
  gender: GenderBreakdown
  lastUpdated: string
}
