import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AboutPage } from '@/pages/AboutPage'

describe('Client-side Routing', () => {
  it('renders AboutPage at /about path', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('About Our Initiative')).toBeInTheDocument()
  })
})
