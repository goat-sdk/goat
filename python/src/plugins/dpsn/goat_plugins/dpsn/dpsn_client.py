import os
import logging
from typing import Optional, Callable, Dict, Any
from dpsn_client.client import DpsnClient, DPSNError

class DpsnService:
    def __init__(self,
                 dpsn_url:str,
                 evm_wallet_pvt_key:str):
        self.dpsn_url = dpsn_url
        self.private_key = evm_wallet_pvt_key
        self.client: Optional[DpsnClient] = None
        self._initialized: bool = False
        self.message_callback: Optional[Callable[[Dict[str, Any]], None]] = None

        if not self.dpsn_url or not self.private_key:
            return
        
        try:
            chain_options = {"network": "testnet", "wallet_chain_type": "ethereum"}
            connection_options = {"ssl": True}
            self.client = DpsnClient(
                dpsn_url=self.dpsn_url,
                private_key=self.private_key,
                chain_options=chain_options,
                connection_options=connection_options
            )
            self.client.on_error += self._handle_client_error
        except Exception as e:
            self.client = None
            raise RuntimeError("Unexpected error during DpsnClient instantiation") from e

        try:
            self._ensure_initialized()
        except Exception as e:
            raise RuntimeError("Unexpected error during DpsnClient instantiation") from e

    def _handle_client_error(self, error: DPSNError):
        """Handle errors emitted by the DpsnClient."""
        code_name = error.code.name if hasattr(error.code, 'name') else error.code
        self._initialized = False
        raise RuntimeError(f"[DpsnClient EVENT] Error received: Code={code_name}, "
                          f"Message={error.message}, Status={error.status}")

    def _apply_message_callback(self):
        """
        Apply the stored message callback to the client if available.
        This helper centralizes callback attachment logic.
        """
        if self.message_callback and self.client and hasattr(self.client, 'on_msg'):
            try:
                # Remove existing callback to avoid duplicates
                try:
                    self.client.on_msg -= self.message_callback
                except ValueError:
                    pass  
                self.client.on_msg += self.message_callback
            except Exception as e:
                raise RuntimeError(f"[DpsnClient EVENT] Error received: Code={code_name}, "
                          f"Message={error.message}, Status={error.status}")
                

    def _ensure_initialized(self):
        """
        Initialize the DpsnClient connection if not already connected.
        Applies stored callbacks once the initialization is successful.
        """
        if self._initialized:
            return

        if not self.client:
            raise RuntimeError("DpsnClient not configured.")

        # If already connected, mark as initialized and reapply the callback (if needed)
        if self.client.dpsn_broker and self.client.dpsn_broker.is_connected():
            self._initialized = True
            self._apply_message_callback()
            return

        try:
            self.client.init({
                "retry_options": {
                    "max_retries": 3,
                    "initial_delay": 1000,  # in milliseconds
                    "max_delay": 5000       # in milliseconds
                }
            })
            self._apply_message_callback()
            self._initialized = True
        except (DPSNError, Exception) as e:
            if isinstance(e, DPSNError):
                code_name = e.code.name if hasattr(e.code, 'name') else e.code
            self._initialized = False
            raise e

    def set_message_callback(self, callback: Callable[[Dict[str, Any]], None]):
        """
        Set the callback function for incoming messages. If the client is already initialized,
        the callback will be attached immediately; otherwise, it will be stored for attachment 
        upon initialization.
        """
        # Remove any existing callback from the client if present
        if self.client and self.message_callback and hasattr(self.client, 'on_msg'):
            try:
                self.client.on_msg -= self.message_callback
            except ValueError:
                pass
            except Exception:
                raise RuntimeError("Error removing previous message callback")

        self.message_callback = callback

        if self.client and self._initialized and hasattr(self.client, 'on_msg'):
            try:
                self.client.on_msg += self.message_callback
            except Exception:
                raise RuntimeError("Failed to apply message callback to the initialized client")

    def subscribe(self, topic: str) -> bool:
        """Subscribe to a specified topic. Returns True on success, False otherwise."""
        try:
            # Since the client is already initialized in the constructor, this is mainly a safety check.
            self._ensure_initialized()
        except Exception as e:
            raise RuntimeError(f"Subscription failed for topic '{topic}': {e}")

        if not (self.client and self.client.dpsn_broker and self.client.dpsn_broker.is_connected()):
            self._initialized = False
            raise RuntimeError(f"Subscription failed for topic '{topic}': Client is not connected.")

        try:
            self.client.subscribe(topic)
            return True
        except DPSNError as e:
            code_name = e.code.name if hasattr(e.code, 'name') else e.code
            raise RuntimeError(f"DPSN Subscription Error for topic '{topic}': Code={code_name}, Message={e.message}")
        except Exception:
            raise RuntimeError(f"Unexpected error during subscription to topic '{topic}'")

    def unsubscribe(self, topic: str) -> bool:
        """Unsubscribe from a specified topic. Returns True on success, False otherwise."""
        try:
            self._ensure_initialized()
        except Exception as e:
            raise RuntimeError(f"Unsubscription failed for topic '{topic}': {e}")

        if not (self.client and self.client.dpsn_broker and self.client.dpsn_broker.is_connected()):
            self._initialized = False
            raise RuntimeError(f"Unsubscription failed for topic '{topic}': Client is not connected.")

        try:
            self.client.unsubscribe(topic)
            return True
        except DPSNError as e:
            code_name = e.code.name if hasattr(e.code, 'name') else e.code
            raise RuntimeError(f"DPSN Unsubscription Error for topic '{topic}': Code={code_name}, Message={e.message}")
        except Exception:
            raise RuntimeError(f"Unexpected error during unsubscription from topic '{topic}'")

    def shutdown(self) -> bool:
        """
        Disconnect the DPSN client. Returns True if successful (or already shut down),
        raises an exception if an error occurs.
        """
        if not self.client:
            return True

        if not self._initialized:
            raise RuntimeError("Shutdown called but client was not initialized or already shut down.")

        try:
            self.client.disconnect()
            self._initialized = False
            return True
        except DPSNError as e:
            code_name = e.code.name if hasattr(e.code, 'name') else e.code
            self._initialized = False
            raise RuntimeError(f"DPSN Shutdown Error: Code={code_name}, Message={e.message}")
        except Exception as e:
            self._initialized = False
            raise RuntimeError(f"Unexpected error during DPSN shutdown: {str(e)}")
