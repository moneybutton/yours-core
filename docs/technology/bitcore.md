bitcore
=======

bitcore is a bitcoin full node and blockchain API and is what we use to query
the blockchain. "Insight" is the name of the blockchain API portion of bitcore.
bitcore and Insight are developed by BitPay. There is a public instance of
mainnet Insight running at https://insight.bitpay.com and a testnet version at
https://testnet-insight.bitpay.com .

You can run your own Insight as follows. First, install bitcore with "npm
install -g bitcore".

For mainnet, create a directory ~/.bitcore-mainnet. Then create the file
~/.bitcore-mainnet/bitcore-node.json containing the following:
```
{
  "datadir": "/home/ryan/.bitcore-mainnet/data",
  "network": "livenet",
  "port": 3001,
  "services": [
    "bitcoind",
    "db",
    "address",
    "web",
    "insight-api",
    "insight-ui"
  ]
}
```

Then run bitcore/Insight with this command:
```
bitcored -c ~/.bitcore-mainnet
```

You can now access Insight at localhost:3001/insight.

You can run Datt in mainnet with this command:
```
FULLNODE_NETWORK=mainnet DATT_BLOCKCHAIN_API_URI=http://localhost:3001/insight-api/ npm run serve
```

For testnet, create a directory ~/.bitcore-testnet. Then create the file
~/.bitcore-testnet/bitcore-node.json containing the following:
```
{
  "datadir": "/home/ryan/.bitcore-testnet/data",
  "network": "testnet",
  "port": 3002,
  "services": [
    "bitcoind",
    "db",
    "address",
    "web",
    "insight-api",
    "insight-ui"
  ]
}
```

Then run bitcore/Insight with this command:
```
bitcored -c ~/.bitcore-testnet
```

You can now access Insight at localhost:3002/insight.

You can run Datt in testnet with this command:
```
FULLNODE_NETWORK=testnet DATT_BLOCKCHAIN_API_URI=http://localhost:3002/insight-api/ npm run serve
```
