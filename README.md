Datt
====
Datt is:
- A community with aligned incentives.
- A tool for managing content and payments.
- A decentralized reddit where karma is bitcoin.

----------------------

The below is a hypothetical example of what the interface to dattcore will look
like, but it has not been implemented yet.
```
var config = {rendezvous_server, db_name}

var dattcore = DattCore.create(config)

dattcore.init().then()

dattcore.on('error', function (err) {})

dattcore.on('payment', function (paymentInfo) {})

dattcore.on('comment', function (comment) {})

dattcore.on('comments', function (comments) {})

dattcore.on('log', function (logcomment) {})

dattcore.connections.on('connection', function (connection) {})

dattcore.connections.connect(info).then()

dattcore.db.getSize().then()

dattcore.walletapp.getBalance().then()

dattcore.walletapp.wallet.toObject().then()

dattcore.walletapp.wallet.fromObject(json).then()

dattcore.walletapp.on('tx', function (tx) {})

dattcore.walletapp.createtx({address, amount}).then()

dattcore.walletapp.signtx(tx).then()

dattcore.walletapp.verifytx(tx).then()

dattcore.walletapp.sendtx(tx).then()

dattcore.payComment(commentId).then()

dattcore.payUser(userId).then()

dattcore.authenticate(mnemonic).then()

dattcore.setFilter({channel: 'channelname'}).then()

dattcore.setFilter({minpayment: '0.0001 BTC'}).then()
```
