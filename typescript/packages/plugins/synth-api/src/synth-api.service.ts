import { Tool } from "@goat-sdk/core";
import { SynthAPI } from "./api";
import { SynthApiPredictionBestParameters } from "./parameters";

interface Prediction {
    time: string;
    price: number;
}

interface PredictionBest {
    miner_uid: number;
    prediction: Prediction[][];
}

type PredictionBestResponse = PredictionBest[];

export class SynthApiService {
    constructor(protected api: SynthAPI) {}

    @Tool({
        name: "synth_api_prediction_best_in_one_day",
        description:
            "Get the prediction of future possible bitcoin price, by step of 5 minutes over the next 24 hours, times are in UTC ISO format",
    })
    async synthAPIPredictionBest(_: SynthApiPredictionBestParameters) {
        const responses = (await this.api.request("prediction/best", {
            // we hardcode the parameter for now because the API only supports BTC, 300 and 86400
            asset: "BTC",
            time_increment: 300,
            time_length: 86400,
        })) as PredictionBestResponse;

        if (responses) {
            if (responses.length === 0) {
                throw new Error("No prediction found");
            }

            const response = responses[0];
            const prediction = response.prediction;
            return prediction[0];
        }
        throw new Error("No prediction found");
    }
}
