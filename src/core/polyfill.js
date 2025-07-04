if (!String.prototype.includes) {
  String.prototype.includes = function (search, starting) {
    let start;
    if (typeof starting === "number") {
      start = starting;
    } else {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    }
    return this.indexOf(search, start) !== -1;
  };
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    value(searchElement, fromIndex) {
      // 1. Let O be ? ToObject(this value).
      if (this === null) {
        throw new TypeError("\"this\" is null or not defined");
      }

      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      const n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y
          || (typeof x === "number" && typeof y === "number" && isNaN(x)
            && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // A. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    },
  });
}

if (!Math.log10) {
  Math.log10 = Math.log10 || function (x) {
    return Math.log(x) * Math.LOG10E;
  };
}

if (!Math.log2) {
  Math.log2 = Math.log2 || function (x) {
    return Math.log(x) * Math.LOG2E;
  };
}

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArgu) {
    thisArg = thisArgu || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this === null) {
        throw new TypeError("\"this\" is null or not defined");
      }

      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.

      const thisArg = arguments[1];

      // 5. Let k be 0.
      let k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // A. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // E. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return;
    },
  });
}

Array.max = function (array) {
  return Math.max.apply(Math, array);
};

Array.min = function (array) {
  return Math.min.apply(Math, array);
};

Object.invert = function (obj) {
  const result = {};
  const keys = Object.keys(obj);
  for (let i = 0, length = keys.length; i < length; i++) {
    result[obj[keys[i]]] = keys[i];
  }
  return result;
};

if (typeof Object.assign !== "function") {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target) { // .length of function is 2
      if (target === null) { // TypeError if undefined or null
        throw new TypeError("Cannot convert undefined or null to object");
      }

      const to = Object(target);

      for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];

        if (nextSource !== null) { // Skip over if undefined or null
          for (const nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}
