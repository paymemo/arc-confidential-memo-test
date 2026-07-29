import { randomBytes } from "node:crypto";
import {
    createPublicClient, keccak256, stringToHex, http, parseAbiItem,
    decodeAbiParameters,
    parseAbiParameters,
    hexToString,
} from "viem";
import { arcTestnet } from "viem/chains";
import { decrypt } from "../crypto/decrypt-memo";

type ServiceRequest = {
    blockNumber?: bigint;
    fulfilled: boolean;
    txHash?: `0x${string}`;
};
const serviceRequestsMap = new Map<string, ServiceRequest>();

const rpcUrl = process.env.RPC_URL ?? "https://rpc.testnet.arc.network";
const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(rpcUrl),
});

export function generateMemoId(): `0x${string}` {
    const memoId = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;
    const serviceRequest: ServiceRequest = {
        fulfilled: false,
    };
    serviceRequestsMap.set(memoId, serviceRequest);
    return memoId;
}

export function updateServiceRequest(memoId: `0x${string}`, txHash: `0x${string}`, blockNumber: bigint) {
    const serviceRequest = serviceRequestsMap.get(memoId);
    if (!serviceRequest) {
        throw new Error(`Service request not found for memoId: ${memoId}`);
    }
    serviceRequest.txHash = txHash;
    serviceRequest.blockNumber = blockNumber;
}

export async function fulfillServiceRequest(memoId: `0x${string}`) {
    const serviceRequest = serviceRequestsMap.get(memoId);
    if (!serviceRequest) {
        throw new Error(`Service request not found for memoId: ${memoId}`);
    }
    const blockNumber = serviceRequest?.blockNumber;
    if (blockNumber === undefined) {
        throw new Error(`Block number not set for memoId: ${memoId}`);
    }
    const txHash = serviceRequest?.txHash;
    if (txHash === undefined) {
        throw new Error(`Transaction hash not set for memoId: ${memoId}`);
    }

    const memoEvent = parseAbiItem(
        "event Memo(address indexed sender,address indexed target,bytes32 callDataHash,bytes32 indexed memoId,bytes memo,uint256 memoIndex)",
    );

    const memoAddress = "0x5294E9927c3306DcBaDb03fe70b92e01cCede505";
    const [matchingLog] = await publicClient.getLogs({
        address: memoAddress,
        event: memoEvent,
        args: { memoId },
        fromBlock: blockNumber,
        toBlock: blockNumber,
    });

    const memoBytes = matchingLog?.args.memo;
    if (!memoBytes) {
        console.log("No memo found for memoId:", memoId);
        return;
    }

    const [ephemeralPublicKey, iv, ciphertext, authTag] = decodeAbiParameters(
        parseAbiParameters(
            "bytes ephemeralPublicKey, bytes iv, bytes ciphertext, bytes authTag",
        ),
        memoBytes,
    );

    const encryptedPayload = {
        ephemeralPublicKey,
        iv,
        ciphertext,
        authTag,
    };

    const serviceProviderPrivateKey =
        process.env.SERVICE_PROVIDER_PRIVATE_KEY as `0x${string}`;

    const decrypted = await decrypt(
        serviceProviderPrivateKey,
        encryptedPayload,
    );

    console.log("Decrypted memo:", hexToString(decrypted));

    // TODO use the decrypted memo to fulfill the service request, e.g., by calling an API or performing some action.
    serviceRequest.fulfilled = true;
}
