import { createRequire } from 'module';
const require = createRequire(import.meta.url);

require('dotenv').config();
const pg = require('pg');

const client = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client
    .query(
        `CREATE TABLE "public"."ecars_subscriptions" (
        "id" serial,
        "lead_record_id" text,
        "endpoint" text,
        "keys_p256dh" text,
        "keys_auth" text,
        "notification_sent" smallint,
        PRIMARY KEY ("id"),
        UNIQUE ("lead_record_id")
    )`
    )
    .then(() => {
        console.log('Database table created');
    })
    .catch(() => {})
    .finally(() => {
        process.exit(0);
    });
