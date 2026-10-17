// A paid call to pumpdata.fun from Node with the x402 client libraries and a Solana keypair.
//   npm i @x402/fetch @x402/svm @solana/kit
//   node node.mjs ./keypair.json "https://pumpdata.fun/baserate?band=15k-28k&from=2026-10-16T00:00:00Z&to=2026-10-17T00:00:00Z"
//   node node.mjs ./keypair.json https://pumpdata.fun/wallets --post '{"addresses":["<base58>", "<base58>"]}'
// The keypair is a Solana JSON keypair holding USDC on mainnet; the facilitator pays the network fee, so it needs no SOL.
// The library caps a payment at $1 unless told otherwise; a $2 replay needs --max 2.5.
import fs from "node:fs";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactSvmScheme, toClientSvmSigner } from "@x402/svm";

const [, , keyPath, url, ...rest] = process.argv;
if (!keyPath || !url) {
  console.error("usage: node node.mjs <keypair.json> <url> [--post '<json>'] [--max <usd>]");
  process.exit(2);
}
const arg = (flag) => (rest.indexOf(flag) >= 0 ? rest[rest.indexOf(flag) + 1] : undefined);
const body = arg("--post");
const maxUsd = Number(arg("--max") ?? 1);

const keypair = await createKeyPairSignerFromBytes(new Uint8Array(JSON.parse(fs.readFileSync(keyPath, "utf8"))));
const paidFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: "solana:*", client: new ExactSvmScheme(toClientSvmSigner(keypair)) }],
  spendControls: { maxAmountPerPayment: maxUsd },
});

const res = await paidFetch(url, { method: body ? "POST" : "GET", headers: body ? { "content-type": "application/json" } : {}, body });
console.log(res.status, "as of", res.headers.get("x-data-as-of"), "from", res.headers.get("x-data-from"));
const receipt = res.headers.get("PAYMENT-RESPONSE");
if (receipt) console.log("receipt", JSON.parse(atob(receipt)));
console.log(await res.text());
