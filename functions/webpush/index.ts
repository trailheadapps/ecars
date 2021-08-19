import { InvocationEvent, Context, Logger } from 'sf-fx-sdk-nodejs';
import { Pool } from 'pg';
import * as webpush from 'web-push';

type FunctionOutput = {
    success: boolean;
    message?: string;
};

/**
 * A Function that sends a Web Push Notification to a Subscribed user
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: representative of the data associated with the occurrence of an event,
 * and supporting metadata about the source of that occurrence.
 * @param context: represents the connection to the the execution environment and the Customer 360 instance that
 * the function is associated with.
 * @param logger: represents the logging functionality to log given messages at various levels
 */
export default async function execute(
    event: InvocationEvent<any>,
    context: Context,
    logger: Logger
): Promise<FunctionOutput> {
    logger.info(
        `Invoking Webpush with payload ${JSON.stringify(event.data || {})}`
    );

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

    try {
        const message = event.data.message;
        const leadRecordId = event.data.recordId;
        const setSubscription = event.data.setSubscription;

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
            logger.info(pushResult);

            if (setSubscription) {
                await client.query(update);
            }
        }
        return { success: true };
    } catch (err) {
        logger.error(err);
        return { success: false, message: err.message };
    }
}
