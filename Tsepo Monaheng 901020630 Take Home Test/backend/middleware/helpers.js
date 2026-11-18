// Lets async route handlers throw without try/catch in every route.
export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export function errorHandler(err, req, res, _next) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That value already exists (duplicate ISBN or membership ID).' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error. Please try again.' });
}
