/**
 * CSRF protection middleware.
 *
 * Cookie-authenticated, state-changing requests must carry a custom header
 * (`X-Requested-With`). Browsers only send custom headers after a CORS
 * preflight, and the authenticated API answers preflights from unknown
 * origins with no CORS headers at all — so a cross-site request can never
 * carry the header and is rejected here.
 *
 * Requests that authenticate with an explicit `Authorization` header are
 * exempt: that header cannot be attached by a browser without a successful
 * preflight either, so such requests are not forgeable and do not need the
 * extra check.
 */
export default (req, res, next) => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

    if (safeMethods.includes(req.method)) {
        return next();
    }

    // An explicit Authorization header is not an ambient credential.
    if (req.headers.authorization) {
        return next();
    }

    // Check for custom header
    const csrfHeader = req.headers['x-requested-with'];

    if (!csrfHeader) {
        return res.status(403).json({
            error: 'CSRF_PROTECTION',
            message: 'Missing required security header (X-Requested-With)'
        });
    }

    next();
};
