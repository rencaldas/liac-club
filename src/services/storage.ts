const FUNCTIONS_SUFFIX = '/functions/v1'

/** `VITE_API_BASE_URL` is `<project>.supabase.co/functions/v1` — Storage lives one level up. */
function supabaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  return base.endsWith(FUNCTIONS_SUFFIX) ? base.slice(0, -FUNCTIONS_SUFFIX.length) : base
}

const BUCKET = 'post-images'

function publicPrefix(): string {
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/`
}

/** True for URLs this app uploaded itself — as opposed to an external URL pasted via "informar uma URL". */
export function isManagedImageUrl(url: string): boolean {
  return url.startsWith(publicPrefix())
}

export class StorageUploadError extends Error {}

/**
 * Uploads an already-processed image blob (see `validateAndProcessImage`) straight to the
 * `post-images` Supabase Storage bucket via its REST API, and returns the public URL to persist
 * on the entity (`coverImageUrl`, `photoUrl`, …) instead of embedding the image itself. Storage
 * RLS requires an authenticated session for writes — same token used for the REST API calls.
 */
export async function uploadImage(blob: Blob, folder: string, token: string): Promise<string> {
  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${folder}/${crypto.randomUUID()}.${extension}`

  const response = await fetch(`${supabaseUrl()}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': blob.type,
    },
    body: blob,
  })

  if (!response.ok) {
    throw new StorageUploadError('Não foi possível enviar a imagem. Tente novamente.')
  }

  return `${publicPrefix()}${path}`
}

/**
 * Deletes a previously uploaded image so replacing/removing a cover or avatar doesn't leave the
 * old file behind — without this, Storage usage grows on every edit even though the database
 * stays small. Silently ignores URLs this app didn't upload (external links) and best-effort
 * swallows failures, since a stale orphaned file is a much smaller problem than blocking the
 * user's save/remove action on a cleanup call.
 */
export async function deleteImage(url: string, token: string): Promise<void> {
  if (!isManagedImageUrl(url)) return
  const path = url.slice(publicPrefix().length)
  try {
    await fetch(`${supabaseUrl()}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    })
  } catch {
    // Best-effort cleanup — an orphaned file is fine to leave for a manual sweep later.
  }
}
