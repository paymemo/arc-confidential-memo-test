# Confidential Memos on Arc

This repository contains an end-to-end test for sending USDC transactions with confidential, encrypted memos on the Arc testnet.

## Example Use Cases

* Data subscriptions
* Airtime payments
* Utility payments, such as electricity or water bills

## Actors

**Subscriber** — The user who pays for a service by sending a USDC transfer with an encrypted memo targeting the Service Provider's address.

**Service Provider** — The entity that delivers the requested service to the Subscriber. The Service Provider reads the memo transaction, decrypts the encrypted memo, and uses the information to fulfil the Subscriber's request.

> **Note:** In a production environment, the **Subscriber** and **Service Provider** would typically operate in separate environments.

## How It Works

1. The **Subscriber** requests a unique `memoId` from the **Service Provider**.
2. The **Subscriber** encrypts the fulfilment details using the **Service Provider's** public key.
3. The **Subscriber** sends a memo transaction that:

   * Transfers USDC to the **Service Provider's** public address.
   * Includes the encrypted memo containing the details required to fulfil the request.
4. The **Service Provider** detects the memo transaction and decrypts the memo using its private key.
5. The **Service Provider** retrieves the fulfilment details and fulfils the **Subscriber's** request.

## Advantage

Confidential memo transactions allow users to attach encrypted data to a transaction that can only be decrypted by the intended recipient.

This enables payment and fulfilment details—such as phone numbers, meter numbers, or subscription information—to be securely associated with an on-chain payment without exposing the underlying data publicly.

## Test

1. Copy `.env-example` to `.env`:

```bash
cp .env-example .env
```

2. Update the following environment variables:

```env
SENDER_PRIVATE_KEY=
SERVICE_PROVIDER_PRIVATE_KEY=
SERVICE_PROVIDER_PUBLIC_KEY=
```

3. Install the dependencies:

```bash
npm install
```

4. Run the Subscriber CLI:

```bash
npx tsx --env-file=.env user-agent-cli.ts
```
