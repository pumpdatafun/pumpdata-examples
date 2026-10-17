// Vercel AI SDK (ai v7): a tool the model can call before it calls a coin. Pass it in `tools` to generateText/streamText.
import { tool } from "ai";
import { z } from "zod";
import { baseRate, yesterdayUtc } from "./x402-fetch.ts";

export const pumpdataBaseRate = tool({
  description: "pump.fun base rate: coins that first traded inside a market-cap band in a window, and the share that hit 2x/5x/10x/20x within 3 h. Paid, $0.005.",
  inputSchema: z.object({
    band: z.string().describe("e.g. 15k-28k; edges snap to 5k,10k,15k,20k,28k,40k,60k,100k,250k,1000k"),
    from: z.string().optional().describe("ISO 8601, UTC; default yesterday 00:00Z"),
    to: z.string().optional().describe("ISO 8601, UTC; default today 00:00Z"),
  }),
  execute: async ({ band, from, to }) => baseRate({ band, ...yesterdayUtc(), ...(from ? { from } : {}), ...(to ? { to } : {}) }),
});

// One command, no model: run the tool as generateText would.
if (import.meta.url === `file://${process.argv[1]}`) console.log(await pumpdataBaseRate.execute!({ band: "15k-28k" }, { toolCallId: "local", messages: [], context: {} }));
