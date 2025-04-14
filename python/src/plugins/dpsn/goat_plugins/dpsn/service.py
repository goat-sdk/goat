import logging
from typing import Dict, Any
from goat.decorators.tool import Tool
from .parameters import SubscribeQueryParameters, UnsubscribeQueryParameters
from .dpsn_client import DpsnService


class DpsnPluginService:
    def __init__(self, dpsn_service):
        self.dpsn_service = dpsn_service
        if self.dpsn_service._initialized:
            print("DpsnService initialized successfully within plugin.")
        else:
            print("Embedded DpsnService failed to initialize. Check dpsn-client logs and .env configuration. Plugin may not function correctly.")

    @Tool({
        "name":"dpsn_subscription_tool",
        "description": "Subscribe to the given dpsn_topic",
        "parameters_schema": SubscribeQueryParameters
    })
    async def subscribe(self, parameters: dict):
        topic = parameters.get("dpsn_topic")
        if not topic:
            return {"status": "error", "message": "Missing required parameter: topic"}

        if not self.dpsn_service or not self.dpsn_service._initialized:
            return {"status": "error", "message": "DPSN service is not available or failed to initialize."}

        success = self.dpsn_service.subscribe(topic)
        

        if success:
            return {"status": "success", "message": f"Subscribed successfully to topic: {topic}"}
        else:
            return {"status": "error", "message": f"Failed to subscribe to topic: {topic}"}

    @Tool({
        "name":"dpsn_unsubscribe_tool",
        "description": "Unsubscribe from given dpsn_topic",
        "parameters_schema": UnsubscribeQueryParameters
    })
    async def unsubscribe(self, parameters: dict):
        """Unsubscribes from a DPSN topic using the embedded DpsnService."""
        topic = parameters.get("dpsn_topic")
        if not topic:
            return {"status": "error", "message": "Missing required parameter: topic"}

        if not self.dpsn_service or not self.dpsn_service._initialized:
            return {"status": "error", "message": "DPSN service is not available or failed to initialize."}

        success = self.dpsn_service.unsubscribe(topic)

        if success:
            return {"status": "success", "message": f"Unsubscribed successfully from topic: {topic}"}
        else:
            return {"status": "error", "message": f"Failed to unsubscribe from topic: {topic}"}


