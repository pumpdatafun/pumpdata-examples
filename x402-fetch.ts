// A paid GET /baserate with the official x402 client (@x402/fetch + @x402/svm). $0.005 in USDC on Solana mainnet.
// PUMPDATA_PAYER_KEY: the payer's secret key, base58 or a solana-keygen JSON array. It needs USDC, no SOL.
import { createKeyPairSignerFromBytes, getBase58Encoder } from "@solana/kit";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactSvmScheme, toClientSvmSigner } from "@x402/svm";

export type BaseRateQuery = { band: string; from: string; to: string; venue?: "any" | "curve" | "pool" };
export async function baseRate(q: BaseRateQuery): Promise<Record<string, unknown>> {
  const key = (process.env.PUMPDATA_PAYER_KEY ?? "").trim();
  if (!key) throw new Error("set PUMPDATA_PAYER_KEY to the payer's secret key");
  const bytes = key.startsWith("[") ? new Uint8Array(JSON.parse(key)) : new Uint8Array(getBase58Encoder().encode(key));
  const signer = await createKeyPairSignerFromBytes(bytes);
  const pay = wrapFetchWithPaymentFromConfig(fetch, { schemes: [{ network: "solana:*", client: new ExactSvmScheme(toClientSvmSigner(signer)) }] });
  const res = await pay(`https://pumpdata.fun/baserate?${new URLSearchParams({ venue: "any", ...q })}`);
  if (!res.ok) throw new Error(`pumpdata ${res.status}: ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>;
}
const day = (ms: number) => new Date(ms).toISOString().slice(0, 10) + "T00:00:00Z";
export const yesterdayUtc = () => ({ from: day(Date.now() - 86400_000), to: day(Date.now()) }); // the last whole UTC day

if (import.meta.url === `file://${process.argv[1]}`) console.log(await baseRate({ band: "15k-28k", ...yesterdayUtc() }));
