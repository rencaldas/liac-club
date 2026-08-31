import type { SelectHTMLAttributes } from 'react'
import { ALL_ROLES, ROLE_LABELS } from '../../auth/roles'
import type { StaffRole } from '../../types/entities'
import { ChevronRightIcon } from '../ui/icons/ChevronIcon'
import styles from './RoleSelect.module.css'

interface RoleSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: StaffRole
  onChange: (role: StaffRole) => void
}

export function RoleSelect({ value, onChange, className, ...selectProps }: RoleSelectProps) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <select
        {...selectProps}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as StaffRole)}
      >
        {ALL_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <ChevronRightIcon className={styles.chevron} />
    </div>
  )
}
