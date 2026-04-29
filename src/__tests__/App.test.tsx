import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText(/Welcome to PubMetric/i)).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<App />)
    expect(screen.getByText(/Your cozy, local CRM for managing leads/i)).toBeInTheDocument()
  })
})
