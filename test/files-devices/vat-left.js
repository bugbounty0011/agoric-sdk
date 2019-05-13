const harden = require('@agoric/harden');

export default function setup(syscall, state, helpers) {
  const { log } = helpers;
  return helpers.makeLiveSlots(
    syscall,
    state,
    (E, D) =>
      harden({
        left5(d2) {
          log(`left5`);
          const ret = D(d2).method5('hello');
          log(`left5 did d2.method5, got ${ret}`);
          return 'done';
        },
        leftSharedTable(st) {
          log(`leftSharedTable`);
          log(`has key1= ${D(st).has('key1')}`);
          log(`got key1= ${D(st).get('key1')}`);
          log(`has key2= ${D(st).has('key2')}`);
        },
      }),
    helpers.vatID,
  );
}
