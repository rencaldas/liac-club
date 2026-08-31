import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  COVER_IMAGE_CONSTRAINTS,
  IMAGE_ALLOWED_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  ImageValidationError,
  validateAndProcessImage,
  type ImageConstraints,
} from '../../utils/image'
import { deleteImage, StorageUploadError, uploadImage } from '../../services/storage'
import { ImagePlaceholderIcon, LinkIcon, TrashIcon, UploadCloudIcon } from '../ui/icons/StaffIcons'
import styles from './ImageUploadField.module.css'

interface ImageUploadFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  constraints?: ImageConstraints
  previewAlt?: string
  /** 'avatar' renders a compact circular uploader for profile photos instead of the wide landscape dropzone. */
  variant?: 'cover' | 'avatar'
}

const MAX_SIZE_LABEL = `${Math.round(IMAGE_MAX_SIZE_BYTES / (1024 * 1024))}MB`

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  hint,
  constraints = COVER_IMAGE_CONSTRAINTS,
  previewAlt = 'Pré-visualização da imagem',
  variant = 'cover',
}: ImageUploadFieldProps) {
  const { session } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(() => Boolean(value) && !value.startsWith('data:'))
  const inputRef = useRef<HTMLInputElement>(null)
  // The persisted value when this field mounted. Replacing/removing it must NOT delete it right
  // away — the surrounding form hasn't saved yet, and the entity in the database still points at
  // it until the save succeeds. Only images uploaded (and then superseded) within this same
  // editing session — never persisted anywhere — are safe to delete immediately.
  const persistedValueRef = useRef(value)
  const errorId = `${id}-error`
  const fileInputId = `${id}-file`
  const urlInputId = `${id}-url`

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!session) {
      setError('Sessão expirada. Faça login novamente.')
      return
    }
    setError(null)
    setIsProcessing(true)
    try {
      const { blob } = await validateAndProcessImage(file, constraints)
      const url = await uploadImage(blob, variant === 'avatar' ? 'avatars' : 'covers', session.token)
      const previousValue = value
      onChange(url)
      setShowUrlInput(false)
      if (previousValue && previousValue !== persistedValueRef.current) {
        void deleteImage(previousValue, session.token)
      }
    } catch (err) {
      setError(
        err instanceof ImageValidationError || err instanceof StorageUploadError
          ? err.message
          : 'Não foi possível processar essa imagem.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    void handleFile(event.dataTransfer.files?.[0])
  }

  function handleRemove() {
    const previousValue = value
    onChange('')
    setError(null)
    setShowUrlInput(false)
    if (session && previousValue && previousValue !== persistedValueRef.current) {
      void deleteImage(previousValue, session.token)
    }
  }

  const hintText = hint ?? `JPG, PNG ou WEBP · até ${MAX_SIZE_LABEL} · ideal ${constraints.recommendedLabel}`

  if (variant === 'avatar') {
    return (
      <div className={styles.field}>
        <label htmlFor={showUrlInput ? urlInputId : fileInputId}>{label}</label>
        <div className={styles.avatarRow}>
          {!showUrlInput && (
            <div className={styles.avatarMedia}>
              {value ? (
                <div className={styles.preview}>
                  <img src={value} alt={previewAlt} />
                </div>
              ) : (
                <div
                  className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
                  }}
                >
                  <ImagePlaceholderIcon width={22} height={22} />
                </div>
              )}
            </div>
          )}

          <div className={styles.avatarMeta}>
            <p className={styles.hint}>{hintText}</p>

            {value && !showUrlInput && (
              <div className={styles.avatarActions}>
                <button type="button" disabled={isProcessing} onClick={() => inputRef.current?.click()}>
                  {isProcessing ? 'Enviando…' : 'Trocar'}
                </button>
                <button
                  type="button"
                  className={styles.avatarRemove}
                  disabled={isProcessing}
                  onClick={handleRemove}
                >
                  Remover
                </button>
              </div>
            )}

            {showUrlInput ? (
              <div className={styles.urlMode}>
                {value && (
                  <div className={`${styles.urlPreview} ${styles.avatarUrlPreview}`}>
                    <img src={value} alt={previewAlt} />
                  </div>
                )}
                <input
                  id={urlInputId}
                  type="text"
                  value={value}
                  placeholder="https://..."
                  onChange={(event) => onChange(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                />
                <button type="button" className={styles.linkToggle} onClick={() => setShowUrlInput(false)}>
                  <UploadCloudIcon width={14} height={14} />
                  ou enviar um arquivo
                </button>
              </div>
            ) : (
              <button type="button" className={styles.linkToggle} onClick={() => setShowUrlInput(true)}>
                <LinkIcon width={14} height={14} />
                ou informar uma URL
              </button>
            )}

            {error && (
              <p id={errorId} className={styles.errorText} role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          id={fileInputId}
          type="file"
          accept={IMAGE_ALLOWED_TYPES.join(',')}
          className={styles.hiddenInput}
          onChange={handleInputChange}
        />
      </div>
    )
  }

  return (
    <div className={styles.field}>
      <label htmlFor={showUrlInput ? urlInputId : fileInputId}>{label}</label>
      <p className={styles.hint}>{hintText}</p>

      {value && !showUrlInput ? (
        <div className={styles.preview}>
          <img src={value} alt={previewAlt} />
          <div className={styles.previewActions}>
            <button type="button" disabled={isProcessing} onClick={() => inputRef.current?.click()}>
              {isProcessing ? 'Enviando imagem…' : 'Trocar imagem'}
            </button>
            <button
              type="button"
              className={styles.removeButton}
              disabled={isProcessing}
              onClick={handleRemove}
            >
              <TrashIcon width={16} height={16} />
              Remover
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        <div className={styles.urlMode}>
          <input
            id={urlInputId}
            type="text"
            value={value}
            placeholder="https://..."
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
          {value && (
            <div className={styles.urlPreview}>
              <img src={value} alt={previewAlt} />
            </div>
          )}
          <button type="button" className={styles.linkToggle} onClick={() => setShowUrlInput(false)}>
            <UploadCloudIcon width={14} height={14} />
            ou enviar um arquivo
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
          }}
        >
          {isProcessing ? (
            <span className={styles.dropzoneLabel}>Enviando imagem…</span>
          ) : (
            <>
              <ImagePlaceholderIcon width={28} height={28} />
              <span className={styles.dropzoneLabel}>
                Arraste uma imagem aqui ou <strong>clique para selecionar</strong>
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={fileInputId}
        type="file"
        accept={IMAGE_ALLOWED_TYPES.join(',')}
        className={styles.hiddenInput}
        onChange={handleInputChange}
      />

      {!showUrlInput && (
        <button type="button" className={styles.linkToggle} onClick={() => setShowUrlInput(true)}>
          <LinkIcon width={14} height={14} />
          ou informar uma URL
        </button>
      )}

      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
