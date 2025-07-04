import { isNumber } from "../../utility/type-check";
import { GameMechanicState } from "./game-mechanic";

/**
 * @abstract
 */
export class RebuyableMechanicState extends GameMechanicState {
  /**
   * @abstract
   */
  get currency() {
    throw new NotImplementedError();
  }

  get isAffordable() {
    return this.currency.gte(this.cost);
  }

  get cost() {
    return this.config.cost();
  }

  get isAvailableForPurchase() {
    return true;
  }

  get isCapped() {
    return false;
  }

  get isRebuyable() {
    return true;
  }

  /**
   * @abstract
   */
  get boughtAmount() {
    throw new NotImplementedError();
  }

  /**
   * @abstract
   */
  set boughtAmount(value) {
    throw new NotImplementedError();
  }

  get isEffectActive() {
    return isNumber(this.boughtAmount)
      ? this.boughtAmount > 0
      : this.boughtAmount.gt(0);
  }

  get canBeBought() {
    return this.isAffordable && this.isAvailableForPurchase && !this.isCapped;
  }

  purchase() {
    if (!this.canBeBought) {
      return false;
    }
    if (GameEnd.creditsEverClosed) {
      return false;
    }
    this.currency.subtract(this.cost);
    this.boughtAmount = isNumber(this.boughtAmount)
      ? this.boughtAmount + 1
      : this.boughtAmount.add(1);
    this.onPurchased();
    GameUI.update();
    return true;
  }

  onPurchased() {}
}
