// Raw openFDA API response shapes

export interface FDACountResult {
  term?: string  // used for string fields (reactions, gender, etc.)
  time?: string  // used for date fields (receivedate)
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

export interface BreakdownItem {
  label: string
  count: number
  percentage: number
}

export interface SeriousnessBreakdown {
  death: number
  hospitalization: number
  lifeThreatening: number
  disabling: number
  congenitalAnomali: number
}

export interface DrugLabel {
  hasBlackBoxWarning: boolean
  blackBoxWarning: string | null
  warnings: string | null
  contraindications: string | null
  indicationsAndUsage: string | null
  pharmClass: string[]      // e.g. ["HMG-CoA Reductase Inhibitor"]
  brandNames: string[]
  genericNames: string[]
  manufacturer: string | null
}

export interface RisingDrug {
  name: string
  slug: string
  currentYearCount: number
  priorYearCount: number
  percentChange: number
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
  seriousnessBreakdown: SeriousnessBreakdown
  outcomes: BreakdownItem[]
  indications: BreakdownItem[]
  reporterTypes: BreakdownItem[]
  countries: BreakdownItem[]
  actionTaken: BreakdownItem[]
  routes: BreakdownItem[]
  lastUpdated: string
}
