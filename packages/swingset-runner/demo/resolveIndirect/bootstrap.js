import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';

console.log(`=> loading bootstrap.js`);

export function buildRootObject() {
  return Far('root', {
    bootstrap(vats) {
      const pa = E(vats.bob).genPromise1();
      E(vats.bob).genPromise2();
      E(vats.bob).usePromise([pa]);
    },
  });
}
