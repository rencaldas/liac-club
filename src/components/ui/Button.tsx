import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary'

interface CommonProps {
  variant?: Variant
  children: ReactNode
}

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type AsInternalLink = CommonProps & Omit<LinkProps, 'className'> & { href?: undefined }
type AsExternalLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { to?: undefined; href: string }

export type ButtonProps = AsButton | AsInternalLink | AsExternalLink

/** Renders a <button>, an internal <Link>, or an external <a>, styled identically. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', children, ...rest } = props
  const className = `${styles.button} ${styles[variant]}`

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as Omit<AsInternalLink, keyof CommonProps>
    return (
      <Link to={to} className={className} {...linkRest}>
        {children}
      </Link>
    )
  }

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as Omit<AsExternalLink, keyof CommonProps>
    return (
      <a
        href={href}
        className={className}
        rel="noopener noreferrer"
        target="_blank"
        {...anchorRest}
      >
        {children}
      </a>
    )
  }

  return (
    <button className={className} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
