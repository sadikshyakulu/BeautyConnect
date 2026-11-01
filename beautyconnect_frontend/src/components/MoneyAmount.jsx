import { formatNpr } from '../utils/currency'

export default function MoneyAmount({ value }) {
  return <span className="money-amount">{formatNpr(value)}</span>
}
