// This file contains code that we reuse
// between our tests.
import Fastify from 'fastify';
import fp from 'fastify-plugin';
import App from '../app';
import { Test } from 'tap';

// Fill in this config with all the configurations
// needed for testing the application
function config() {
    // Required testing env variables for WebPush function
    process.env.VAPID_PUBLIC_KEY =
        'BE4z1b48NhVmKl8C3hAHTmOVi9_kW2ECyWa4EXd4zGG2ngJejhEO2rZ9kFW7kw9_6DKqVSC3O-ifrdm77vPyCaI';
    process.env.VAPID_PRIVATE_KEY =
        '4v4KtaYl75i53B50L-PXcW82JRPUJYYCSNzx_7TkSds';
    process.env.VAPID_EMAIL = 'test@dummy.org';
    process.env.DATABASE_URL = 'test';
    process.env.APPPLICATION_URL = 'test';
    return {};
}

// automatically build and tear down our instance
function build(t: Test) {
    const app = Fastify();

    // fastify-plugin ensures that all decorators
    // are exposed for testing purposes, this is
    // different from the production setup
    app.register(fp(App), config());

    // tear down our app after we are done
    t.tearDown(app.close.bind(app));

    return app;
}

export { config, build };
