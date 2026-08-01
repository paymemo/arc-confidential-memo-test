# PayMemo Schematics

                 ┌─────────────────────┐
                 │    AI Agent / User  │
                 └──────────┬──────────┘
                            │
                            │ 1. Request Memo ID
                            ▼
                 ┌─────────────────────┐
                 │      PayMemo API    │
                 │                     │
                 │  x402 Payment Gate  │
                 └──────────┬──────────┘
                            │
                   2. Pay small x402 fee (Currently settling on the Hedera network)
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Generate Memo ID    │
                 │                     │
                 │ Store pending memo  │
                 └──────────┬──────────┘
                            │
                     3. Return Memo ID
                            │
                            ▼
                 ┌─────────────────────┐
                 │    AI Agent / User  │
                 └──────────┬──────────┘
                            │
             4. Encrypt service metadata
                            │
                            │
                            │ 5. USDC + encrypted memo
                            ▼
                 ┌─────────────────────┐
                 │    Arc Network      │
                 │                     │
                 │  Service Provider   │
                 │    EVM Address      │
                 └──────────┬──────────┘
                            │
                   6. Detect transaction
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Service Provider   │
                 │                     │
                 │  Decrypt metadata   │
                 │  Verify payment     │
                 │  Match Memo ID      │
                 └──────────┬──────────┘
                            │
                   7. Fulfill service
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Airtime / Data    │
                 │ Electricity / etc.  │
                 └─────────────────────┘
