import test from 'ava';
import configure from './configure.mjs';

function setupData() {
    const data = {
        configuration: {
            key1: 2,
            key2: 3,
        },
        otherOptions: true,
    };
    return { data };
}

test('fails on invalid params', (t) => {
    t.throws(() => configure(undefined, 'notAnObject'), /must be an object/);
    const { data } = setupData();
    t.throws(
        () => configure(data, { otherKey: 2, wrongKey: 2 }),
        /configuration option\(s\) otherKey, wrongKey/,
    );
});

test('updates config', (t) => {
    const { data } = setupData();
    const result = configure(data, { key1: 4 });
    const expectation = setupData().data;
    expectation.configuration.key1 = 4;
    t.deepEqual(result, expectation);
});

test('does not alter original data', (t) => {
    const { data } = setupData();
    configure(data, { key1: 4 });
    t.deepEqual(data, setupData().data);
});
