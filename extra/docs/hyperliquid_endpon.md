Info endpoint
The info endpoint is used to fetch information about the exchange and specific users. The different request bodies result in different corresponding response body schemas.

Pagination
Responses that take a time range will only return 500 elements or distinct blocks of data. To query larger ranges, use the last returned timestamp as the next startTime for pagination.

Perpetuals vs Spot
The endpoints in this section as well as websocket subscriptions work for both Perpetuals and Spot. For perpetuals coin is the name returned in the meta response. For Spot, coin should be PURR/USDC for PURR, and @{index} e.g. @1 for all other spot tokens where index is the index in the universe field of the spotMeta response.

User address
To query the account data associated with a master or sub-account, you must pass in the actual address of that account. A common pitfall is to use an agent wallet's address which leads to an empty result.

Retrieve mids for all coins
POST
 https://api.hyperliquid.xyz/info

Note that if the book is empty, the last trade price will be used as a fallback

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"allMids"

200: OK Successful Response
Copy
{
    "APE": "4.33245",
    "ARB": "1.21695"
}
Retrieve a user's open orders
POST
 https://api.hyperliquid.xyz/info

See a user's open orders

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"openOrders"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK Successful R
Copy
[
    {
        "coin": "BTC",
        "limitPx": "29792.0",
        "oid": 91490942,
        "side": "A",
        "sz": "0.0",
        "timestamp": 1681247412573
    }
]
Retrieve a user's open orders with additional frontend info
POST
 https://api.hyperliquid.xyz/info

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"frontendOpenOrders"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK
Copy
[
    {
        "coin": "BTC",
        "isPositionTpsl": false,
        "isTrigger": false,
        "limitPx": "29792.0",
        "oid": 91490942,
        "orderType": "Limit",
        "origSz": "5.0",
        "reduceOnly": false,
        "side": "A",
        "sz": "5.0",
        "timestamp": 1681247412573,
        "triggerCondition": "N/A",
        "triggerPx": "0.0",
    }
]
Retrieve a user's fills
POST
 https://api.hyperliquid.xyz/info

Returns at most 2000 most recent fills

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"userFills"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

aggregateByTime

bool

When true, partial fills are combined when a crossing order gets filled by multiple different resting orders. Resting orders filled by multiple crossing orders will not be aggregated.

200: OK
Copy
[
    {
        "closedPnl": "0.0",
        "coin": "AVAX",
        "crossed": false,
        "dir": "Open Long",
        "hash": "0xa166e3fa63c25663024b03f2e0da011a00307e4017465df020210d3d432e7cb8",
        "oid": 90542681,
        "px": "18.435",
        "side": "B",
        "startPosition": "26.86",
        "sz": "93.53",
        "time": 1681222254710,
        "fee": "0.01",
        "feeToken": "USDC",
        "builderFee": "0.01", // this is optional and will not be present if 0
        "tid": 118906512037719
    }
]
Retrieve a user's fills by time
POST
 https://api.hyperliquid.xyz/info

Returns at most 2000 fills per response and only the 10000 most recent fills are available

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

userFillsByTime

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

startTime*

int

Start time in milliseconds, inclusive

endTime

int

End time in milliseconds, inclusive. Defaults to current time.

aggregateByTime

bool

When true, partial fills are combined when a crossing order gets filled by multiple different resting orders. Resting orders filled by multiple crossing orders will not be aggregated.

200: OK Number of fills is limited to 2000
Copy
[
    {
        "closedPnl": "0.0",
        "coin": "AVAX",
        "crossed": false,
        "dir": "Open Long",
        "hash": "0xa166e3fa63c25663024b03f2e0da011a00307e4017465df020210d3d432e7cb8",
        "oid": 90542681,
        "px": "18.435",
        "side": "B",
        "startPosition": "26.86",
        "sz": "93.53",
        "time": 1681222254710,
        "fee": "0.01",
        "feeToken": "USDC",
        "builderFee": "0.01", // this is optional and will not be present if 0
        "tid": 118906512037719
    }
]
Query user rate limits
POST
 https://api.hyperliquid.xyz/info

Request Body
Name
Type
Description
user

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

type

String

userRateLimit

200: OK A successful response
Copy
{
  "cumVlm": "2854574.593578",
  "nRequestsUsed": 2890,
  "nRequestsCap": 2864574
}
Query order status by oid or cloid
POST
 https://api.hyperliquid.xyz/info

