import type { ApiClient } from './ApiClient'
import { RestApiClient } from './rest/RestApiClient'

/**
 * Single instance consumed by every page/hook. Talks to the `liac-backend` repo (Supabase Edge
 * Functions) at `VITE_API_BASE_URL` — no local fixtures left, see `RestApiClient`.
 *
 * Named `client.ts` (not `apiClient.ts`) deliberately: this project is developed on a
 * case-insensitive filesystem (Windows), where `apiClient.ts` and `ApiClient.ts` are the same
 * file and one would silently overwrite the other.
 */
export const apiClient: ApiClient = new RestApiClient(import.meta.env.VITE_API_BASE_URL, {
  // Reuse listing payloads across page mounts / SPA navigation / reloads instead of refetching
  // them from the Edge Functions every time — the main driver of Supabase egress on this app.
  persistCache: true,
})
