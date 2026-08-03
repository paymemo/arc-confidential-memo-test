# PayMemo Schematics

```text
┌─────────────────────┐
│   AI Agent / User   │
└──────────┬──────────┘
           │
           │ 1. Request Memo ID
           ▼
┌─────────────────────┐
│      PayMemo API    │
│                     │
│   x402 Payment Gate │
└──────────┬──────────┘
           │
           │ 2. Pay small x402 fee
           │    (Currently settled on Hedera)
           ▼
┌─────────────────────┐
│   Memo ID Service   │
│                     │
│ Generate Memo ID    │
│ Store pending memo  │
└──────────┬──────────┘
           │
           │ 3. Return Memo ID
           ▼
┌─────────────────────┐
│   AI Agent / User   │
└──────────┬──────────┘
           │
           │ 4. Encrypt service metadata
           │    using Service Provider's
           │    public key
           │
           │ 5. Send USDC + encrypted memo
           ▼
┌─────────────────────────────┐
│         Arc Network         │
│                             │
│  Service Provider Address   │
└──────────────┬──────────────┘
               │
               │ 6. Detect transaction
               ▼
┌─────────────────────────────┐
│      Service Provider       │
│                             │
│  • Decrypt metadata         │
│  • Verify USDC payment      │
│  • Match Memo ID            │
│  • Fulfill the request      │
└──────────────┬──────────────┘
               │
               │ 7. Deliver service
               ▼
┌─────────────────────────────┐
│       Service Fulfillment   │
│                             │
│  Airtime / Data             │
│  Electricity / Water / etc. │
└─────────────────────────────┘
```

## Flow

1. **Request Memo ID** — The AI Agent or User requests a new `memoId` from the PayMemo API.
2. **x402 Payment** — The requester pays a small x402 fee to access the memo issuance endpoint. For this experiment, the x402 payment is currently settled on the **Hedera network**.
3. **Issue Memo ID** — PayMemo generates a unique `memoId`, stores the pending memo, and returns the ID to the requester.
4. **Encrypt Metadata** — The AI Agent or User encrypts the service metadata using the Service Provider's public key.
5. **Pay on Arc** — The requester sends USDC to the Service Provider's EVM address on Arc, attaching the encrypted service metadata and `memoId`.
6. **Verify and Process** — The Service Provider detects the transaction, decrypts the metadata, verifies the USDC payment, and matches the transaction to the `memoId`.
7. **Fulfill Service** — The Service Provider uses the decrypted metadata to fulfil the requested service, such as airtime, data, electricity, or water.
