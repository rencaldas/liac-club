import styles from './FeaturedToggle.module.css'

interface FeaturedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FeaturedToggle({ checked, onChange }: FeaturedToggleProps) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      Destacar no carrossel da Home
    </label>
  )
}
