import { secp256k1 } from "@noble/curves/secp256k1.js";
import {
    createDecipheriv,
    createHash,
} from "node:crypto";
import { hexToBytes } from "@noble/curves/utils.js";
import { EncryptedPayload } from "../../type";


export function decrypt(
    recipientPrivateKey: `0x${string}`,
    encrypted: EncryptedPayload,
): `0x${string}` {
    // Convert private key from 0x-prefixed hex to bytes
    const privateKeyBytes = hexToBytes(
        recipientPrivateKey.slice(2),
    );

    // Convert ephemeral public key to bytes
    const ephemeralPublicKeyBytes = hexToBytes(
        encrypted.ephemeralPublicKey.slice(2),
    );

    // Derive the same shared secret
    const sharedSecret =
        secp256k1.getSharedSecret(
            privateKeyBytes,
            ephemeralPublicKeyBytes,
            false,
        );

    // Derive the same AES-256 key
    const encryptionKey =
        createHash("sha256")
            .update(Buffer.from(sharedSecret))
            .digest();

    // Convert encrypted components to buffers
    const iv = Buffer.from(
        encrypted.iv.slice(2),
        "hex",
    );

    const ciphertext = Buffer.from(
        encrypted.ciphertext.slice(2),
        "hex",
    );

    const authTag = Buffer.from(
        encrypted.authTag.slice(2),
        "hex",
    );

    // Create AES-256-GCM decipher
    const decipher = createDecipheriv(
        "aes-256-gcm",
        encryptionKey,
        iv,
    );

    // Set authentication tag
    decipher.setAuthTag(authTag);

    // Decrypt
    const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    // Return as 0x-prefixed hex
    return `0x${plaintext.toString("hex")}`;
}