Request Body
Name
Type
Description
user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

type*

String

"orderStatus"

oid*

uint64 or string

Either u64 representing the order id or 16-byte hex string representing the client order id

200: OK A successful response
200: OK Missing Order
Copy
{
  "status": "order",
  "order": {
    "order": {
      "coin": "ETH",
      "side": "A",
      "limitPx": "2412.7",
      "sz": "0.0",
      "oid": 1,
      "timestamp": 1724361546645,
      "triggerCondition": "N/A",
      "isTrigger": false,
      "triggerPx": "0.0",
      "children": [],
      "isPositionTpsl": false,
      "reduceOnly": true,
      "orderType": "Market",
      "origSz": "0.0076",
      "tif": "FrontendMarket",
      "cloid": null
    },
    "status": "filled" | "open" | "canceled" | "triggered" | "rejected" | "marginCanceled",
    "statusTimestamp": 1724361546645
  }
}
L2 Book snapshot
POST
 https://api.hyperliquid.xyz/info

Returns at most 20 levels per side

Headers

Name
Value
Content-Type*

"application/json"

Body

Name
Type
Description
type*

String

"l2Book"

coin*

String

coin

nSigFigs

Number

Optional field to aggregate levels to nSigFigs significant figures. Valid values are 2, 3, 4, 5, and null, which means full precision

mantissa

Number

Optional field to aggregate levels. This field is only allowed if nSigFigs is 5. Accepts values of 1, 2 or 5.

Response

200: OK
Copy
[
  [
    {
      "px": "19900",
      "sz": "1",
      "n": 1 // The number of different orders that comprise the level
    },
    {
      "px": "19800",
      "sz": "2",
      "n": 2
    },
    {
      "px": "19700",
      "sz": "3",
      "n": 3
    }
  ],
  [
    {
      "px": "20100",
      "sz": "1",
      "n": 1
    },
    {
      "px": "20200",
      "sz": "2",
      "n": 2
    },
    {
      "px": "20300",
      "sz": "3",
      "n": 3
    }
  ]
]
Candle snapshot
POST
 https://api.hyperliquid.xyz/info

Only the most recent 5000 candles are available

Headers

Name
Value
Content-Type*

"application/json"

Body

Name
Type
Description
type*

String

"candleSnapshot"

req*

Object

{"coin": <coin>, "interval": "15m", "startTime": <epoch millis>, "endTime": <epoch millis>}

Response

200: OK
Copy
[
  [
    {
      "T": 1681924499999,
      "c": "29258.0",
      "h": "29309.0",
      "i": "15m",
      "l": "29250.0",
      "n": 189,
      "o": "29295.0",
      "s": "BTC",
      "t": 1681923600000,
      "v": "0.98639"
    }
  ]
]
Check Builder Fee Approval
POST
 https://api.hyperliquid.xyz/info

Headers

Name
Value
Content-Type*

"application/json"

Body

Name
Type
Description
type*

String

"maxBuilderFee"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

builder*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

Response

200: OK
Copy
1 // maximum fee approved in tenths of a basis point i.e. 1 means 0.001%
Retrieve a user's historical orders
POST
 https://api.hyperliquid.xyz/info

Returns at most 2000 most recent historical orders

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"historicalOrders"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK
Copy
[
  {
    "order": {
      "coin": "ETH",
      "side": "A",
      "limitPx": "2412.7",
      "sz": "0.0",
      "oid": 1,
      "timestamp": 1724361546645,
      "triggerCondition": "N/A",
      "isTrigger": false,
      "triggerPx": "0.0",
      "children": [],
      "isPositionTpsl": false,
      "reduceOnly": true,
      "orderType": "Market",
      "origSz": "0.0076",
      "tif": "FrontendMarket",
      "cloid": null
    },
    "status": "filled" | "open" | "canceled" | "triggered" | "rejected" | "marginCanceled",
    "statusTimestamp": 1724361546645
  }
]
Retrieve a user's TWAP slice fills
POST
 https://api.hyperliquid.xyz/info

