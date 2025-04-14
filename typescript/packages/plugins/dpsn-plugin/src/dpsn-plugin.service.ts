import { EventEmitter } from "events";
import { Tool } from "@goat-sdk/core";
import { Dpsnservice } from "./dpsnClient";
import {
    SubscribeToTopicParameters,
    UnsubscribeFromTopicParameters,
} from "./parameters";

export class DpsnPluginService {
    constructor(
        private readonly dpsnService: Dpsnservice,
        private readonly DpsnDataStream: EventEmitter,
    ) {}

    @Tool({
        name: "dpsn_subscription_tool",
        description: "Subscribe to the given dpsn_topic",
    })
    async subscribeToDpsnTopic(params: SubscribeToTopicParameters) {
        console.log(
            "Reached the dpsn tool ,Subscribing to DPSN topic:",
            params.dpsn_topic,
        );
        await this.dpsnService.subscribe(params.dpsn_topic, (message) => {
            this.DpsnDataStream.emit("message", {
                topic: params.dpsn_topic,
                data: message,
            });
        });

        return "Subscribed to " + params.dpsn_topic + " successfully";
    }

    @Tool({
        name: "dpsn_unsubscribe_tool",
        description: "Unsubscribe from given dpsn_topic",
    })
    async unsubscribeToDpsnTopic(params: UnsubscribeFromTopicParameters) {
        console.log(
            "Reached the dpsn tool ,UnSubscribing to DPSN topic:",
            params.dpsn_topic,
        );

        const res = await this.dpsnService.unsubscribe(params.dpsn_topic);
        if (res) {
            return "Unsubscribed from " + params.dpsn_topic + " successfully";
        }
        return "Failed to unsubscribe from " + params.dpsn_topic;
    }
}
