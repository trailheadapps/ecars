require('dotenv').config();

import AutoLoad from '@fastify/autoload';
import * as path from 'path';
import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';

export default async function (fastify: FastifyInstance, opts: any) {
    // Use generally accepted good defaults for HTTP headers
    fastify.register(helmet);

    // Do not touch the following lines

    // This loads all plugins defined in routes
    // define your routes in one of these
    fastify.register(AutoLoad, {
        dir: path.join(__dirname, 'routes'),
        options: opts
    });
}
