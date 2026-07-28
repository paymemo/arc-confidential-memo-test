# Confidential Memos on Arc

This repo contains an end-to-end test for carrying out transactions with confidential memos on Arc testnet.

## Example use cases

* Data subscriptions.
* Airtime payments.
* Utility payments such as electricity or water bills.

## Actors

**Subscriber**: Who pays for service by sending a USDC transfer with an encrypted memo targeting the service prividers address

**ServiceProvider**: Who delivers service to the **Subscriber** by reading the memo tx, decrypts the memo and delivering the service to the end user.

*Note: In an actual production environment, ****Subscriber**** and ****ServiceProvider**** exists in separate environments*.

## How it works

* **Subscriber** gets a unique memoId from the **ServiceProvider**.
* **Subscriber** encrypts fulfilment details with the **ServiceProvider**'s public key.
* **Subscriber** sends a memo transaction transferring USDC to the **ServiceProvider**'s public address with encrypted memo containing the details to fulfil the data request.
* **ServiceProvider** picks up the memo transaction, decrypts the memo details with their private key, get the fulfilment details and fulfils the **Subscriber**'s request.

## Advantage

Memo transactions can contain details that only the target can decrypt.
