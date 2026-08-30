import type { ApiClient } from './ApiClient'
import { MockApiClient } from './mock/MockApiClient'

/**
 * Single instance consumed by every page/hook. Swapping the mock for a real implementation
 * later means changing only this line — no component or page is touched (Constitution
 * Princípio I).
 *
 * Named `client.ts` (not `apiClient.ts`) deliberately: this project is developed on a
 * case-insensitive filesystem (Windows), where `apiClient.ts` and `ApiClient.ts` are the same
 * file and one would silently overwrite the other.
 */
export const apiClient: ApiClient = new MockApiClient()
