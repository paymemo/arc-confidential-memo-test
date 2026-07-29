import { secp256k1 } from "@noble/curves/secp256k1.js";
import {
    createCipheriv,
    createHash,
    randomBytes,
} from "node:crypto";
import { hexToBytes } from "@noble/curves/utils.js";
import { EncryptedPayload } from "../../type";

export function encrypt(
    recipientPublicKey: `0x${string}`,
    hexData: `0x${string}`,
): EncryptedPayload {
    // Generate a random 32-byte ephemeral private key
    const ephemeralPrivateKey = randomBytes(32);

    // Generate the corresponding ephemeral public key
    const ephemeralPublicKey = secp256k1.getPublicKey(ephemeralPrivateKey, false);

    // Convert recipient's 0x-prefixed public key to bytes
    const recipientPublicKeyBytes =
        hexToBytes(recipientPublicKey.slice(2));

    // Derive the shared secret using ECDH
    const sharedSecret =
        secp256k1.getSharedSecret(
            ephemeralPrivateKey,
            recipientPublicKeyBytes,
            false,
        );

    // Derive a 32-byte AES encryption key
    const encryptionKey = createHash("sha256")
        .update(Buffer.from(sharedSecret))
        .digest();

    // Convert the original 0x-prefixed hex data to bytes
    const plaintext = Buffer.from(
        hexData.slice(2),
        "hex",
    );

    // Generate a random 12-byte IV
    const iv = randomBytes(12);

    // Encrypt using AES-256-GCM
    const cipher = createCipheriv(
        "aes-256-gcm",
        encryptionKey,
        iv,
    );

    const ciphertext = Buffer.concat([
        cipher.update(plaintext),
        cipher.final(),
    ]);

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    return {
        ephemeralPublicKey:
            `0x${Buffer.from(ephemeralPublicKey).toString("hex")}`,

        iv:
            `0x${iv.toString("hex")}`,

        ciphertext:
            `0x${ciphertext.toString("hex")}`,

        authTag:
            `0x${authTag.toString("hex")}`,
    };
}
