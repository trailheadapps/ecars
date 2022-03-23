import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const logger = require('pino')({ prettyPrint: { colorize: true } });
const webpush = require('web-push');
const jsforce = require('jsforce');
const { Pool } = require('pg');

require('dotenv').config();

const email = process.env.VAPID_EMAIL;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const connectionString = process.env.DATABASE_URL;

const client = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

/*
WARNING: This demo uses for simplifcation username/password authentication.

For a real-live implementation you should use the JWT Bearer Flow.
*/
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;
const SF_TOKEN = process.env.SF_TOKEN;
const SF_LOGIN_URL = process.env.SF_LOGIN_URL;

const conn = new jsforce.Connection({
    loginUrl: SF_LOGIN_URL
});

// eslint-disable-next-line no-unused-vars
conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN, (err, res) => {
    if (err) {
        logger.error(err);
    }
});

if(vapidPublicKey && vapidPrivateKey){
    webpush.setVapidDetails(`mailto:${email}`, vapidPublicKey, vapidPrivateKey);
}

function getPublicKey(req, res) {
    // req.log.info('getting public key');
    res.send({ key: vapidPublicKey });
}

async function getCarConfig(req, res){
    const result = await conn.apex.get("/CarConfig/"+req.query.modelName);
    res.send(JSON.parse(result));
}

async function createSubscription(req, res, next) {
    const graph = constructGraph(req.body);
    try {
        const resp = await conn.requestPost(
            '/services/data/v54.0/composite/graph',
            graph
        );
        // Note, we only expect one graph in the response for the purpose of this
        // demo, so we're accessing it directly via [0].
        if (!resp.graphs[0].isSuccessful) {
            req.log.error('Composite API request failed');
            req.log.error(resp.graphs[0]);
            throw new Error('Composite API request failed');
        }

        const leadId =
            resp.graphs[0].graphResponse.compositeResponse[0].body.id;
        await client.query(
            'INSERT INTO ecars_subscriptions(lead_record_id, endpoint, keys_p256dh, keys_auth, notification_sent) VALUES($1,$2,$3,$4,$5)',
            [
                leadId,
                req.body.subscription.endpoint,
                req.body.subscription.keys.p256dh,
                req.body.subscription.keys.auth,
                0
            ]
        );
        req.log.info(`Subscription created, lead id: ${leadId}`);
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
}

async function deleteSubscription(req, res, next) {
    const subscription = req.body;
    try {
        await client.query(
            'DELETE FROM ecars_subscriptions WHERE endpoint=$1',
            [subscription.endpoint]
        );
        req.log.info(`Subscription deleted`, subscription);
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
}

async function push(req, res, next) {
    try {
        const result = await client.query(
            'SELECT lead_record_id, endpoint, keys_p256dh, keys_auth FROM ecars_subscriptions'
        );
        const subscriptions = result.rows;

        const pushTasks = subscriptions.map((subscription) => {
            req.log.debug('---- subscription');
            req.log.debug(subscription);
            return webpush.sendNotification(subscription);
        });
        await Promise.all(pushTasks);
        req.log.info('notification sent');
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
}

function constructGraph(data) {
    const { car, lead } = data;
    return {
        graphs: [
            {
                graphId: 'carConfigurationGraph',
                compositeRequest: [
                    {
                        method: 'POST',
                        url: '/services/data/v54.0/sobjects/Lead/',
                        referenceId: 'Lead1',
                        body: lead
                    },
                    {
                        method: 'POST',
                        url: '/services/data/v54.0/sobjects/Car_Configuration__c',
                        referenceId: 'CarConfiguration1',
                        body: {
                            Lead__c: '@{Lead1.id}',
                            Car__c: car.modelId,
                            Selected_Exterior_Color__c: car.exteriorColor,
                            Selected_Interior_Color__c: car.interiorColor,
                            Selected_Range__c: car.range
                        }
                    }
                ]
            }
        ]
    };
}

export {
    getPublicKey,
    createSubscription,
    deleteSubscription,
    push,
    getCarConfig
};
