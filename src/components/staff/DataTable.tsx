import type { ReactNode } from 'react'
import styles from './DataTable.module.css'

export interface DataTableColumn<T> {
  header: string
  render: (item: T) => ReactNode
}

interface DataTableProps<T> {
  items: T[]
  getKey: (item: T) => string
  columns: DataTableColumn<T>[]
  renderActions: (item: T) => ReactNode
}

export function DataTable<T>({ items, getKey, columns, renderActions }: DataTableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} scope="col">
                {column.header}
              </th>
            ))}
            <th scope="col">
              <span className="liac-visually-hidden">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getKey(item)}>
              {columns.map((column) => (
                <td key={column.header}>{column.render(item)}</td>
              ))}
              <td className={styles.actionsCell}>
                <div className={styles.actions}>{renderActions(item)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
