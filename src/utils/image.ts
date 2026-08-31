export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface ImageConstraints {
  minWidth: number
  minHeight: number
  minAspectRatio: number
  maxAspectRatio: number
  recommendedLabel: string
}

/** Horizontal cover images (news/events/articles) — landscape, wide aspect ratio. */
export const COVER_IMAGE_CONSTRAINTS: ImageConstraints = {
  minWidth: 800,
  minHeight: 400,
  minAspectRatio: 1.3,
  maxAspectRatio: 3,
  recommendedLabel: '1200×630px',
}

/** Profile photos — roughly square, shown in a circular crop in the UI. */
export const AVATAR_IMAGE_CONSTRAINTS: ImageConstraints = {
  minWidth: 200,
  minHeight: 200,
  minAspectRatio: 0.8,
  maxAspectRatio: 1.25,
  recommendedLabel: '400×400px',
}

/** Partner logos — shown with object-fit: contain, so both wide and squarish marks are fine. */
export const LOGO_IMAGE_CONSTRAINTS: ImageConstraints = {
  minWidth: 160,
  minHeight: 80,
  minAspectRatio: 0.5,
  maxAspectRatio: 4,
  recommendedLabel: '400×200px',
}

const OUTPUT_MAX_WIDTH = 1600
const OUTPUT_QUALITY = 0.85

export class ImageValidationError extends Error {}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function loadImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new ImageValidationError('Não foi possível ler essa imagem.'))
    img.src = objectUrl
  })
}

export interface ProcessedImage {
  dataUrl: string
  width: number
  height: number
}

/**
 * Validates format/size/resolution client-side (no upload endpoint exists on the backend yet,
 * see specs/contracts/api-contract.md), then downsizes to a compressed JPEG data URL so the
 * resulting image string stays reasonably small. `constraints` picks the shape expected —
 * landscape cover images by default, or `AVATAR_IMAGE_CONSTRAINTS` for a profile photo.
 */
export async function validateAndProcessImage(
  file: File,
  constraints: ImageConstraints = COVER_IMAGE_CONSTRAINTS,
): Promise<ProcessedImage> {
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    throw new ImageValidationError('Formato não suportado. Envie um arquivo JPG, PNG ou WEBP.')
  }

  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    throw new ImageValidationError(
      `Arquivo muito grande (${formatMb(file.size)}). O limite é ${formatMb(IMAGE_MAX_SIZE_BYTES)}.`,
    )
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const { naturalWidth: width, naturalHeight: height } = img
    const { minWidth, minHeight, minAspectRatio, maxAspectRatio, recommendedLabel } = constraints

    if (width < minWidth || height < minHeight) {
      throw new ImageValidationError(
        `Resolução muito baixa (${width}×${height}px). Use pelo menos ${minWidth}×${minHeight}px (ideal: ${recommendedLabel}).`,
      )
    }

    const aspectRatio = width / height
    if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
      throw new ImageValidationError(
        minAspectRatio >= 1
          ? `A imagem precisa estar no formato horizontal (paisagem), próximo de ${recommendedLabel}.`
          : `A imagem precisa ser aproximadamente quadrada, próximo de ${recommendedLabel}.`,
      )
    }

    const scale = Math.min(1, OUTPUT_MAX_WIDTH / width)
    const outputWidth = Math.round(width * scale)
    const outputHeight = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new ImageValidationError('Não foi possível processar essa imagem.')
    ctx.drawImage(img, 0, 0, outputWidth, outputHeight)

    return {
      dataUrl: canvas.toDataURL('image/jpeg', OUTPUT_QUALITY),
      width: outputWidth,
      height: outputHeight,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
