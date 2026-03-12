import { render, screen } from '@testing-library/react'
import StatCard from '@/components/StatCard'

test('renders label and formatted number', () => {
  render(<StatCard label="Total Reports" value={47382} />)
  expect(screen.getByText('Total Reports')).toBeInTheDocument()
  expect(screen.getByText('47,382')).toBeInTheDocument()
})

test('applies variant color class for serious variant', () => {
  const { container } = render(<StatCard label="Serious" value={1000} variant="danger" />)
  expect(container.firstChild).toHaveClass('bg-red-50')
})
