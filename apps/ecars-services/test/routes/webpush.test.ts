import { test } from 'tap';
import { build } from '../helper';

test('pdf route', async (t) => {
    const app = build(t);

    const _res = await app.inject({
        url: '/webpush'
    });

    t.todo('Implement /webpush route test');
});
