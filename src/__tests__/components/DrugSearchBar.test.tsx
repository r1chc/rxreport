import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DrugSearchBar from '@/components/DrugSearchBar'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

beforeEach(() => mockPush.mockReset())

test('renders search input and button', () => {
  render(<DrugSearchBar />)
  expect(screen.getByPlaceholderText(/search any drug/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
})

test('navigates to slugified drug page on submit', async () => {
  render(<DrugSearchBar />)
  await userEvent.type(screen.getByPlaceholderText(/search any drug/i), 'Ozempic')
  await userEvent.click(screen.getByRole('button', { name: /search/i }))
  expect(mockPush).toHaveBeenCalledWith('/drug/ozempic')
})
