/**
 * Blocks NoSQL operator injection such as { "email": { "$gt": "" } }
 * by removing any key that starts with "$" or contains "." from body, query and params.
 */
function clean(value) {
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) delete value[key];
      else clean(value[key]);
    }
  }
  return value;
}

module.exports = function sanitize(req, res, next) {
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
};