Returns at most 2000 most recent TWAP slice fills

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"userTwapSliceFills"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK
Copy
[
    {
        "fill": {
            "closedPnl": "0.0",
            "coin": "AVAX",
            "crossed": true,
            "dir": "Open Long",
            "hash": "0x0000000000000000000000000000000000000000000000000000000000000000", // TWAP fills have a hash of 0
            "oid": 90542681,
            "px": "18.435",
            "side": "B",
            "startPosition": "26.86",
            "sz": "93.53",
            "time": 1681222254710,
            "fee": "0.01",
            "feeToken": "USDC",
            "tid": 118906512037719
        },
        "twapId": 3156
    }
]
Retrieve a user's subaccounts
POST
 https://api.hyperliquid.xyz/info

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"subAccounts"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK
Copy
[
  {
    "name": "Test",
    "subAccountUser": "0x035605fc2f24d65300227189025e90a0d947f16c",
    "master": "0x8c967e73e6b15087c42a10d344cff4c96d877f1d",
    "clearinghouseState": {
      "marginSummary": {
        "accountValue": "29.78001",
        "totalNtlPos": "0.0",
        "totalRawUsd": "29.78001",
        "totalMarginUsed": "0.0"
      },
      "crossMarginSummary": {
        "accountValue": "29.78001",
        "totalNtlPos": "0.0",
        "totalRawUsd": "29.78001",
        "totalMarginUsed": "0.0"
      },
      "crossMaintenanceMarginUsed": "0.0",
      "withdrawable": "29.78001",
      "assetPositions": [],
      "time": 1733968369395
    },
    "spotState": {
      "balances": [
        {
          "coin": "USDC",
          "token": 0,
          "total": "0.22",
          "hold": "0.0",
          "entryNtl": "0.0"
        }
      ]
    }
  }
]
Retrieve details for a vault
POST
 https://api.hyperliquid.xyz/info

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"vaultDetails"

vaultAddress*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

user

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK
Copy
{
  "name": "Test",
  "vaultAddress": "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303",
  "leader": "0x677d831aef5328190852e24f13c46cac05f984e7",
  "description": "This community-owned vault provides liquidity to Hyperliquid through multiple market making strategies, performs liquidations, and accrues platform fees.",
  "portfolio": [
    [
      "day",
      {
        "accountValueHistory": [
          [
            1734397526634,
            "329265410.90790099"
          ]
        ],
        "pnlHistory": [
          [
            1734397526634,
            "0.0"
          ],
        ],
        "vlm": "0.0"
      }
    ],
    [
      "week" | "month" | "allTime" | "perpDay" | "perpWeek" | "perpMonth" | "perpAllTime",
      {...}
    ]
  ],
  "apr": 0.36387129259090006,
  "followerState": null,
  "leaderFraction": 0.0007904828725729887,
  "leaderCommission": 0,
  "followers": [
    {
      "user": "0x005844b2ffb2e122cf4244be7dbcb4f84924907c",
      "vaultEquity": "714491.71026243",
      "pnl": "3203.43026143",
      "allTimePnl": "79843.74476743",
      "daysFollowing": 388,
      "vaultEntryTime": 1700926145201,
      "lockupUntil": 1734824439201
    }
  ],
  "maxDistributable": 94856870.164485,
  "maxWithdrawable": 742557.680863,
  "isClosed": false,
  "relationship": {
    "type": "parent",
    "data": {
      "childAddresses": [
        "0x010461c14e146ac35fe42271bdc1134ee31c703a",
        "0x2e3d94f0562703b25c83308a05046ddaf9a8dd14",
        "0x31ca8395cf837de08b24da3f660e77761dfb974b"
      ]
    }
  },
  "allowDeposits": true,
  "alwaysCloseOnWithdraw": false
}  
Retrieve a user's vault deposits
POST
 https://api.hyperliquid.xyz/info

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
type*

String

"userVaultEquities"

user*

String

Address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000.

