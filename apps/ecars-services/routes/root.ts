import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance, opts: any) {
    fastify.get('/', opts, async function (_request) {
        return { root: true };
    });
}
