# Installing Pre reqs for the Explorer

## MongoDB

Detailed directions at: 
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

Also available as a script `mongodb.sh`. Run it as `bash +x mongodb.sh`

### Creating the Database & user

```
$ mongo
```

Once in Mongo sheel

```
use blockchain

db.createUser( { user: "blockmaster", pwd: "Str0ngP#ssword5", roles: [ "readWrite" ] } )

db.createCollection("blocks")
db.createCollection("txs")
db.createCollection("addresses")
db.createCollection("ios")

db.blocks.createIndex({ height: 1 }, { unique: true, background: true })
db.blocks.createIndex({ hash: 1 }, { unique: true, background: true })

db.txs.createIndex({ txid: 1 }, { unique: true, background: true })
db.txs.createIndex({ "vin.txid": 1 }, { background: true })
db.txs.createIndex({ time: 1 }, { background: true })
db.txs.createIndex({ "vout.scriptPubKey.addresses": 1 }, { background: true })
db.txs.createIndex({ "vout.scriptPubKey.type": 1 }, { background: true })
db.txs.createIndex({ blockhash: 1 }, { background: true })

db.addresses.createIndex({ address: 1 }, { unique: true, background: true })
db.addresses.createIndex({ balance: 1 }, { background: true, collation: { locale: "en_US", numericOrdering: true }})

db.ios.createIndex({ txid: 1 }, { background: true })
db.ios.createIndex({ address: 1 }, { background: true })
db.ios.createIndex({ type: 1 }, { background: true })
db.ios.createIndex({ time: 1 }, { background: true })
db.ios.createIndex({ time: -1, type: -1 }, { background: true })
```

## NodeJS
