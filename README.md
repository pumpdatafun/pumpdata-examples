# pumpdata examples

Calling [pumpdata.fun](https://pumpdata.fun) from an agent or a script: every PumpSwap trade, ever, and every
pump.fun bonding-curve trade since March 2025, read from the chain's ledger with the dead coins kept, sold by the
call in USDC over [x402](https://x402.org) on Solana. No key, no account.

| call | asks | price |
|---|---|---|
| `GET /baserate?band=15k-28k&from=<iso>&to=<iso>&venue=any` | how many coins first traded inside a market-cap band in a window, and how many reached 2x, 5x, 10x, 20x within 3 h | $0.005 |
| `POST /wallets` `{"addresses": [...], "mint": "<optional>"}` | what up to 50 wallets have been: winner, bot, supply seller, new, with the SOL behind it | $0.01 |
| `GET /launch/{mint}` | the deployer's record, the bundle at creation, the insiders' share, and how launches that looked the same went over 24 h | $0.005 |
| `POST /replay` `{"picks": [{"mint", "at", "size_sol"}, ...]}` | up to 500 picks replayed against the chain's history with fees and fills (a queued job; poll `GET /replay/{id}`) | $2 |

Free, no payment: yesterday's base rate for every band at [`/public/baserate.json`](https://pumpdata.fun/public/baserate.json), refreshed hourly.

Contract: [`/openapi.json`](https://pumpdata.fun/openapi.json). Docs for agents: [`/llms.txt`](https://pumpdata.fun/llms.txt). A skill: [`/skill.md`](https://pumpdata.fun/skill.md).

## How a call is paid

1. Call without payment. The answer is **402** with the offer in the body and in the `PAYMENT-REQUIRED` header: price, payee, network (USDC on Solana mainnet), and a Bazaar declaration of the inputs.
2. Sign a USDC transfer for that amount with your wallet (the facilitator pays the network fee; you need no SOL).
3. Call again with the signed payment in `PAYMENT-SIGNATURE`. The answer is the data, with the receipt in `PAYMENT-RESPONSE`.

The x402 client libraries do steps 2 and 3 for you. Every answer carries `X-Data-As-Of` (the build it comes from) and `X-Data-From` (where the data begins). A window with no data answers **404** and costs nothing.

## The examples

- [`curl.sh`](curl.sh): the 402 and the free file, no wallet needed.
- [`node.mjs`](node.mjs): a paid call with `@x402/fetch` and a Solana keypair.
- [`python.py`](python.py): the 402 and the free file from Python; the paid retry with the `x402` package.
- [`mcp.md`](mcp.md): the same calls as MCP tools (Claude Code, Cursor, Cline, Claude Desktop).

Not affiliated with pump.fun.
