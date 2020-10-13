import { test } from 'tap';
import { build } from '../helper';

test('pdf route', async (t) => {
    const app = build(t);

    const _res = await app.inject({
        url: '/pdf'
    });

    t.todo('Implement /pdf route test');
});
