import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RestApiClient } from './RestApiClient'
import { ApiError } from './ApiError'

const BASE_URL = 'https://example.supabase.co/functions/v1'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('RestApiClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let client: RestApiClient

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    client = new RestApiClient(BASE_URL)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests GET /news with page/pageSize query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], page: 1, pageSize: 8, total: 0 }))

    await client.getNews({ page: 1, pageSize: 8 })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/news?page=1&pageSize=8`)
  })

  it('sends the bearer token when creating a news item', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { slug: 'x', title: 'X', publishedAt: '2026-01-01', category: 'c', summary: 's', content: 'c', featured: false },
        201,
      ),
    )

    await client.createNews(
      { title: 'X', publishedAt: '2026-01-01', category: 'c', summary: 's', content: 'c' },
      'token-123',
    )

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/news`)
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer token-123')
  })

  it('maps a 401 response to an ApiError carrying the contract code/message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 'UNAUTHORIZED', message: 'Autenticação necessária' } }, 401),
    )

    await expect(client.deleteNews('slug', 'bad-token')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Autenticação necessária',
      status: 401,
    })
    await expect(client.deleteNews('slug', 'bad-token')).rejects.toBeInstanceOf(ApiError)
  })

  it('resolves getNewsBySlug to null on a 404 instead of throwing', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: 'NOT_FOUND', message: 'not found' } }, 404))

    await expect(client.getNewsBySlug('missing')).resolves.toBeNull()
  })

  it('treats a 204 delete response as void', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(client.deleteEvent('slug', 'token')).resolves.toBeUndefined()
  })

  it('posts login credentials without an Authorization header and returns the session', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ token: 't', role: 'member', displayName: 'Fulana' }))

    const session = await client.login({ email: 'a@b.com', password: 'secret' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/auth-login`)
    expect(init.headers.Authorization).toBeUndefined()
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.com', password: 'secret' })
    expect(session).toEqual({ token: 't', role: 'member', displayName: 'Fulana' })
  })

  it('filters out undefined query params instead of sending them as literal "undefined"', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], page: 1, pageSize: 12, total: 0 }))

    await client.getArticles({ tag: 'formulação' })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/articles?tag=${encodeURIComponent('formulação')}`)
  })

  it('posts the invite-token password to /set-password, no Authorization header', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ token: 'tok-invite', role: 'coordenador', displayName: 'Nova' }))

    const session = await client.setPassword('tok-invite', 'password123')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/set-password`)
    expect(init.headers.Authorization).toBeUndefined()
    expect(JSON.parse(init.body)).toEqual({ token: 'tok-invite', password: 'password123' })
    expect(session).toEqual({ token: 'tok-invite', role: 'coordenador', displayName: 'Nova' })
  })

  it('unwraps the items array from GET /staff', async () => {
    const member = { id: 'm1', displayName: 'Fulana', role: 'coordenador', email: 'f@liac.club' }
    fetchMock.mockResolvedValue(jsonResponse({ items: [member] }))

    const members = await client.getStaffMembers('tok-1')

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/staff`)
    expect(members).toEqual([member])
  })

  it('sends the invite payload with the bearer token to POST /invite-collaborator', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'invited' }, 201))

    await client.inviteCollaborator(
      { email: 'nova@liac.club', displayName: 'Nova', role: 'presidente', redirectTo: 'https://x/definir-senha' },
      'tok-1',
    )

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/invite-collaborator`)
    expect(init.headers.Authorization).toBe('Bearer tok-1')
    expect(JSON.parse(init.body)).toEqual({
      email: 'nova@liac.club',
      displayName: 'Nova',
      role: 'presidente',
      redirectTo: 'https://x/definir-senha',
    })
  })

  it('PUTs the new role to /staff/:id', async () => {
    const updated = { id: 'm1', displayName: 'Fulana', role: 'diretor_eventos', email: 'f@liac.club' }
    fetchMock.mockResolvedValue(jsonResponse(updated))

    const result = await client.updateStaffRole('m1', 'diretor_eventos', 'tok-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/staff/m1`)
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ role: 'diretor_eventos' })
    expect(result).toEqual(updated)
  })

  it('DELETEs /staff/:id to revoke access', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await client.revokeStaffAccess('m1', 'tok-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/staff/m1`)
    expect(init.method).toBe('DELETE')
  })

  it('requests GET /audit-log with the author filter and bearer token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], page: 1, pageSize: 20, total: 0 }))

    await client.getAuditLog({ author: 'Fulana', pageSize: 20 }, 'tok-1')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/audit-log?pageSize=20&author=Fulana`)
    expect(init.headers.Authorization).toBe('Bearer tok-1')
  })
})
