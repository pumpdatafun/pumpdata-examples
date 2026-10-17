// solana-agent-kit v2: an Action in a plugin. The agent's own wallet doesn't pay; PUMPDATA_PAYER_KEY does (x402-fetch.ts).
import { Keypair } from "@solana/web3.js";
import { KeypairWallet, SolanaAgentKit, executeAction, type Action, type Plugin } from "solana-agent-kit";
import { z } from "zod";
import { baseRate, yesterdayUtc } from "./x402-fetch.ts";

export const baseRateAction: Action = {
  name: "PUMPDATA_BASE_RATE",
  similes: ["base rate", "how often do coins at this market cap run"],
  description: "pump.fun base rate for a market-cap band and window: coins that crossed it and the share that hit 2x/5x/10x/20x in 3 h. $0.005 over x402.",
  examples: [[{ input: { band: "15k-28k" }, output: { status: "success" }, explanation: "yesterday's $15-28K base rate" }]],
  schema: z.object({ band: z.string().default("15k-28k"), from: z.string().optional(), to: z.string().optional() }),
  handler: async (_agent, input) => ({ status: "success", ...(await baseRate({ ...yesterdayUtc(), ...input, band: input.band ?? "15k-28k" })) }),
};
export const pumpdataPlugin: Plugin = { name: "pumpdata", methods: { baseRate }, actions: [baseRateAction], initialize: () => {} };

if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new SolanaAgentKit(new KeypairWallet(Keypair.generate(), "https://api.mainnet-beta.solana.com"), "https://api.mainnet-beta.solana.com", {}).use(pumpdataPlugin);
  console.log(await executeAction(baseRateAction, agent, { band: "15k-28k" }));
}
