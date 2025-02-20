import pytest
import os
from goat_wallets.crossmint import CrossmintWalletsAPI
from solana.rpc.api import Client as SolanaClient


@pytest.fixture
def custodial_api():
    """Fixture providing CrossmintWalletsAPI instance with custodial wallet API key."""
    return CrossmintWalletsAPI(
        api_key=os.environ["CROSSMINT_STAGING_API_KEY_CUSTODIAL"],
        base_url="https://staging.crossmint.com"
    )


@pytest.fixture
def smart_api():
    """Fixture providing CrossmintWalletsAPI instance with smart wallet API key."""
    return CrossmintWalletsAPI(
        api_key=os.environ["CROSSMINT_STAGING_API_KEY_SMART"],
        base_url="https://staging.crossmint.com"
    )


@pytest.fixture
def test_message():
    """Fixture providing a test message for signing."""
    return "Test message to sign"


@pytest.fixture
def test_evm_transaction():
    """Fixture providing a test EVM transaction."""
    return {
        "to": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "value": 1000000000000000
    }


@pytest.fixture
def test_solana_transaction():
    """Fixture providing a test Solana transaction."""
    return {
        "instructions": []  # Empty instructions for basic test
    }


@pytest.fixture
def solana_connection():
    """Fixture providing Solana RPC client connection."""
    return SolanaClient("https://api.devnet.solana.com")


@pytest.fixture
def test_email():
    """Fixture providing test email for wallet creation."""
    return "test@example.com"


@pytest.fixture
def test_phone():
    """Fixture providing test phone for wallet creation."""
    return "+1234567890"


@pytest.fixture
def test_user_id():
    """Fixture providing test user ID for wallet creation."""
    return 12345
