<script>
export default {
  name: "ReplicantiGainText",
  data() {
    return {
      remainingTimeText: "",
      galaxyText: "",
    };
  },
  methods: {
    update() {
      const updateRateMs = player.options.updateRate;
      const ticksPerSecond = 1000 / updateRateMs;
      const logGainFactorPerTick = Decimal.divide(Replicanti.chance.add(1).ln()
        .mul(getGameSpeedupForDisplay().mul(updateRateMs)), getReplicantiInterval());
      const log10GainFactorPerTick = logGainFactorPerTick.dividedBy(Math.LN10);

      // The uncapped factor is needed for galaxy speed calculations
      const log10GainFactorPerTickUncapped = Decimal.divide(Replicanti.chance.add(1).ln()
        .mul(getGameSpeedupForDisplay().mul(updateRateMs)), getReplicantiInterval(false)).dividedBy(Math.LN10);

      const replicantiAmount = Replicanti.amount;
      const isAbove308 = Replicanti.isUncapped && replicantiAmount.max(1).log10().gt(DLOG10_MAXNUM);

      if (isAbove308) {
        const postScale = Decimal.log10(ReplicantiGrowth.scaleFactor).div(ReplicantiGrowth.scaleLog10);
        const gainFactorPerSecond = logGainFactorPerTick.times(postScale).plus(1)
          .pow((postScale).recip().mul(ticksPerSecond));
        // The calculations to estimate time to next milestone of OoM based on game state, assumes that uncapped
        // replicanti growth scales as time^1/postScale, which turns out to be a reasonable approximation.
        const milestoneStep = Pelle.isDoomed ? 100 : 1000;
        const nextMilestone = replicantiAmount.max(1).log10().div(milestoneStep).add(1).floor().mul(milestoneStep).pow10();
        const coeff = Decimal.divide(updateRateMs / 1000, logGainFactorPerTick.times(postScale));
        const timeToThousand = coeff.times(nextMilestone.divide(replicantiAmount).pow(postScale).minus(1));
        // The calculation seems to choke and return zero if the time is too large, probably because of rounding issues
        const timeEstimateText = timeToThousand.eq(0)
          ? "an extremely long time"
          : `${TimeSpan.fromSeconds(timeToThousand)}`;
        this.remainingTimeText = `You are gaining ${formatX(gainFactorPerSecond, 2, 1)} Replicanti per second`
          + ` (${timeEstimateText} until ${format(nextMilestone)})`;
      } else {
        this.remainingTimeText = "";
      }

      const totalTime = DLOG10_MAXNUM.div(log10GainFactorPerTick.times(ticksPerSecond));
      let remainingTime = DLOG10_MAXNUM.sub(replicantiAmount.max(1).log10())
        .div(log10GainFactorPerTick.times(ticksPerSecond));
      if (remainingTime.lt(0)) {
        // If the cap is raised via Effarig Infinity but the player doesn't have TS192, this will be a negative number
        remainingTime = new Decimal();
      }

      const galaxiesPerSecond = log10GainFactorPerTickUncapped.times(new Decimal(ticksPerSecond).div(DLOG10_MAXNUM));
      const timeFromZeroRG = galaxies => galaxies.add(49.5).div(49.5).ln().mul(50);
      let baseGalaxiesPerSecond, effectiveMaxRG, effectiveCurrentRG;
      if (RealityUpgrade(6).isBought && !Pelle.isDoomed) {
        baseGalaxiesPerSecond = galaxiesPerSecond.divide(RealityUpgrade(6).effectValue);
        effectiveMaxRG = timeFromZeroRG(Replicanti.galaxies.max.add(Replicanti.galaxies.extra))
          .sub(timeFromZeroRG(Replicanti.galaxies.extra));
        effectiveCurrentRG = timeFromZeroRG(Replicanti.galaxies.bought.add(Replicanti.galaxies.extra))
          .sub(timeFromZeroRG(Replicanti.galaxies.extra));
      } else {
        baseGalaxiesPerSecond = galaxiesPerSecond;
        effectiveMaxRG = Replicanti.galaxies.max;
        effectiveCurrentRG = Replicanti.galaxies.bought;
      }
      const secondsPerGalaxy = galaxiesPerSecond.reciprocal();

      if (this.remainingTimeText === "") {
        if (remainingTime.eq(0)) {
          this.remainingTimeText = `At Infinite Replicanti (normally takes
            ${TimeSpan.fromSeconds(secondsPerGalaxy)})`;
        } else if (replicantiAmount.lt(100)) {
          // Because of discrete replication, we add "Approximately" at very low amounts
          this.remainingTimeText = `Approximately ${TimeSpan.fromSeconds(remainingTime)} remaining
            until Infinite Replicanti`;
        } else {
          this.remainingTimeText = `${TimeSpan.fromSeconds(remainingTime)} remaining until Infinite Replicanti`;
        }
      }

      // If the player can get RG, this text is redundant with text below. It denotes total time from 1 to e308
      if (Replicanti.galaxies.max === 0 && !isAbove308) {
        this.remainingTimeText += ` (${TimeSpan.fromSeconds(new Decimal(totalTime))} total)`;
      }

      if (Replicanti.galaxies.max.gt(0)) {
        // If the player has max RGs, don't display the "You are gaining blah" text
        if (player.replicanti.galaxies.eq(Replicanti.galaxies.max)) {
          this.galaxyText = "You have reached the maximum amount of Replicanti Galaxies";
        } else {
          this.galaxyText = `You are gaining a Replicanti Galaxy every
            ${TimeSpan.fromSeconds(secondsPerGalaxy)}`;
          if (galaxiesPerSecond.gte(1)) {
            this.galaxyText = `You are gaining ${quantify("Replicanti Galaxy", galaxiesPerSecond, 2, 1)} per second`;
          }
          // Take the total time from zero replicanti to max RG + e308 replicanti and then subtract away the time which
          // has already elapsed. The time elapsed is calculated from your current RG total (including the current one)
          // and then subtracts away the time spent in the current RG so far.
          const allGalaxyTime = Decimal.divide(effectiveMaxRG.sub(effectiveCurrentRG), baseGalaxiesPerSecond);

          // Pending galaxy gain is here because the growth slows down significantly after
          // 1e308 normally. However, the seconds per galaxy code is calculated as if
          // uncapped since nobody would wait for 1e52345325 replicanti to buy an RG.
          // To solve this problem, after 1e308, it uses the pending value as the basis of
          // how ""close"" you are to the next galaxy instead of replicanti amount,
          // which is a good enough best case approximation in my opinion.
          // Note: This pending case ignores Reality Upgrade 6 but it's not really accurate anyway
          // (basically assumes you'll get all your possible RGs now) so that's probably fine.
          const pending = Replicanti.galaxies.gain;
          let pendingTime = pending.mul(secondsPerGalaxy);
          // If popular music is unlocked add the divide amount
          if (Achievement(126).isUnlocked && !Pelle.isDoomed) {
            const leftPercentAfterGalaxy = replicantiAmount.max(1).log10().div(LOG10_MAX_VALUE).sub(pending);
            pendingTime = pendingTime.add(secondsPerGalaxy.times(leftPercentAfterGalaxy));
          }
          const thisGalaxyTime = pending.gt(0) ? pendingTime : secondsPerGalaxy.sub(remainingTime);
          this.galaxyText += ` (all Replicanti Galaxies within
            ${TimeSpan.fromSeconds(allGalaxyTime.sub(thisGalaxyTime).clampMin(0))})`;
        }
      } else {
        this.galaxyText = "";
      }
    },
  },
};
</script>

<template>
  <p>{{ remainingTimeText }}<br>{{ galaxyText }}</p>
</template>

<style scoped>

</style>
