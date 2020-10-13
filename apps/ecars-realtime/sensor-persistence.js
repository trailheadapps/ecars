'use strict';

require('dotenv').config();

const useKafka = +process.env.USE_KAFKA == true;

if (!useKafka) {
    console.log('KAFKA is Disabled, please enable it with USE_KAFKA=1');
    process.exit(0);
}

const Writer = require('@ecars/events-persistence');
const writer = new Writer();

async function main() {
    await writer.start();
}

main().catch((err) => console.error(err));
