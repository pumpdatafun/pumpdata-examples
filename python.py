#!/usr/bin/env python3
"""pumpdata.fun from Python: the free file and the 402 offer with the standard library; the paid retry with the
`x402` package (pip install x402) and a Solana keypair, when you have one.

  python3 python.py                       # the free file and the offer, no wallet
  python3 python.py --key keypair.json    # a paid base-rate call (needs: pip install x402 solders)
"""
import argparse, base64, json, sys, urllib.request

UA = {"user-agent": "pumpdata-examples/1 (+https://github.com/pumpdatafun/pumpdata-examples)"}
BASE = "https://pumpdata.fun"
WINDOW = "band=15k-28k&from=2026-10-16T00:00:00Z&to=2026-10-17T00:00:00Z"


def get(url: str):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--key", help="a Solana JSON keypair holding USDC on mainnet (no SOL needed)")
    a = ap.parse_args()

    # 1. free: yesterday's base rate for every band
    status, headers, body = get(f"{BASE}/public/baserate.json")
    d = json.loads(body)
    b = d["bands"][d["headline"]]
    print(f"free file: {d['day']} {d['headline']}: {b['crossed']} crossed, 10x {b['reached']['10x']:.1%}, median peak {b['median_peak']}x (as of {headers.get('x-data-as-of')})")

    # 2. the offer: a paid call without payment answers 402
    status, headers, body = get(f"{BASE}/baserate?{WINDOW}")
    offer = json.loads(body)
    acc = offer["accepts"][0]
    print(f"offer: HTTP {status}; {int(acc['amount']) / 1e6:.3f} USDC to {acc['payTo'][:8]}… on {acc['network']}; data from {headers.get('x-data-from')}")
    print("inputs the Bazaar declaration describes:", list(offer["extensions"]["bazaar"]["schema"]["properties"]["input"]["properties"]["queryParams"]["properties"]))

    if not a.key:
        print("no --key: stopping before payment. With a keypair, the x402 client signs the USDC transfer and retries with PAYMENT-SIGNATURE.")
        return 0

    # 3. paid: the x402 package wraps requests/httpx with the retry
    try:
        import requests
        from x402.clients.requests import x402_requests
        from x402.clients.base import x402Client
        from solders.keypair import Keypair
    except ImportError as e:
        print(f"pip install x402 requests solders  ({e})", file=sys.stderr)
        return 1
    kp = Keypair.from_bytes(bytes(json.load(open(a.key))))
    session = x402_requests(x402Client(account=kp))
    r = session.get(f"{BASE}/baserate?{WINDOW}", headers=UA)
    print("paid:", r.status_code, "as of", r.headers.get("x-data-as-of"))
    receipt = r.headers.get("PAYMENT-RESPONSE")
    if receipt:
        print("receipt:", json.loads(base64.b64decode(receipt)))
    print(r.text[:400])
    return 0


if __name__ == "__main__":
    sys.exit(main())
