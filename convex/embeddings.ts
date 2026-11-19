"use node";

// Isolated in its own file because transformers.js needs Convex's Node.js
// action runtime (native ONNX runtime bindings), not the default V8 isolate
// that queries/mutations/most actions run in. Everything else in the app
// (users.ts, matches.ts, seed.ts) calls into this file via ctx.runAction
// instead of importing ./lib/bert directly.

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { generateEmbedding } from "./lib/bert";

export const generate = internalAction({
  args: { text: v.string() },
  handler: async (_ctx, args): Promise<number[]> => {
    return await generateEmbedding(args.text);
  },
});
