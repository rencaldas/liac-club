import { useEffect, useRef } from 'react'
import { CloseIcon } from '../ui/icons/StaffIcons'
import styles from './ImagePreviewDialog.module.css'

interface ImagePreviewDialogProps {
  src: string
  title: string
  onClose: () => void
}

export function ImagePreviewDialog({ src, title, onClose }: ImagePreviewDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`Foto de ${title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" ref={closeRef} className={styles.close} onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </button>
        <img src={src} alt="" className={styles.image} />
        <p className={styles.caption}>{title}</p>
      </div>
    </div>
  )
}
