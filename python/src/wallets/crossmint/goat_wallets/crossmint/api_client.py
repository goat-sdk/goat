from typing import Any, Dict, List, Optional, Union
from .parameters import (
    SignTypedDataRequest, AdminSigner, Call, CoreSignerType
)
import requests
import json
from urllib.parse import quote
import time
from goat_wallets.evm import EVMTypedData


class CrossmintWalletsAPI:
    """Python implementation of CrossmintWalletsAPI."""
    
    def __init__(self, api_key: str, base_url: str = "https://staging.crossmint.com"):
        """Initialize the Crossmint Wallets API client.
        
        Args:
            api_key: API key for authentication
            base_url: Base URL for the Crossmint API
        """
        self.api_key = api_key
        self.base_url = f"{base_url}/api/v1-alpha2"
    
    def _request(
        self,
        endpoint: str,
        method: str = "GET",
        timeout: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Make an HTTP request to the Crossmint API.
        
        Args:
            endpoint: API endpoint (relative to base_url)
            method: HTTP method to use
            timeout: Optional request timeout in seconds
            **kwargs: Additional arguments to pass to requests
        
        Returns:
            Parsed JSON response
        
        Raises:
            Exception: If the response is not OK
        """
        url = f"{self.base_url}{endpoint}"
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            **(kwargs.pop("headers", {}))
        }
        
        try:
            kwargs["timeout"] = timeout if timeout is not None else 30
            response = requests.request(method, url, headers=headers, **kwargs)
            response_body = response.json()
            
            if not response.ok:
                error_message = f"Error {response.status_code}: {response.reason}"
                if response_body:
                    error_message += f"\n\n{json.dumps(response_body, indent=2)}"
                raise Exception(error_message)
                
            return response_body
        except Exception as e:
            raise Exception(f"Failed to {method.lower()} {endpoint}: {e}")
    
    def create_smart_wallet(
        self,
        admin_signer: Optional[AdminSigner] = None,
        email: Optional[str] = None,
        user_id: Optional[str] = None,
        chain: str = "base-sepolia"
    ) -> Dict[str, Any]:
        """Create a new EVM smart wallet.
        
        Args:
            admin_signer: Optional admin signer configuration
            email: Optional email to link the wallet to
            user_id: Optional user ID to link the wallet to
            chain: Chain identifier (default: ethereum)
        
        Returns:
            Wallet creation response
        
        Raises:
            ValueError: If neither email nor user_id is provided
        """
        if not email and not user_id:
            raise ValueError("Either email or user_id must be provided")
            
        linked_user = f"email:{email}" if email else f"userId:{user_id}"
        payload = {
            "type": "evm-smart-wallet",
            "config": {
                "adminSigner": admin_signer.model_dump() if admin_signer else None
            },
            "linkedUser": linked_user
        }
        
        return self._request("/wallets", method="POST", json=payload)
    
    def create_custodial_wallet(self, linked_user: str) -> Dict[str, Any]:
        """Create a new Solana custodial wallet.
        
        Args:
            linked_user: User identifier (email, phone, or userId)
        
        Returns:
            Wallet creation response
        """
        # Format linkedUser based on type
        if "@" in linked_user:
            linked_user = f"email:{linked_user}"
        elif linked_user.startswith("+"):
            linked_user = f"phoneNumber:{linked_user}"
        else:
            linked_user = f"userId:{linked_user}"
            
        payload = {
            "type": "solana-mpc-wallet",
            "linkedUser": linked_user
        }
        
        return self._request("/wallets", method="POST", json=payload)
    
    def get_wallet(self, locator: str) -> Dict[str, Any]:
        """Get wallet details by locator.
        
        Args:
            locator: Wallet locator string
        
        Returns:
            Wallet details
        """
        endpoint = f"/wallets/{quote(locator)}"
        return self._request(endpoint)
    
    def sign_message_for_custodial_wallet(
        self, locator: str, message: str
    ) -> Dict[str, Any]:
        """Sign a message using a Solana custodial wallet.
        
        Args:
            locator: Wallet locator string
            message: Message to sign
        
        Returns:
            Signature response
        """
        endpoint = f"/wallets/{quote(locator)}/signatures"
        payload = {
            "type": "solana-message",
            "params": {"message": message}
        }
        
        return self._request(endpoint, method="POST", json=payload)
    
    def sign_message_for_smart_wallet(
        self,
        wallet_address: str,
        message: str,
        chain: str,
        signer: Optional[str] = None
    ) -> Dict[str, Any]:
        """Sign a message using an EVM smart wallet.
        
        Args:
            wallet_address: Wallet address
            message: Message to sign
            chain: Chain identifier
            signer: Optional signer address
        
        Returns:
            Signature response
        """
        endpoint = f"/wallets/{quote(wallet_address)}/signatures"
        payload = {
            "type": "evm-message",
            "params": {
                "message": message,
                "signer": signer,
                "chain": chain
            }
        }
        
        return self._request(endpoint, method="POST", json=payload)
    
    def sign_typed_data_for_smart_wallet(
        self,
        wallet_address: str,
        typed_data: EVMTypedData,
        chain: str,
        signer: str
    ) -> Dict[str, Any]:
        """Sign typed data using an EVM smart wallet.
        
        Args:
            wallet_address: Wallet address
            typed_data: EVM typed data to sign
            chain: Chain identifier
            signer: Signer address
        
        Returns:
            Signature response
        """
        endpoint = f"/wallets/{quote(wallet_address)}/signatures"
        payload = SignTypedDataRequest(
            type="evm-typed-data",
            params={
                "typedData": typed_data,
                "chain": chain,
                "signer": signer
            }
        ).model_dump()
        
        return self._request(endpoint, method="POST", json=payload)

    def check_signature_status(
        self, signature_id: str, wallet_address: str
    ) -> Dict[str, Any]:
        """Check the status of a signature request.
        
        Args:
            signature_id: ID of the signature request
            wallet_address: Address of the wallet
        
        Returns:
            Signature status response
        """
        endpoint = f"/wallets/{quote(wallet_address)}/signatures/{quote(signature_id)}"
        return self._request(endpoint)
    
    def approve_signature_for_smart_wallet(
        self,
        signature_id: str,
        locator: str,
        signer: str,
        signature: str
    ) -> Dict[str, Any]:
        """Approve a signature request for an EVM smart wallet.
        
        Args:
            signature_id: ID of the signature request
            locator: Wallet locator string
            signer: Signer identifier
            signature: Signature value
        
        Returns:
            Approval response
        """
        endpoint = f"/wallets/{quote(locator)}/signatures/{quote(signature_id)}/approvals"
        payload = {
            "approvals": [{
                "signer": signer,
                "signature": signature
            }]
        }
        
        return self._request(endpoint, method="POST", json=payload)
    
    def create_transaction_for_custodial_wallet(
        self, locator: str, transaction: str
    ) -> Dict[str, Any]:
        """Create a transaction using a Solana custodial wallet.
        
        Args:
            locator: Wallet locator string (email:address, phoneNumber:address, or userId:address)
            transaction: Encoded transaction data
        
        Returns:
            Transaction creation response
        """
        # Format locator to use correct wallet type
        endpoint = f"/wallets/{quote(locator)}/transactions"
        payload = {
            "params": {
                "transaction": transaction
            }
        }
        
        return self._request(endpoint, method="POST", json=payload)
    
    def create_transaction_for_smart_wallet(
        self,
        wallet_address: str,
        calls: List[Union[Call, Dict[str, str]]],
        chain: str,
        signer: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a transaction using an EVM smart wallet.
        
        Args:
            wallet_address: Wallet address
            calls: List of contract calls or dictionaries
            chain: Chain identifier
            signer: Optional signer address
        
        Returns:
            Transaction creation response
        """
        endpoint = f"/wallets/{quote(wallet_address)}/transactions"
        
        # Convert dictionaries to Call models if needed
        formatted_calls = []
        for call in calls:
            if isinstance(call, dict):
                formatted_calls.append(Call(**call).model_dump(by_alias=True))
            else:
                formatted_calls.append(call.model_dump(by_alias=True))
        
        payload = {
            "params": {
                "calls": formatted_calls,
                "chain": chain
            }
        }
        if signer:
            payload["params"]["signer"] = f"evm-keypair:{signer}"
        
        return self._request(endpoint, method="POST", json=payload)
    
    def approve_transaction(
        self,
        locator: str,
        transaction_id: str,
        approvals: List[Union[Dict[str, str], AdminSigner]]
    ) -> Dict[str, Any]:
        """Approve a transaction.
        
        Args:
            locator: Wallet locator string
            transaction_id: ID of the transaction
            approvals: List of approval objects or AdminSigner instances
        
        Returns:
            Approval response
        """
        endpoint = f"/wallets/{quote(locator)}/transactions/{quote(transaction_id)}/approvals"
        
        formatted_approvals = []
        for approval in approvals:
            if isinstance(approval, AdminSigner):
                formatted_approvals.append({
                    "signer": f"admin:{approval.address}",
                    "signature": approval.signature,
                    "chain": approval.chain
                })
            else:
                formatted_approvals.append(approval)
        
        payload = {"approvals": formatted_approvals}
        
        return self._request(endpoint, method="POST", json=payload)
    
    def check_transaction_status(
        self, locator: str, transaction_id: str
    ) -> Dict[str, Any]:
        """Check the status of a transaction.
        
        Args:
            locator: Wallet locator string
            transaction_id: ID of the transaction
        
        Returns:
            Transaction status response
        """
        endpoint = f"/wallets/{quote(locator)}/transactions/{quote(transaction_id)}"
        return self._request(endpoint)

    def create_collection(self, parameters: Dict[str, Any], chain: str) -> Dict[str, Any]:
        """Create a new NFT collection.
        
        Args:
            parameters: Collection creation parameters
            chain: Chain identifier
        
        Returns:
            Collection creation response
        """
        endpoint = "/2022-06-09/collections/"
        payload = {**parameters, "chain": chain}
        return self._request(endpoint, method="POST", json=payload)

    def get_all_collections(self) -> Dict[str, Any]:
        """Get all collections created by the user.
        
        Returns:
            List of collections
        """
        endpoint = "/2022-06-09/collections/"
        return self._request(endpoint)

    def mint_nft(self, collection_id: str, recipient: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Mint a new NFT in a collection.
        
        Args:
            collection_id: ID of the collection
            recipient: Recipient identifier (email:address:chain or chain:address)
            metadata: NFT metadata
        
        Returns:
            Minted NFT details
        """
        endpoint = f"/2022-06-09/collections/{quote(collection_id)}/nfts"
        payload = {
            "recipient": recipient,
            "metadata": metadata
        }
        return self._request(endpoint, method="POST", json=payload)

    def create_wallet_for_twitter(self, username: str, chain: str) -> Dict[str, Any]:
        """Create a wallet for a Twitter user.
        
        Args:
            username: Twitter username
            chain: Chain identifier
        
        Returns:
            Created wallet details
        """
        endpoint = "/wallets"
        payload = {
            "type": f"{chain}-mpc-wallet",
            "linkedUser": f"x:{username}"
        }
        return self._request(endpoint, method="POST", json=payload)

    def create_wallet_for_email(self, email: str, chain: str) -> Dict[str, Any]:
        """Create a wallet for an email user.
        
        Args:
            email: Email address
            chain: Chain identifier
        
        Returns:
            Created wallet details
        """
        endpoint = "/wallets"
        payload = {
            "type": f"{chain}-mpc-wallet",
            "linkedUser": f"email:{email}"
        }
        return self._request(endpoint, method="POST", json=payload)

    def get_wallet_by_twitter_username(self, username: str, chain: str) -> Dict[str, Any]:
        """Get wallet details by Twitter username.
        
        Args:
            username: Twitter username
            chain: Chain identifier
        
        Returns:
            Wallet details
        """
        endpoint = f"/wallets/x:{username}:{chain}-mpc-wallet"
        return self._request(endpoint)

    def get_wallet_by_email(self, email: str, chain: str, timeout: Optional[float] = None) -> Dict[str, Any]:
        """Get wallet details by email.
        
        Args:
            email: Email address
            chain: Chain identifier
            timeout: Optional request timeout in seconds
        
        Returns:
            Wallet details
        """
        locator = f"email:{email}:{chain}-mpc-wallet"
        endpoint = f"/wallets/{quote(locator)}"
        return self._request(endpoint, timeout=timeout)

    def request_faucet_tokens(self, wallet_address: str, chain_id: str) -> Dict[str, Any]:
        """Request tokens from faucet.
        
        Args:
            wallet_address: Wallet address
            chain_id: Chain identifier
        
        Returns:
            Faucet request response
        """
        endpoint = f"/wallets/{quote(wallet_address)}/balances"
        payload = {
            "amount": 10,
            "currency": "usdc",
            "chain": chain_id
        }
        return self._request(endpoint, method="POST", json=payload)

    def wait_for_action(self, action_id: str, interval: float = 1.0, max_attempts: int = 60) -> Dict[str, Any]:
        """Wait for an action to complete.
        
        Args:
            action_id: Action ID to wait for
            interval: Time to wait between attempts in seconds
            max_attempts: Maximum number of attempts to check status
        
        Returns:
            Action response when completed
        
        Raises:
            Exception: If action times out or fails
        """
        attempts = 0
        while attempts < max_attempts:
            attempts += 1
            endpoint = f"/2022-06-09/actions/{quote(action_id)}"
            response = self._request(endpoint)
            
            if response.get("status") == "succeeded":
                return response
                
            time.sleep(interval)
            
        raise Exception("Timed out waiting for action")

    def wait_for_transaction(self, locator: str, transaction_id: str, interval: float = 1.0, max_attempts: int = 60) -> Dict[str, Any]:
        """Wait for a transaction to complete.
        
        Args:
            locator: Wallet locator string
            transaction_id: Transaction ID to wait for
            interval: Time to wait between attempts in seconds
            max_attempts: Maximum number of attempts to check status
        
        Returns:
            Transaction response when completed
        
        Raises:
            Exception: If transaction times out or fails
        """
        attempts = 0
        while attempts < max_attempts:
            attempts += 1
            response = self.check_transaction_status(locator, transaction_id)
            
            if response["status"] in ["success", "completed", "failed"]:
                return response
                
            time.sleep(interval)
            
        raise Exception("Timed out waiting for transaction")

    def wait_for_signature(self, locator: str, signature_id: str, interval: float = 1.0, max_attempts: int = 60) -> Dict[str, Any]:
        """Wait for a signature request to complete.
        
        Args:
            locator: Wallet locator string
            signature_id: Signature ID to wait for
            interval: Time to wait between attempts in seconds
            max_attempts: Maximum number of attempts to check status
        
        Returns:
            Signature response when completed
        
        Raises:
            Exception: If signature request times out or fails
        """
        attempts = 0
        while attempts < max_attempts:
            attempts += 1
            response = self.check_signature_status(signature_id, locator)
            
            if response["status"] in ["success", "completed", "failed"]:
                return response
                
            time.sleep(interval)
            
        raise Exception("Timed out waiting for signature")

    def create_wallet(self, wallet_type: str, linked_user: Optional[str] = None, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a new wallet.
        
        Args:
            wallet_type: Type of wallet to create
            linked_user: Optional user identifier to link the wallet to
            config: Optional wallet configuration
        
        Returns:
            Created wallet details
        """
        payload = {
            "type": wallet_type,
            "linkedUser": linked_user
        }
        if config:
            payload["config"] = config
        return self._request("/wallets", method="POST", json=payload)

    def create_wallet_for_phone(self, phone: str, chain: str) -> Dict[str, Any]:
        """Create a wallet for a phone number.
        
        Args:
            phone: Phone number
            chain: Chain identifier
        
        Returns:
            Created wallet details
        """
        return self.create_wallet(
            wallet_type=f"{chain}-mpc-wallet",
            linked_user=f"phone:{phone}"
        )

    def create_wallet_for_user_id(self, user_id: str, chain: str) -> Dict[str, Any]:
        """Create a wallet for a user ID.
        
        Args:
            user_id: User identifier
            chain: Chain identifier
        
        Returns:
            Created wallet details
        """
        return self.create_wallet(
            wallet_type=f"{chain}-mpc-wallet",
            linked_user=f"userId:{user_id}"
        )
