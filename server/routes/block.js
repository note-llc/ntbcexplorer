const Router = require('koa-router');
const router = new Router();

router.get('/:hash', async (ctx) => {
    try {
        const { blockchain, collections: { blocks }, rpc, errors } = ctx.locals;

        const hash = ctx.params.hash;

        if (!blockchain.isHash(hash)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_hash };
            return false;
        }

        const { result: block, error } = await rpc.getBlock([hash]);

        if (error) {
            ctx.status = 404;
            ctx.body = { error: error.message };
            return false;
        }

        const nextBlock = await blocks.findOne({ hash: block.nextblockhash });

        if (nextBlock == null) delete block.nextblockhash;

        ctx.body = { data: block };
    } catch (error) {
        if (error.data.error.code && error.data.error.message) {
            if (error.data.error.code == -5) {
                ctx.throw(404, error.data.error.message);
            } else {
                ctx.throw(error.status, error.data.error.message);
            }
        } else {
            ctx.throw(500);
        }
    }
});

router.get('/txs/:hash/:skip/:limit', async (ctx) => {
    try {
        const { blockchain, collections: { blocks, txs }, errors, config: { limits: { block: allowedLimit } } } = ctx.locals;

        const hash = ctx.params.hash;
        let skip = ctx.params.skip;
        let limit = ctx.params.limit;

        if (!blockchain.isHash(hash)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_hash };
            return false;
        }

        if (!blockchain.isInt(skip) && !blockchain.isInt(limit)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        skip = Number(skip);
        limit = Number(limit);

        limit = (limit >= 1 && limit <= allowedLimit) ? limit : allowedLimit;

        const block = await blocks.findOne({ hash });

        if (!block) {
            ctx.status = 404;
            ctx.body = { error: errors.block_not_found };
            return false;
        }

        const txids = block.tx;

        let [total, transactions] = await Promise.all([
            txs.find({ txid: { $in: txids } }).count(),
            txs
                .find({ txid: { $in: txids } })
                .project({ _id: 0 })
                .sort({ time: -1 })
                .skip(skip)
                .limit(limit)
                .toArray()
        ]);

        transactions = blockchain.setVoutsSum(transactions);

        ctx.body = { data: transactions, total };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
