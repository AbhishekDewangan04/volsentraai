// Stand-in for "cloudflare:workers" when running on Vercel/Node.
export const env = {};
export const exports = {};
export const waitUntil = () => { };
export default { env, exports, waitUntil };