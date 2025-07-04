import { IntervaledAutobuyerState } from "./autobuyer";

export class TimeDimensionAutobuyerState extends IntervaledAutobuyerState {
  get tier() {
    return this.id;
  }

  get name() {
    return TimeDimension(this.tier).shortDisplayName;
  }

  get fullName() {
    return `${this.name} Time Dimension`;
  }

  get data() {
    return player.auto.timeDims.all[this.tier - 1];
  }

  get interval() {
    return 50;
  }

  get isUnlocked() {
    return Achievement(147).isUnlocked;
  }

  get resetTickOn() {
    return PRESTIGE_EVENT.REALITY;
  }

  get hasUnlimitedBulk() {
    return true;
  }

  tick() {
    // We specifically call these two things before actually running the TD autobuyer code because that behavior
    // is desirable to gameplay, but simply reordering the autobuyers overall has undesired side-effects. There
    // are checks internal to these calls which ensure that they don't trigger even when still locked
    applyEU2();
    Autobuyer.epMult.tick();

    const tier = this.tier;
    if (!TimeDimension(tier).isAvailableForPurchase) {
      return;
    }
    super.tick();
    buyMaxTimeDimension(tier, 1, true);
  }

  static get entryCount() {
    return 8;
  }

  static get autobuyerGroupName() {
    return "Time Dimension";
  }

  static get isActive() {
    return player.auto.timeDims.isActive;
  }

  static set isActive(value) {
    player.auto.timeDims.isActive = value;
  }
}
