import type { SVGProps } from 'react'

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3a9 9 0 0 0-7.6 13.8L3 21l4.3-1.4A9 9 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 8.3c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .5.4.2.5.6 1.6.7 1.7.1.1.1.3 0 .4-.4.6-.8.8-.5 1.3.6 1 1.3 1.7 2.3 2.2.4.2.6.2.8-.1.2-.2.7-.8.9-1.1.2-.2.4-.2.6-.1.6.3 1.6.7 1.8.9.2.1.4.2.4.4 0 .5-.5 1.4-1 1.7-.6.4-1.2.5-2 .3-1.4-.4-2.9-1.3-4.1-2.5-1-1-1.8-2.2-2.2-3.4-.3-.8-.2-1.6.2-2.1Z"
        fill="currentColor"
      />
    </svg>
  )
}
