import { AutobuyerState } from "./autobuyer";

export class RealityAutobuyerState extends AutobuyerState {
  get data() {
    return player.auto.reality;
  }

  get name() {
    return "Reality";
  }

  get isUnlocked() {
    return RealityUpgrade(25).isBought;
  }

  get canTick() {
    return super.canTick && !GlyphSelection.active;
  }

  get mode() {
    return this.data.mode;
  }

  set mode(value) {
    this.data.mode = value;
  }

  get rm() {
    return this.data.rm;
  }

  set rm(value) {
    this.data.rm = value;
  }

  get glyph() {
    return this.data.glyph;
  }

  set glyph(value) {
    this.data.glyph = value;
  }

  get time() {
    return this.data.time;
  }

  set time(value) {
    this.data.time = value;
  }

  get shard() {
    return this.data.shard;
  }

  // This only gets set via functions in AutobuyerInput.vue; we want to take advantage of auto-formatting when the input
  // is for a Decimal prop, but the actual value needs to be clamped to fit within a Number
  set shard(value) {
    this.data.shard = value.clamp(0, Number.MAX_VALUE).toNumber();
  }

  toggleMode() {
    this.mode = [
      AUTO_REALITY_MODE.RM,
      AUTO_REALITY_MODE.GLYPH,
      AUTO_REALITY_MODE.EITHER,
      AUTO_REALITY_MODE.BOTH,
      AUTO_REALITY_MODE.TIME,
      AUTO_REALITY_MODE.RELIC_SHARD,
    ]
      .nextSibling(this.mode);
  }

  bumpAmount(mult) {
    if (this.isUnlocked) {
      this.rm = this.rm.times(mult);
    }
  }

  tick() {
    // Checking if auto-reality should trigger immediately due to bad glyph options happens at a higher priority
    // than everything else, preempting other settings and only checking them if it fails
    // In order to reduce excessive computational load, this only ever gets checked once per reality unless filter
    // settings are changed (which causes it to check again); otherwise, glyph choices would be generated every tick
    const dontCheckModes = [
      AUTO_GLYPH_SCORE.LOWEST_SACRIFICE,
      AUTO_GLYPH_SCORE.LOWEST_ALCHEMY,
      AUTO_GLYPH_SCORE.ALCHEMY_VALUE,
    ];
    const shouldCheckFilter = EffarigUnlock.glyphFilter.isUnlocked
      && !player.reality.hasCheckedFilter
      && !dontCheckModes.includes(AutoGlyphProcessor.scoreMode);
    if (
      isRealityAvailable() && player.options.autoRealityForFilter
      && shouldCheckFilter
    ) {
      const gainedLevel = gainedGlyphLevel();
      const checkModes = [
        AUTO_REALITY_MODE.GLYPH,
        AUTO_REALITY_MODE.EITHER,
        AUTO_REALITY_MODE.BOTH,
      ];
      const levelToCheck = checkModes.includes(this.mode)
        ? {
            actualLevel: Decimal.min(this.glyph, Glyphs.levelCap),
            rawLevel: DC.D1,
          }
        : gainedLevel;
      const choices = GlyphSelection.glyphList(
        GlyphSelection.choiceCount,
        levelToCheck,
        { isChoosingGlyph: false },
      );
      const bestGlyph = AutoGlyphProcessor.pick(choices);
      player.reality.hasCheckedFilter = true;
      if (!AutoGlyphProcessor.wouldKeep(bestGlyph)) {
        autoReality();
        return;
      }
    }

    let proc = false;
    // The game generally displays amplified values, so we want to adjust the thresholds to
    // account for that and make the automation trigger based on the actual displayed values
    const ampFactor = simulatedRealityCount(false).add(1);
    const rmProc = MachineHandler.gainedRealityMachines.times(ampFactor).gte(
      this.rm,
    );
    const glyphProc = gainedGlyphLevel().actualLevel.gte(this.glyph);
    switch (this.mode) {
      case AUTO_REALITY_MODE.RM: {
        proc = rmProc;
        break;
      }
      case AUTO_REALITY_MODE.GLYPH: {
        proc = glyphProc;
        break;
      }
      case AUTO_REALITY_MODE.EITHER: {
        proc = rmProc || glyphProc;
        break;
      }
      case AUTO_REALITY_MODE.BOTH: {
        proc = rmProc && glyphProc;
        break;
      }
      case AUTO_REALITY_MODE.TIME: {
        proc = player.records.thisReality.realTime / 1000 > this.time;
        break;
      }
      case AUTO_REALITY_MODE.RELIC_SHARD: {
        proc = Effarig.shardsGained.mul(ampFactor).gt(this.shard);
        break;
      }
    }
    if (proc) {
      autoReality();
    }
  }
}
