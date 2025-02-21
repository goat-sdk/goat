import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.CROSSMINT_STAGING_API_KEY;
const email = process.env.EMAIL;

if (!apiKey || !email) {
    throw new Error("Missing environment variables");
}

(async () => {
    const response = await createWallet(email, apiKey);

    if (response.error) {
        console.error(response.error);
        return;
    }

    console.log(`Created wallet: ${response.address}`);
    console.log(`Details: ${JSON.stringify(response, null, 2)}`);
})();

async function createWallet(email: string, apiKey: string) {
    const response = await fetch("https://staging.crossmint.com/api/2022-06-09/wallets", {
        method: "POST",
        headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: "solana-custodial-wallet",
            linkedUser: `email:${email}`,
        }),
    });

    return await response.json();
}
