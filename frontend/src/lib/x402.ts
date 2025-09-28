// x402 integration is handled server-side via x402-next.
// Import and use `paymentMiddleware` in Route Handlers or middleware
// to automatically satisfy 402 challenges.
// Client components should not import from this module.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - types depend on x402-next package being installed
export { paymentMiddleware } from 'x402-next'
