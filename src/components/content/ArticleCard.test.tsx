import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ArticleCard } from './ArticleCard'
import type { ScientificArticle } from '../../types/entities'

function renderArticle(article: ScientificArticle) {
  return render(
    <MemoryRouter>
      <ArticleCard article={article} />
    </MemoryRouter>,
  )
}

describe('ArticleCard', () => {
  it('lists a single author without a conjunction', () => {
    renderArticle({
      slug: 'artigo-um-autor',
      title: 'Artigo com um autor',
      authors: ['Ana Beatriz Ramos'],
      abstract: 'Resumo.',
      tags: ['tag-a'],
      externalUrl: 'https://example.com/artigo',
    })

    expect(screen.getByText('Ana Beatriz Ramos')).toBeInTheDocument()
  })

  it('joins multiple authors with "e" before the last one', () => {
    renderArticle({
      slug: 'artigo-multiplos-autores',
      title: 'Artigo com múltiplos autores',
      authors: ['Ana Beatriz Ramos', 'Carla Menezes', 'Mariana Costa'],
      abstract: 'Resumo.',
      tags: ['tag-a', 'tag-b'],
      externalUrl: 'https://example.com/artigo',
    })

    expect(
      screen.getByText('Ana Beatriz Ramos, Carla Menezes e Mariana Costa'),
    ).toBeInTheDocument()
    expect(screen.getByText('tag-a')).toBeInTheDocument()
    expect(screen.getByText('tag-b')).toBeInTheDocument()
  })

  it('links to the article detail page', () => {
    renderArticle({
      slug: 'artigo-x',
      title: 'Artigo X',
      authors: ['Autora Y'],
      abstract: 'Resumo.',
      tags: [],
      externalUrl: 'https://example.com/artigo',
    })

    expect(screen.getByRole('link', { name: 'Artigo X' })).toHaveAttribute(
      'href',
      '/artigos/artigo-x',
    )
  })
})
