#!/bin/sh
# pumpdata.fun from the shell: the free file, then the offer a paid call answers with (no wallet needed for either).

# 1. Free: yesterday's base rate for every market-cap band, refreshed hourly.
curl -s https://pumpdata.fun/public/baserate.json | head -c 600; echo

# 2. The offer: a paid call without payment answers 402 with the price, the payee and the network in the body,
#    the same encoded in the PAYMENT-REQUIRED header, and a Bazaar declaration of the inputs.
curl -s -i "https://pumpdata.fun/baserate?band=15k-28k&from=2026-10-16T00:00:00Z&to=2026-10-17T00:00:00Z" | sed -n '1,12p'

# 3. A window before the data begins: 404, nothing charged (X-Data-From says where the data starts).
curl -s -i "https://pumpdata.fun/baserate?band=15k-28k&from=2024-01-01T00:00:00Z&to=2024-02-01T00:00:00Z" | sed -n '1,8p'

# 4. The MCP tool list (the open calls only).
curl -s -X POST https://pumpdata.fun/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 400; echo

# To pay: sign the USDC transfer the offer asks for and retry with PAYMENT-SIGNATURE. See node.mjs and python.py.
