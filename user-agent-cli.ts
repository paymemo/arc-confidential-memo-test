import { select, input, confirm } from "@inquirer/prompts";
import { services, providers } from "./providers";
import { fulfillServiceRequest, generateMemoId, updateServiceRequest } from "./service-provider-backend/api/generate-memo-id";
import { privateKeyToAccount, publicKeyToAddress } from "viem/accounts";
import { readFileSync } from "node:fs";

import {
    type Abi,
    type Address,
    createPublicClient,
    createWalletClient,
    encodeAbiParameters,
    encodeFunctionData,
    erc20Abi,
    getAddress,
    http,
    keccak256,
    parseAbiItem,
    parseAbiParameters,
    parseEventLogs,
    parseUnits,
    stringToHex,
} from "viem";
import { arcTestnet } from "viem/chains";
import { encrypt } from "./subscriber-frontend/crypto/encrypt-memo";

async function main() {
    console.log("\nWelcome to PayMemo\n");

    // Select service
    const serviceValue = await select({
        message: "Select the service you will like to pay for",
        choices: services,
    });

    const service = services.find(
        (service) => service.value === serviceValue,
    );

    if (!service) {
        throw new Error("Service not found");
    }

    // Select provider
    let provider;

    if (service.providerType === "mobile") {
        provider = await select({
            message: "Select the provider network",
            choices: providers.mobile,
        });
    }

    if (service.providerType === "electricity") {
        provider = await select({
            message: "Select your electricity provider",
            choices: providers.electricity,
        });
    }

    // Water is not supported yet
    if (service.providerType === "water") {
        console.log("\nWater payments are coming soon.");
        return;
    }

    // Enter amount
    const amount = await input({
        message: "Enter amount in USDC",
    });

    // Enter recipient details
    let recipient;

    if (service.providerType === "electricity") {
        recipient = await input({
            message: "Enter the meter number",
        });
    } else {
        recipient = await input({
            message: "Enter the phone number",
        });
    }

    // Summary
    console.log("\nSummary");

    if (service.providerType === "electricity") {
        console.log(
            `Pay ${amount} USDC ${provider} bill for meter ${recipient}`,
        );
    } else {
        console.log(
            `Buy ${amount} USDC ${provider} ${service.name} for ${recipient}`,
        );
    }

    // Confirm
    const proceed = await confirm({
        message: "Press y/n to proceed",
    });

    if (!proceed) {
        console.log("\nTransaction cancelled.");
        return;
    }

    // Process
    console.log("\nProcessing...");

    // PayMemo transaction logic will go here
    const rpcUrl = process.env.RPC_URL ?? "https://rpc.testnet.arc.network";
    const senderPrivateKey = process.env.SENDER_PRIVATE_KEY as `0x${string}`;

    const serviceProviderPublicKey = process.env.SERVICE_PROVIDER_PUBLIC_KEY as `0x${string}`;
    const serviceProviderAddress = publicKeyToAddress(serviceProviderPublicKey);

    const memoAddress = "0x5294E9927c3306DcBaDb03fe70b92e01cCede505";
    const usdcAddress = "0x3600000000000000000000000000000000000000";

    const memoAbi = JSON.parse(readFileSync("memo-abi.json", "utf8")) as Abi;
    const account = privateKeyToAccount(senderPrivateKey);

    const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http(rpcUrl),
    });

    const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [serviceProviderAddress, parseUnits(amount, 6)],
    });

    const callDataHash = keccak256(transferData);
    const memoId = generateMemoId();

    const encryptedMemo = encrypt(serviceProviderPublicKey, stringToHex(`${recipient},${service.value},${provider}`));
    const memoBytes = encodeAbiParameters(
        parseAbiParameters(
            "bytes ephemeralPublicKey, bytes iv, bytes ciphertext, bytes authTag",
        ),
        [
            encryptedMemo.ephemeralPublicKey,
            encryptedMemo.iv,
            encryptedMemo.ciphertext,
            encryptedMemo.authTag,
        ],
    );

    const memoCode = await publicClient.getCode({ address: memoAddress });
    if (!memoCode || memoCode === "0x") {
        throw new Error(`Memo contract is not deployed at ${memoAddress}`);
    }

    const hash = await walletClient.writeContract({
        address: memoAddress,
        abi: memoAbi,
        functionName: "memo",
        args: [usdcAddress, transferData, memoId, memoBytes],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
        throw new Error(`Memo transaction reverted: ${hash}`);
    }

    const events = parseEventLogs({
        abi: memoAbi,
        logs: receipt.logs,
    });

    const beforeMemoEvents = events.filter(
        (event) => event.eventName === "BeforeMemo",
    );
    const memoEvents = events.filter((event) => event.eventName === "Memo");
    if (beforeMemoEvents.length !== 1 || memoEvents.length !== 1) {
        throw new Error("Expected exactly one BeforeMemo event and one Memo event");
    }

    const memoArgs = memoEvents[0].args as {
        sender: Address;
        target: Address;
        callDataHash: `0x${string}`;
        memoId: `0x${string}`;
        memo: `0x${string}`;
        memoIndex: bigint;
    };

    if (getAddress(memoArgs.sender) !== account.address) {
        throw new Error(`Unexpected memo sender: ${memoArgs.sender}`);
    }

    if (getAddress(memoArgs.target) !== getAddress(usdcAddress)) {
        throw new Error(`Unexpected memo target: ${memoArgs.target}`);
    }

    if (memoArgs.callDataHash !== callDataHash) {
        throw new Error(`Unexpected callDataHash: ${memoArgs.callDataHash}`);
    }

    if (memoArgs.memoId !== memoId || memoArgs.memo !== memoBytes) {
        throw new Error("Memo event did not include the expected memoId and memo");
    }

    console.log(
        "Transaction:",
        `${arcTestnet.blockExplorers.default.url}/tx/${hash}`,
    );
    console.log("Block:", receipt.blockNumber.toString());
    console.log("Decoded memo events:", events);

    const memoEvent = parseAbiItem(
        "event Memo(address indexed sender,address indexed target,bytes32 callDataHash,bytes32 indexed memoId,bytes memo,uint256 memoIndex)",
    );

    const matchingLogs = await publicClient.getLogs({
        address: memoAddress,
        event: memoEvent,
        args: { memoId },
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
    });

    if (matchingLogs.length !== 1) {
        throw new Error(
            `Expected one Memo log for memoId, found ${matchingLogs.length}`,
        );
    }

    console.log("Memo events matching memoId:", matchingLogs);


    updateServiceRequest(memoId, hash, receipt.blockNumber);
    fulfillServiceRequest(memoId).catch((error) => {
        console.error("Error fulfilling service request:", error);
    });
}

main().catch(console.error);