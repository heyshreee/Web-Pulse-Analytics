/**
 * Wraps an async Express handler so that rejected promises are forwarded
 * to the global error handler instead of crashing the process or needing
 * a try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
