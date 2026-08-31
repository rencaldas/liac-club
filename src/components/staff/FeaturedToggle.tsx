import styles from './FeaturedToggle.module.css'

interface FeaturedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FeaturedToggle({ checked, onChange }: FeaturedToggleProps) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={styles.input}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      Destacar no carrossel da Home
    </label>
  )
}
