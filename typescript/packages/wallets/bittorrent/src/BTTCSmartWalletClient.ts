import { BTTCWalletClient } from "./BTTCWalletClient";
import type { BTTCTransaction } from "./types";

export abstract class BTTCSmartWalletClient extends BTTCWalletClient {
    abstract sendBatchOfTransactions(transactions: BTTCTransaction[]): Promise<{ hash: string }>;
}