200: OK
Copy
[
  {
    "vaultAddress": "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303",
    "equity": "742500.082809",
  }



Exchange endpoint
The exchange endpoint is used to interact with and trade on the Hyperliquid chain. See the Python SDK for code to generate signatures for these requests.

Many of the requests take asset as an input. For perpetuals this is the index in the universe field returned by themeta response. For spot assets, use 10000 + index where index is the corresponding index in spotMeta.universe. For example, when submitting an order for PURR/USDC, the asset that should be used is 10000 because its asset index in the spot metadata is 0.

Place an order
POST
 https://api.hyperliquid.xyz/exchange

See Python SDK for full featured examples on the fields of the order request.

For limit orders, TIF (time-in-force) sets the behavior of the order upon first hitting the book.

ALO (add liquidity only, i.e. "post only") will be canceled instead of immediately matching.

IOC (immediate or cancel) will have the unfilled part canceled instead of resting.

GTC (good til canceled) orders have no special behavior.

Client Order ID (cloid) is an optional 128 bit hex string, e.g. 0x1234567890abcdef1234567890abcdef

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "order",
  "orders": [{

    "a": Number,

    "b": Boolean,

    "p": String,

    "s": String,

    "r": Boolean,

    "t": {

      "limit": {

        "tif": "Alo" | "Ioc" | "Gtc" 

      } or

      "trigger": {

         "isMarket": Boolean,

         "triggerPx": String,

         "tpsl": "tp" | "sl"

       }

    },

    "c": Cloid (optional)

  }],

  "grouping": "na" | "normalTpsl" | "positionTpsl",

  "builder": Optional({"b": "address", "f": Number})

}

Meaning of keys:
a is asset
b is isBuy
p is price
s is size
r is reduceOnly
t is type
c is cloid (client order id)

Meaning of keys in optional builder argument:
b is the address the should receive the additional fee
f is the size of the fee in tenths of a basis point e.g. if f is 10, 1bp of the order notional  will be charged to the user and sent to the builder

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful Response (resting)
200: OK Error Response
200: OK Successful Response (filled)
Copy
{
   "status":"ok",
   "response":{
      "type":"order",
      "data":{
         "statuses":[
            {
               "resting":{
                  "oid":77738308
               }
            }
         ]
      }
   }
}
Cancel order(s)
POST
 https://api.hyperliquid.xyz/exchange

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "cancel",

  "cancels": [

    {

      "a": Number,

      "o": Number

    }

  ]

}

Meaning of keys:
a is asset
o is oid (order id)

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful Response
200: OK Error Response
Copy
{
   "status":"ok",
   "response":{
      "type":"cancel",
      "data":{
         "statuses":[
            "success"
         ]
      }
   }
}
Cancel order(s) by cloid
POST
 https://api.hyperliquid.xyz/exchange 

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "cancelByCloid",

  "cancels": [

    {

      "asset": Number,

      "cloid": String

    }

  ]

}

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful Response
200: OK Error Response
Schedule Cancel (dead man's switch)
POST
 https://api.hyperliquid.xyz/exchange 

Copy
{"type": "scheduleCancel", "time": <unix milliseconds> | null}
Schedule a cancel-all operation at a future time. Setting time to null will remove any outstanding scheduled cancel operation.

Modify an order
POST
 https://api.hyperliquid.xyz/exchange  

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "modify",

  "oid": Number | Cloid,

  "order": {

    "a": Number,

    "b": Boolean,

    "p": String,

    "s": String,

    "r": Boolean,

    "t": {

      "limit": {

        "tif": "Alo" | "Ioc" | "Gtc" 

      } or

      "trigger": {

         "isMarket": Boolean,

         "triggerPx": String,

         "tpsl": "tp" | "sl"

       }

    },

    "c": Cloid (optional)

  }

}

Meaning of keys:
a is asset
b is isBuy
p is price
s is size
r is reduceOnly
t is type
c is cloid (client order id)

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful Response
200: OK Error Response
Modify multiple orders
POST
 https://api.hyperliquid.xyz/exchange

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "batchModify",

  "modifies": [

    "oid": Number | Cloid,

    "order": {

      "a": Number,

      "b": Boolean,

      "p": String,

      "s": String,

      "r": Boolean,

      "t": {

        "limit": {

          "tif": "Alo" | "Ioc" | "Gtc" 

        } or

        "trigger": {

           "isMarket": Boolean,

           "triggerPx": String,

           "tpsl": "tp" | "sl"

         }

      },

      "c": Cloid (optional)

  }]

}

Meaning of keys:
a is asset
b is isBuy
p is price
s is size
r is reduceOnly
t is type
c is cloid (client order id)

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

Update leverage
POST
 https://api.hyperliquid.xyz/exchange

