// ElizaOS: a plugin with one action, BASE_RATE, that pays for /baserate before the agent calls a coin.
import type { Action, IAgentRuntime, Memory, Plugin } from "@elizaos/core";
import { baseRate, yesterdayUtc } from "./x402-fetch.ts";

export const baseRateAction: Action = {
  name: "PUMPDATA_BASE_RATE",
  similes: ["BASE_RATE", "CHECK_BASE_RATE"],
  description: "How many pump.fun coins crossed $15-28K yesterday (UTC) and how many hit 2x/5x/10x/20x within 3 h. Paid, $0.005.",
  validate: async () => !!process.env.PUMPDATA_PAYER_KEY,
  handler: async (_runtime, _message, _state, _options, callback) => {
    const r = await baseRate({ band: "15k-28k", ...yesterdayUtc() });
    const text = `base rate ${r.from} to ${r.to}: ${r.crossed} coins crossed ${r.band}, 2x/10x shares ${JSON.stringify(r.reached)}, median ${r.median_peak}x`;
    await callback?.({ text, actions: ["PUMPDATA_BASE_RATE"] });
    return { success: true, text, data: r };
  },
};
export const pumpdataPlugin: Plugin = { name: "pumpdata", description: "pump.fun base rates from pumpdata.fun", actions: [baseRateAction] };

// One command, no LLM: run the action's handler as the runtime would.
if (import.meta.url === `file://${process.argv[1]}`) console.log(await baseRateAction.handler({} as IAgentRuntime, {} as Memory));
