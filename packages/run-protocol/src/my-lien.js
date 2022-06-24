// @ts-check
import { AmountMath } from '@agoric/ertp';
import { E, Far } from '@endo/far';

const { details: X } = assert;

/**
 * per golang/cosmos/x/lien/lien.go
 *
 * @typedef { 'bonded' | 'liened' | 'locked' | 'total' | 'unbonding' } AccountProperty
 */
const XLien = /** @type { const } */ ({
  name: 'lien',
  LIEN_CHANGE_LIENED: 'LIEN_CHANGE_LIENED',
  LIEN_GET_ACCOUNT_STATE: 'LIEN_GET_ACCOUNT_STATE',
});

/**
 * @typedef { Record<AccountProperty, T> & { currentTime: bigint } } AccountState<T>
 * @template T
 */

/**
 * @param {ERef<BridgeManager>} bridgeManager
 * @param {Brand<'nat'>} stake
 * @param {string} [denom]
 * @returns {StakingAuthority}
 */
export const makeStakeReporter = (bridgeManager, stake, denom = 'ubld') => {
  const { make: makeAmt } = AmountMath;
  /** @param {string} numeral */
  const toStake = numeral => makeAmt(stake, BigInt(numeral));
  /**
   * @param {string} address
   * @param {bigint} delta
   * @returns {Promise<Amount<`nat`>>}
   */
  const changeLiened = async (address, delta) => {
    assert.typeof(address, 'string');
    const newAmount = await E(bridgeManager).toBridge(XLien.name, {
      type: XLien.LIEN_CHANGE_LIENED,
      address,
      denom,
      delta: `${delta}`,
    });
    return harden(toStake(newAmount));
  };

  /** @type {StakingAuthority} */
  const stakeReporter = Far('stakeReporter', {
    increaseLiened: async (address, increase) => {
      const amount = AmountMath.getValue(stake, increase);
      return changeLiened(address, amount);
    },
    decreaseLiened: async (address, decrease) => {
      const amount = AmountMath.getValue(stake, decrease);
      return changeLiened(address, -1n * amount);
    },
    getAccountState: async (address, wantedBrand) => {
      assert(
        wantedBrand === stake,
        X`Cannot getAccountState for ${wantedBrand}. Expected ${stake}.`,
      );
      /** @type { AccountState<string> } */
      const { currentTime, bonded, liened, locked, total, unbonding } = await E(
        bridgeManager,
      ).toBridge(XLien.name, {
        type: XLien.LIEN_GET_ACCOUNT_STATE,
        address,
        denom,
        amount: '0',
      });
      return harden({
        bonded: toStake(bonded),
        liened: toStake(liened),
        locked: toStake(locked),
        total: toStake(total),
        unbonding: toStake(unbonding),
        currentTime: BigInt(currentTime),
      });
    },
  });

  return stakeReporter;
};
