import type { ApiClient } from './ApiClient'
import { HybridApiClient } from './HybridApiClient'

/**
 * Single instance consumed by every page/hook. News/Events/Articles/auth/Team are real, served by
 * the `liac-backend` repo (Supabase Edge Functions) at `VITE_API_BASE_URL`; Projects/Partners/
 * contact form stay on local fixtures for now — see `HybridApiClient`.
 *
 * Named `client.ts` (not `apiClient.ts`) deliberately: this project is developed on a
 * case-insensitive filesystem (Windows), where `apiClient.ts` and `ApiClient.ts` are the same
 * file and one would silently overwrite the other.
 */
export const apiClient: ApiClient = new HybridApiClient(import.meta.env.VITE_API_BASE_URL)
