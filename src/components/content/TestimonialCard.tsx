import type { Testimonial } from '../../types/entities'
import { Card } from '../ui/Card'
import styles from './TestimonialCard.module.css'

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card>
      <p className={styles.text}>&ldquo;{testimonial.text}&rdquo;</p>
      <p className={styles.name}>{testimonial.name}</p>
    </Card>
  )
}
