import type Decimal from "break_eternity.js";
import { Notation } from "./notation";
import { formatNumber } from "./utils";

function expFormat(value: Decimal, places: number, mantissa: boolean): string {
  const e = value.log10().floor();
  const m = value.div(e.pow10());

  let eText = "";
  if (e.gte(1e9)) {
    // `expFormat` and `format` are defined cyclically, so there's no way to get around it
    eText = format(e, places);
  } else if (e.gte(10000)) {
    eText = formatNumber(e.toNumber(), 99, true);
  } else {
    eText = e.toStringWithDecimalPlaces(0);
  }

  if (mantissa) return `${m.toStringWithDecimalPlaces(places)}e${eText}`;
  return `e${eText}`;
}

function format(value: Decimal, places: number): string {
  if (value.isNan()) return "NaN";
  if (!value.isFinite()) return `${value.sign === -1 ? "-" : ""}Infinity`;
  if (value.sign === -1) return `-${format(value.neg(), places)}`;

  if (value.gte("eeee1000")) {
    const slog = value.slog();
    const floor = slog.floor();

    const mant = slog.sub(floor).pow10()
      .toStringWithDecimalPlaces(places);
    return `${mant}F${formatNumber(floor.toNumber(), slog.gte(1e9) ? places : 99, true)}`;
  }
  if (value.gte("1e1000000")) return expFormat(value, places, false);
  if (value.gte(1e9)) return expFormat(value, places, true);
  return formatNumber(value.toNumber(), places, true);
}

export class SimpleExtendedScientificNotation extends Notation {
  public get name(): string {
    return "Simple Extended Scientific";
  }

  public get isSlog(): boolean {
    // Why does this even exist
    return false;
  }

  public formatLDecimal(value: Decimal, places: number): string {
    return format(value, places);
  }
}
