import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NewsCard } from './NewsCard'
import type { NewsItem } from '../../types/entities'

const item: NewsItem = {
  slug: 'novidade-de-teste',
  title: 'Novidade de teste',
  publishedAt: '2026-08-20',
  category: 'Divulgação Científica',
  summary: 'Um resumo curto para o card.',
  content: 'Conteúdo completo, não usado no card.',
}

function renderCard() {
  return render(
    <MemoryRouter>
      <NewsCard item={item} />
    </MemoryRouter>,
  )
}

describe('NewsCard', () => {
  it('shows the category, title, date and summary', () => {
    renderCard()

    expect(screen.getByText('Divulgação Científica')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: item.title })).toBeInTheDocument()
    expect(screen.getByText('Um resumo curto para o card.')).toBeInTheDocument()
    expect(screen.getByText(/20 de agosto de 2026/i)).toBeInTheDocument()
  })

  it('links to the news detail page', () => {
    renderCard()

    expect(screen.getByRole('link', { name: item.title })).toHaveAttribute(
      'href',
      '/novidades/novidade-de-teste',
    )
  })
})