Update cross or isolated leverage on a coin. 

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "updateLeverage",

  "asset": index of coin,

  "isCross": true or false if updating cross-leverage,

  "leverage": integer representing new leverage, subject to leverage constraints on that coin

}

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful response
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Update isolated margin
POST
 https://api.hyperliquid.xyz/exchange

Add or remove margin from isolated position

Note that to target a specific leverage instead of a USDC value of margin change, there is an alternate action {"type": "topUpIsolatedOnlyMargin", "asset": <asset>, "leverage": <float string>}

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "updateIsolatedMargin",

  "asset": index of coin,

  "isBuy": true, (this parameter won't have any effect until hedge mode is introduced)

  "ntli": float representing amount to add or remove,

}

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful response
Copy
{'status': 'ok', 'response': {'type': 'default'}}
L1 USDC transfer
POST
 https://api.hyperliquid.xyz/exchange

Send usd to another address. This transfer does not touch the EVM bridge. The signature format is human readable for wallet interfaces.

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "usdSend",

  "hyperliquidChain": "Mainnet" (on testnet use "Testnet" instead),
  "signatureChainId": the id of the chain used when signing in hexadecimal format; e.g. "0xa4b1" for Arbitrum,

  "destination": address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000,

   "amount": amount of usd to send as a string, e.g. "1" for 1 usd,

     "time": current timestamp in milliseconds as a Number, should match nonce

}

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

200: OK Successful Response
Copy
{'status': 'ok', 'response': {'type': 'default'}}
L1 spot transfer
POST
 https://api.hyperliquid.xyz/exchange

Send spot assets to another address. This transfer does not touch the EVM bridge. The signature format is human readable for wallet interfaces.

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "spotSend",

  "hyperliquidChain": "Mainnet" (on testnet use "Testnet" instead),
  "signatureChainId": the id of the chain used when signing in hexadecimal format; e.g. "0xa4b1" for Arbitrum,

  "destination": address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000,
  "token": tokenName:tokenId, e.g. "PURR:0xc4bf3f870c0e9465323c0b6ed28096c2"

   "amount": amount of token to send as a string, e.g. "0.01",

     "time": current timestamp in milliseconds as a Number, should match nonce

}

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

200: OK Successful Response
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Copy
Example sign typed data for generating the signature:
{
  "types": {
    "HyperliquidTransaction:SpotSend": [
      {
        "name": "hyperliquidChain",
        "type": "string"
      },
      {
        "name": "destination",
        "type": "string"
      },
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "amount",
        "type": "string"
      },
      {
        "name": "time",
        "type": "uint64"
      }
    ]
  },
  "primaryType": "HyperliquidTransaction:SpotSend",
  "domain": {
    "name": "HyperliquidSignTransaction",
    "version": "1",
    "chainId": 42161,
    "verifyingContract": "0x0000000000000000000000000000000000000000"
  },
  "message": {
    "destination": "0x0000000000000000000000000000000000000000",
    "token": "PURR:0xc1fb593aeffbeb02f85e0308e9956a90",
    "amount": "0.1",
    "time": 1716531066415,
    "hyperliquidChain": "Mainnet"
  }
}
Initiate a Withdrawal Request
POST
 https://api.hyperliquid.xyz/exchange

This method is used to initiate the withdrawal flow. After making this request, the L1 validators will sign and send the withdrawal request to the bridge contract. There is a $1 fee for withdrawing at the time of this writing and withdrawals take approximately 5 minutes to finalize.

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{
  "type": "withdraw3",

  "hyperliquidChain": "Mainnet" (on testnet use "Testnet" instead),
  "signatureChainId": the id of the chain used when signing in hexadecimal format; e.g. "0xa4b1" for Arbitrum,

  "amount": amount of usd to send as a string, e.g. "1" for 1 usd,

  "time": current timestamp in milliseconds as a Number, should match nonce,

  "destination": address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

}

nonce*

Number

Recommended to use the current timestamp in milliseconds, must match the nonce in the action Object above

signature*

Object

200: OK
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Transfer from Spot account to Perp account (and vice versa)
POST
 https://api.hyperliquid.xyz/exchange

This method is used to transfer USDC from the user's spot wallet to perp wallet and vice versa.

Headers

Name
Value
Content-Type*

"application/json"

Body

Name
Type
Description
action*

Object

