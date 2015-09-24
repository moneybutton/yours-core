Datt
====
Datt is a community with aligned incentives. This application will let you
connect to the datt p2p network and view and post content and pay and be paid
in bitcoin.

----------------------

The below is a hypothetical example of what the interface to dattnode will look
like, but it has not been implemented yet.
```
var config = {rendezvous_server, db_name}

var dattnode = DattNode.create(config)

dattnode.init().then()

dattnode.on('error', function (err) {})

dattnode.on('payment', function (paymentInfo) {})

dattnode.on('comment', function (comment) {})

dattnode.on('comments', function (comments) {})

dattnode.on('log', function (logcomment) {})

dattnode.connections.on('connection', function (connection) {})

dattnode.connections.connect(info).then()

dattnode.db.getSize().then()

dattnode.walletapp.getBalance().then()

dattnode.walletapp.wallet.toObject().then()

dattnode.walletapp.wallet.fromObject(json).then()

dattnode.walletapp.on('tx', function (tx) {})

dattnode.walletapp.createtx({address, amount}).then()

dattnode.walletapp.signtx(tx).then()

dattnode.walletapp.verifytx(tx).then()

dattnode.walletapp.sendtx(tx).then()

dattnode.payComment(commentId).then()

dattnode.payUser(userId).then()

dattnode.authenticate(mnemonic).then()

dattnode.setFilter({channel: 'channelname'}).then()

dattnode.setFilter({minpayment: '0.0001 BTC'}).then()
```
