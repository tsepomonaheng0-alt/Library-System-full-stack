// A book with fewer copies than this is flagged as low stock.
export const LOW_STOCK = 2;

export const stockLevel = (qty) => (qty === 0 ? 'out' : qty < LOW_STOCK ? 'low' : 'ok');
