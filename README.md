# Confidential Memos on Arc

This repo contains an end-to-end test for carrying out transactions with confidential memos on Arc testnet.

## Example use case

Data subscription where the transaction details is encrypted as the memo sent along with the USDC transfer

## Actors

**Subscriber**: Who pays for data by sending a USDC transfer with an encrypted memo targeting the service prividers address

**ServiceProvider**: Who delivers data to the subscriber by reading the memo tx, decrypts the memo and delivering the service to the end user.

*Note: In an actual production environment, **Subscriber** and **ServiceProvider** exists in separate environments*.

## How it works

* User gets a unique memoId from the service provider
* User encrypts memo data with the service providers public key
* User sends the memo transaction transferring 1 USDC to the service providers public address with encrypted memo containing the details to fulfil the data request.
* Service provider picks up the memo transaction, decrypts the memo details with their private key, get the fulfilment details and sends the data to the user.

## Advantage

Memo transactions can contain details that only the target can decrypt.
