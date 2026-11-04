import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const handler = createStartHandler((ctx) => {
    return defaultStreamHandler(ctx);
});

export default { fetch: handler };
