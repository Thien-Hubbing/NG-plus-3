import { isDecimal } from "../../utility/type-check";

import { DC } from "../constants";

export const Effects = {
  /**
   * @param effectSources
   * @returns {Decimal}
   */
  sum(...effectSources) {
    let result = DC.D0;
    applyEffectsOf(effectSources, v => result = result.add(v));
    return result;
  },
  /**
   * @param effectSources
   * @returns {Number}
   */
  nSum(...effectSources) {
    let result = 0;
    applyEffectsOf(effectSources, v => result += v);
    return result;
  },
  /**
   * @param effectSources
   * @returns {Decimal}
   */
  product(...effectSources) {
    let result = DC.D1;
    applyEffectsOf(effectSources, v => result = result.times(v));
    return result;
  },
  /**
   * @param {Number | Decimal} defaultValue
   * @param effectSources
   * @returns {Decimal}
   */
  last(defaultValue, ...effectSources) {
    if (!isDecimal(defaultValue)) {
      defaultValue = new Decimal(defaultValue);
    }
    let result = defaultValue;
    let foundLast = false;
    const reversedSources = effectSources
      .filter(s => s !== null && s !== undefined)
      .reverse();
    const reducer = (v) => {
      result = v;
      foundLast = true;
    };
    for (const effectSource of reversedSources) {
      effectSource.applyEffect(reducer);
      if (foundLast) {
        break;
      }
    }
    return result;
  },
  /**
   * @param {Number | Decimal} defaultValue
   * @param effectSources
   * @returns {Decimal}
   */
  max(defaultValue, ...effectSources) {
    if (!isDecimal(defaultValue)) {
      defaultValue = new Decimal(defaultValue);
    }
    let result = defaultValue;
    applyEffectsOf(effectSources, v => result = Decimal.max(result, v));
    return result;
  },
  /**
   * @param {Number} defaultValue
   * @param effectSources
   * @returns {Number}
   */
  nMax(defaultValue, ...effectSources) {
    let result = defaultValue;
    applyEffectsOf(effectSources, v => result = Math.max(result, v));
    return result;
  },
  /**
   * @param {Number | Decimal} defaultValue
   * @param effectSources
   * @returns {Decimal}
   */
  min(defaultValue, ...effectSources) {
    if (!isDecimal(defaultValue)) {
      defaultValue = new Decimal(defaultValue);
    }
    let result = defaultValue;
    applyEffectsOf(effectSources, v => result = Decimal.min(result, v));
    return result;
  },
  /**
   * @param {Number} defaultValue
   * @param effectSources
   * @returns {Number}
   */
  nMin(defaultValue, ...effectSources) {
    let result = defaultValue;
    applyEffectsOf(effectSources, v => result = Math.min(result, v));
    return result;
  },
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.plusEffectOf = function (effectSource) {
  let result = this;
  effectSource.applyEffect(v => result = result.plus(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.plusEffectsOf = function (...effectSources) {
  let result = this;
  applyEffectsOf(effectSources, v => result = result.plus(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.minusEffectOf = function (effectSource) {
  let result = this;
  effectSource.applyEffect(v => result = result.minus(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.minusEffectsOf = function (...effectSources) {
  let result = this;
  applyEffectsOf(effectSources, v => result = result.minus(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.timesEffectOf = function (effectSource) {
  let result = this;
  effectSource.applyEffect(v => result = result.times(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.timesEffectsOf = function (...effectSources) {
  // Normalize is expensive; when we multiply many things together, it's faster
  // to get a big mantissa and then fix it at the end.

  let result = this;
  applyEffectsOf(effectSources, v => result = result.times(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.dividedByEffectOf = function (effectSource) {
  let result = this;
  effectSource.applyEffect(v => result = result.dividedBy(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.dividedByEffectsOf = function (...effectSources) {
  let result = this;
  applyEffectsOf(effectSources, v => result = result.dividedBy(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.powEffectOf = function (effectSource) {
  let result = this;
  effectSource.applyEffect(v => result = result.pow(v));
  return result;
};

/**
 * @returns {Decimal}
 */
Decimal.prototype.powEffectsOf = function (...effectSources) {
  let result = this;
  applyEffectsOf(effectSources, v => result = result.pow(v));
  return result;
};

function applyEffectsOf(effectSources, applyFn) {
  for (const effectSource of effectSources) {
    if (effectSource !== null && effectSource !== undefined) {
      effectSource.applyEffect(applyFn);
    }
  }
}
