<script>
export default {
  name: "AutobuyerInput",
  props: {
    autobuyer: {
      type: Object,
      required: true,
    },
    property: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isValid: true,
      isFocused: false,
      displayValue: "0",
    };
  },
  computed: {
    inputType() {
      return this.type === "int" ? "number" : "text";
    },
    typeFunctions() {
      const functions = AutobuyerInputFunctions[this.type];
      if (functions === undefined) {
        throw new Error("Unknown autobuyer input type");
      }
      return functions;
    },
    validityClass() {
      return this.isValid ? undefined : "o-autobuyer-input--invalid";
    },
  },
  methods: {
    update() {
      if (this.isFocused) {
        return;
      }
      this.updateActualValue();
    },
    updateActualValue() {
      const actualValue = this.autobuyer[this.property];
      if (this.areEqual(this.actualValue, actualValue)) {
        return;
      }
      this.actualValue = this.typeFunctions.copyValue(actualValue);
      this.updateDisplayValue();
    },
    areEqual(value, other) {
      if (other === undefined || value === undefined) {
        return false;
      }
      return this.typeFunctions.areEqual(value, other);
    },
    updateDisplayValue() {
      this.displayValue = this.typeFunctions.formatValue(this.actualValue);
    },
    handleInput(event) {
      const input = event.target.value;
      this.displayValue = input;
      if (input.length === 0) {
        this.isValid = false;
        return;
      }
      const parsedValue = this.typeFunctions.tryParse(input);
      this.isValid = parsedValue !== undefined;
      this.actualValue = this.typeFunctions.copyValue(parsedValue);
    },
    handleFocus() {
      this.isFocused = true;
    },
    handleChange(event) {
      if (this.displayValue === "69") {
        SecretAchievement(28).unlock();
      }
      if (this.isValid) {
        // eslint-disable-next-line vue/no-mutating-props
        this.autobuyer[this.property] = this.typeFunctions.copyValue(this.actualValue);
      } else {
        this.updateActualValue();
      }
      this.updateDisplayValue();
      this.isValid = true;
      this.isFocused = false;
      event.target.blur();
    },
  },
};

export const AutobuyerInputFunctions = {
  decimal: {
    areEqual: (value, other) => Decimal.eq(value, other),
    formatValue: value => Notation.scientific.format(value, 2, 2),
    copyValue: value => new Decimal(value),
    tryParse: (input) => {
      if (!input) {
        return;
      }
      try {
        let decimal;
        if (/^e\d*[.]?\d+$/u.test(input.replaceAll(",", ""))) {
          // Logarithm Notation
          decimal = Decimal.pow10(parseFloat(input.replaceAll(",", "").slice(1)));
        } else {
          // Scientific notation; internals of break-eternity will gladly strip extraneous letters before parsing, but
          // since this is largely uncommunicated to the user, we instead explicitly check for formatting and reject
          // anything that doesn't fit as invalid

          // I am lazy so we are going down the "abuse this fact and not write code" path
          decimal = Decimal.fromString(input.replaceAll(",", ""));
        }
        return isNaN(decimal.mag) || isNaN(decimal.layer) || isNaN(decimal.sign) ? undefined : decimal;
      } catch {
        return;
      }
    },
  },
  float: {
    areEqual: (value, other) => value === other,
    formatValue: value => value.toString(),
    copyValue: value => value,
    tryParse: (input) => {
      const float = parseFloat(input);
      return isNaN(float) ? undefined : float;
    },
  },
  int: {
    areEqual: (value, other) => value === other,
    formatValue: value => value.toString(),
    copyValue: value => value,
    tryParse: (input) => {
      if (!input) {
        return;
      }
      // We explicitly check formatting here instead of letting parseInt handle the whole thing because otherwise the
      // fact that parseInt removes extraneous letters means junk like "361ebqv3" registers as valid and parses as 361
      if (!/^\d+$/u.test(input.replaceAll(",", ""))) {
        return;
      }
      const int = parseInt(input, 10);
      return isNaN(int) || !Number.isInteger(int) ? undefined : int;
    },
  },
};
</script>

<template>
  <input
    :value="displayValue"
    :class="validityClass"
    :type="inputType"
    class="o-autobuyer-input"
    @change="handleChange"
    @focus="handleFocus"
    @input="handleInput"
  >
</template>

<style scoped>
.o-autobuyer-input--invalid {
  background-color: var(--color-bad);
}

.s-base--dark .o-autobuyer-input--invalid,
.t-s1 .o-autobuyer-input--invalid {
  background-color: var(--color-bad);
}
</style>
