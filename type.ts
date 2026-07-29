export type EncryptedPayload = {
    ephemeralPublicKey: `0x${string}`;
    iv: `0x${string}`;
    ciphertext: `0x${string}`;
    authTag: `0x${string}`;
};