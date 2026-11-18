import { stockLevel } from '../constants.js';

const TEXT = { ok: 'In stock', low: 'Low stock', out: 'Out of stock' };

export default function StockBadge({ quantity }) {
  const level = stockLevel(quantity);
  return <span className={`badge badge-${level}`}>{TEXT[level]}</span>;
}
