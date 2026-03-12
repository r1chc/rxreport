import { fetchDrugReport, fetchTopDrugs } from '@/lib/fda'
import { DrugReport } from '@/types/fda'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

function makeFDAResponse(results: { term: string; count: number }[], total = 1000) {
  return {
    ok: true,
    json: async () => ({
      meta: { results: { total } },
      results,
    }),
  }
}

beforeEach(() => mockFetch.mockReset())

describe('fetchDrugReport', () => {
  it('returns a DrugReport with correct totals', async () => {
    mockFetch
      .mockResolvedValueOnce(makeFDAResponse([{ term: 'nausea', count: 500 }], 1000))
      .mockResolvedValueOnce(makeFDAResponse([{ term: '20231231', count: 100 }]))
      .mockResolvedValueOnce(makeFDAResponse([{ term: '45', count: 300 }]))
      .mockResolvedValueOnce(makeFDAResponse([{ term: '1', count: 400 }, { term: '2', count: 500 }]))
      .mockResolvedValueOnce(makeFDAResponse([], 200))

    const report = await fetchDrugReport('ozempic')

    expect(report.name).toBe('ozempic')
    expect(report.totalReports).toBe(1000)
    expect(report.seriousReports).toBe(200)
    expect(report.nonSeriousReports).toBe(800)
    expect(report.topSideEffects[0].name).toBe('nausea')
    expect(report.topSideEffects[0].percentage).toBeCloseTo(50)
  })

  it('throws when FDA API returns non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 })
    await expect(fetchDrugReport('notadrug')).rejects.toThrow('FDA API error')
  })
})

describe('fetchTopDrugs', () => {
  it('returns a list of drug names', async () => {
    mockFetch.mockResolvedValue(
      makeFDAResponse([
        { term: 'OZEMPIC', count: 50000 },
        { term: 'ASPIRIN', count: 40000 },
      ])
    )
    const drugs = await fetchTopDrugs(2)
    expect(drugs).toEqual(['OZEMPIC', 'ASPIRIN'])
  })
})
