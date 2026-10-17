# pumpdata as MCP tools

The same calls as tools at `POST https://pumpdata.fun/mcp` (Streamable HTTP, JSON-RPC 2.0, no session, no event
stream). `tools/list` shows the calls that answer. A tool called without `payment` returns the offer (the 402 body);
sign it with your wallet and call again with the `PAYMENT-SIGNATURE` value as the `payment` argument.

## Claude Code

```
claude mcp add --transport http pumpdata https://pumpdata.fun/mcp
```

## Cursor, Windsurf, Cline (`mcp.json` / settings)

```json
{ "mcpServers": { "pumpdata": { "url": "https://pumpdata.fun/mcp" } } }
```

## Claude Desktop (`claude_desktop_config.json`, through mcp-remote)

```json
{ "mcpServers": { "pumpdata": { "command": "npx", "args": ["mcp-remote", "https://pumpdata.fun/mcp"] } } }
```

## By hand

```sh
curl -s -X POST https://pumpdata.fun/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

curl -s -X POST https://pumpdata.fun/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"base_rate","arguments":{"band":"15k-28k","from":"2026-10-16T00:00:00Z","to":"2026-10-17T00:00:00Z"}}}'
```

The second call answers with the offer; a client that can sign x402 payments (see `node.mjs`) adds `payment` and
gets the data. The official registry entry is `fun.pumpdata/pumpdata`.