{

  "type": "usdClassTransfer",

  "hyperliquidChain": "Mainnet" (on testnet use "Testnet" instead),
  "signatureChainId": the id of the chain used when signing in hexadecimal format; e.g. "0xa4b1" for Arbitrum,

 "amount": amount of usd to tranfer as a string, e.g. "1" for 1 usd. If you want to use this action for a subaccount, you can include subaccount: address after the amount, e.g. "1 subaccount:0x0000000000000000000000000000000000000000,

  "toPerp": True if (spot -> perp) else False,

"nonce": current timestamp in milliseconds as a Number, must match nonce in outer request body

}

nonce*

Number

Recommended to use the current timestamp in milliseconds, must match the nonce in the action Object above

signature*

Object

Response

200: OK
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Deposit or Withdraw from a Vault
POST
 https://api.hyperliquid.xyz/exchange

Add or remove funds from a vault.

Headers

Name
Value
Content-Type*

application/json

Body

Name
Type
Description
action*

Object

{

  "type": "vaultTransfer",

  "vaultAddress": address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000,
"isDeposit": boolean,

"usd": number

}

nonce*

number

Recommended to use the current timestamp in milliseconds

signature*

Object

Response

200
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Approve an API Wallet
POST
 https://api.hyperliquid.xyz/exchange

Approves an API Wallet (also sometimes referred to as an Agent Wallet). See here for more details.

Headers

Name
Value
Content-Type*

application/json

Body

Name
Type
Description
action*

Object

{
  "type": "approveAgent",

  "hyperliquidChain": "Mainnet" (on testnet use "Testnet" instead),
  "signatureChainId": the id of the chain used when signing in hexadecimal format; e.g. "0xa4b1" for Arbitrum,

  "agentAddress": address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000,

"agentName": Optional name for the API wallet. An account can have 1 unnamed approved wallet and up to 3 named ones. And additional 2 named agents are allowed per subaccount,

  "nonce": current timestamp in milliseconds as a Number, must match nonce in outer request body

}

nonce*

number

Recommended to use the current timestamp in milliseconds

signature*

Object

Response

200
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Approve a Builder Fee
POST
 https://api.hyperliquid.xyz/exchange

Approve a maximum fee rate for a builder.

Headers

Name
Value
Content-Type*

application/json

Body

Name
Type
Description
action*

Object

{
  "type": "approveBuilderFee",

  "hyperliquidChain": "Mainnet" (on testnet use "Testnet" instead),
  "signatureChainId": the id of the chain used when signing in hexadecimal format; e.g. "0xa4b1" for Arbitrum,

  "maxFeeRate": the maximum allowed builder fee rate as a percent string; e.g. "0.001%",

  "builder": address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000,

  "nonce": current timestamp in milliseconds as a Number, must match nonce in outer request body

}

nonce*

number

Recommended to use the current timestamp in milliseconds

signature*

Object

Response

200
Copy
{'status': 'ok', 'response': {'type': 'default'}}
Place a TWAP order
POST
 https://api.hyperliquid.xyz/exchange

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "twapOrder",
  "twap": {

    "a": Number,

    "b": Boolean,

    "s": String,

    "r": Boolean,

    "m": Number,

    "t": Boolean

  }

  }

Meaning of keys:
a is asset
b is isBuy
s is size
r is reduceOnly

m is minutes
t is randomize

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its Onchain address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful Response
200: OK Error Response
Copy
{
   "status":"ok",
   "response":{
      "type":"twapOrder",
      "data":{
         "status": {
            "running":{
               "twapId":77738308
            }
         }
      }
   }
}
Cancel a TWAP order
POST
 https://api.hyperliquid.xyz/exchange

Headers
Name
Type
Description
Content-Type*

String

"application/json"

Request Body
Name
Type
Description
action*

Object

{

  "type": "twapCancel",

   "a": Number,

   "t": Number

}

Meaning of keys:
a is asset
t is twap_id

nonce*

Number

Recommended to use the current timestamp in milliseconds

signature*

Object

vaultAddress

String

If trading on behalf of a vault, its address in 42-character hexadecimal format; e.g. 0x0000000000000000000000000000000000000000

200: OK Successful Response
200: OK Error Response
Copy
{
   "status":"ok",
   "response":{
      "type":"twapCancel",
      "data":{
         "status": "success"
      }
   }
}
