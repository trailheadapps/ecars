import webpush from 'web-push';
import { FastifyInstance } from 'fastify';
import RequestBodySchema from '../../schemas/webpush/requestBody.json';
import { RequestBodySchema as RequestBodySchemaInterface } from '../../types/webpush/requestBody';
import { Pool } from 'pg';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL;
const DATABASE_URL = process.env.DATABASE_URL;
const APPLICATION_URL = process.env.APPPLICATION_URL;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:'.concat(VAPID_EMAIL),
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

const client = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Dynamically create a car order confirmation PDF using information provided
 * by the customer's selected configuration and their Salesforce account data.
 * Then save that PDF to Salesforce and link it to the Lead record.
 */
export default async function (fastify: FastifyInstance, opts: any) {
    opts.schema = { body: RequestBodySchema };

    fastify.post<{
        Body: RequestBodySchemaInterface;
    }>('/', opts, async function (request) {
        try {
            const { log } = request;
            const { body: data } = request;

            log.info('Invoking WebPush...');

            const message = data.message;
            const leadRecordId = data.recordId;
            const setSubscription = data.setSubscription;

            const query =
                'SELECT lead_record_id, endpoint, keys_p256dh, keys_auth FROM ecars_subscriptions WHERE lead_record_id=$1 AND notification_sent=0';
            const update =
                'UPDATE ecars_subscriptions SET notification_sent=1 WHERE lead_record_id=$1';

            const result = await client.query(query, [leadRecordId]);
            if (result.rows.length > 0) {
                const subscription = {
                    endpoint: result.rows[0].endpoint,
                    keys: {
                        p256dh: result.rows[0].keys_p256dh,
                        auth: result.rows[0].keys_auth
                    }
                };

                const jsonMessage = {
                    title: 'Car Alert',
                    message,
                    url: APPLICATION_URL
                };

                const pushResult = await webpush.sendNotification(
                    subscription,
                    JSON.stringify(jsonMessage)
                );
                log.info(pushResult);

                if (setSubscription) {
                    await client.query(update);
                }
            }
            return JSON.stringify({ success: true });
        } catch (err) {
            return JSON.stringify({ error: err.message });
        }
    });
}
