import { Button } from './Button'
import styles from './NotFound.module.css'

interface NotFoundProps {
  message?: string
}

export function NotFound({ message = 'A página que você procura não existe.' }: NotFoundProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.eyebrow}>404</p>
      <h1>Não encontramos essa página</h1>
      <p>{message}</p>
      <Button to="/">Voltar para a Home</Button>
    </div>
  )
}
