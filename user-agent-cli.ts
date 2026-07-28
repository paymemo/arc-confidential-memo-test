import {
    select,
    input,
    confirm,
} from "@inquirer/prompts";

async function main() {
    console.log("\nWelcome to PayMemo\n");

    const service = await select({
        message: "Select the service you will like to pay for",
        choices: [
            { name: "Airtime", value: "airtime" },
            { name: "Data", value: "data" },
            { name: "Electricity", value: "electricity" },
            { name: "Water", value: "water" },
        ],
    });

    const provider = await select({
        message: "Select the provider network",
        choices: [
            { name: "Airtel", value: "airtel" },
            { name: "Glo", value: "glo" },
            { name: "MTN", value: "mtn" },
        ],
    });

    const amount = await input({
        message: "Enter amount in USDC",
    });

    const phoneNumber = await input({
        message: "Enter the phone number",
    });

    console.log("\nSummary");
    console.log(
        `Buy ${amount} USDC ${provider.toUpperCase()} ${service} for ${phoneNumber}`,
    );

    const proceed = await confirm({
        message: "Press y/n to proceed",
    });

    if (!proceed) {
        console.log("\nTransaction cancelled.");
        return;
    }

    console.log("\nProcessing...");

    // PayMemo payment logic will go here
}

main();
