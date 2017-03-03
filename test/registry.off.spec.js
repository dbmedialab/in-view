import test from 'ava';
import Registry from '../src/registry';

test('Registry.off unregisters given handler for event', t => {

    let registry = Registry([]);

    const enterHandler1 = () => {};
    const enterHandler2 = () => {};

    registry.on('enter', enterHandler1);
    registry.on('enter', enterHandler2);
    t.true(registry.handlers.enter.length === 2);

    registry.off('enter', enterHandler1);
    t.true(registry.handlers.enter.length === 1);

    registry.off('enter', enterHandler2);
    t.true(registry.handlers.enter.length === 0);

});

test('Registry.off returns the registry', t => {
    let registry = Registry([]);
    t.deepEqual(registry.off('enter', () => {}), registry);
});
