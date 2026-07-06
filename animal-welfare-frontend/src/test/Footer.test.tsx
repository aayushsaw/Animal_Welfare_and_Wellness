import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'

describe('Footer Component', () => {
  it('renders brand name and description', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByText('Animal Welfare')).toBeInTheDocument()
    expect(screen.getByText(/Connecting stray animals with loving families/i)).toBeInTheDocument()
  })

  it('renders quick links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByText('Find a Pet')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
  })

  it('renders contact details', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByText('Pune, Maharashtra, India')).toBeInTheDocument()
    expect(screen.getByText('help@animalwelfare.in')).toBeInTheDocument()
  })
})
