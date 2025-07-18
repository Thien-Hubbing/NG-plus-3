export const DeltaTimeState = {
  deltaTime: new TimeSpan(new Decimal(0)),
  realDeltaTime: new TimeSpan(new Decimal(0)),
  trueDeltaTime: new TimeSpan(new Decimal(0)),
  update(trueDeltaTime, deltaTime, gameDeltaTime) {
    this.trueDeltaTime = TimeSpan.fromMilliseconds(new Decimal(trueDeltaTime));
    this.realDeltaTime = TimeSpan.fromMilliseconds(deltaTime);
    this.deltaTime = TimeSpan.fromMilliseconds(gameDeltaTime);
  },
};

export const Time = {
  /**
   * @param {Function} getValue
   * @returns {TimeSpan}
   */
  fromMilliseconds(getValue) {
    return TimeSpan.fromMilliseconds(getValue());
  },
  /**
   * @param {TimeSpan} timespan
   * @param {Function} setValue
   */
  toMilliseconds(timespan, setValue) {
    Guard.isTimeSpan(timespan);
    setValue(timespan.totalMilliseconds);
  },
  /**
   * Returns a string indicating the current date and time of day, as indicated by a Date.now() timestamp. After
   * regex formatting, this gives a string resembling "[month] [day] [year] HH:MM:SS"
   * @param {number} timestamp
   * @returns {string}
   */
  toDateTimeString(timestamp) {
    return new Date(timestamp).toString().replace(/^.{4}(.*:..:..).*$/u, "$1");
  },

  /**
   * Frame delta time
   * @returns {TimeSpan}
   */
  get deltaTimeFull() {
    return DeltaTimeState.deltaTime;
  },
  /**
   * Frame delta time in seconds
   * @returns {number}
   */
  get deltaTime() {
    return this.deltaTimeFull.totalSeconds;
  },
  /**
   * Frame delta time in ms
   * @returns {number}
   */
  get deltaTimeMs() {
    return this.deltaTimeFull.totalMilliseconds;
  },
  /**
   * Frame delta time, but without any game speed effects
   * @returns {TimeSpan}
   */
  get realDeltaTime() {
    return DeltaTimeState.realDeltaTime;
  },

  /**
   * Frame delta time, but without any effects
   * @returns {TimeSpan}
   */
  get trueDeltaTime() {
    return DeltaTimeState.trueDeltaTime;
  },

  /**
   * @returns {TimeSpan}
   */
  get totalTimePlayed() {
    return this.fromMilliseconds(() => player.records.totalTimePlayed);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set totalTimePlayed(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.totalTimePlayed = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get timeSinceBlackHole() {
    return this.fromMilliseconds(() => {
      const diff = player.records.totalTimePlayed.sub(
        player.records.timePlayedAtBHUnlock,
      );
      return Decimal.max(0, diff);
    });
  },

  /**
   * @returns {TimeSpan}
   */
  get realTimeDoomed() {
    return this.fromMilliseconds(() => player.records.realTimeDoomed);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set realTimeDoomed(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.realTimeDoomed = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get realTimePlayed() {
    return this.fromMilliseconds(() => player.records.realTimePlayed);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set realTimePlayed(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.realTimePlayed = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisInfinity() {
    return this.fromMilliseconds(() => player.records.thisInfinity.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisInfinity(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisInfinity.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisInfinityRealTime() {
    return this.fromMilliseconds(() => player.records.thisInfinity.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisInfinityRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisInfinity.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisInfinityTrueTime() {
    return this.fromMilliseconds(() =>
      new Decimal(player.records.thisInfinity.trueTime),
    );
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisInfinityTrueTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisInfinity.trueTime = value.toNumber(),
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestInfinity() {
    return this.fromMilliseconds(() => player.records.bestInfinity.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestInfinity(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestInfinity.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestInfinityRealTime() {
    return this.fromMilliseconds(() => player.records.bestInfinity.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestInfinityRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestInfinity.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisEternity() {
    return this.fromMilliseconds(() => player.records.thisEternity.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisEternity(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisEternity.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisEternityRealTime() {
    return this.fromMilliseconds(() => player.records.thisEternity.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisEternityRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisEternity.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisEternityTrueTime() {
    return this.fromMilliseconds(() =>
      new Decimal(player.records.thisEternity.trueTime),
    );
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisEternityTrueTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisEternity.trueTime = value.toNumber(),
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestEternity() {
    return this.fromMilliseconds(() => player.records.bestEternity.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestEternity(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestEternity.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestEternityRealTime() {
    return this.fromMilliseconds(() => player.records.bestEternity.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestEternityRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestEternity.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisQuantum() {
    return this.fromMilliseconds(() => player.records.thisQuantum.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisQuantum(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisQuantum.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisQuantumRealTime() {
    return this.fromMilliseconds(() => player.records.thisQuantum.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisQuantumRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisQuantum.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisQuantumTrueTime() {
    return this.fromMilliseconds(() =>
      new Decimal(player.records.thisQuantum.trueTime),
    );
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisQuantumTrueTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisQuantum.trueTime = value.toNumber(),
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestQuantum() {
    return this.fromMilliseconds(() => player.records.bestQuantum.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestQuantum(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestQuantum.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestQuantumRealTime() {
    return this.fromMilliseconds(() => player.records.bestQuantum.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestQuantumRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestQuantum.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisReality() {
    return this.fromMilliseconds(() => player.records.thisReality.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisReality(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisReality.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get thisRealityRealTime() {
    return this.fromMilliseconds(() => player.records.thisReality.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set thisRealityRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.thisReality.realTime = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestReality() {
    return this.fromMilliseconds(() => player.records.bestReality.time);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestReality(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestReality.time = value,
    );
  },

  /**
   * @returns {TimeSpan}
   */
  get bestRealityRealTime() {
    return this.fromMilliseconds(() => player.records.bestReality.realTime);
  },
  /**
   * @param {TimeSpan} timespan
   */
  set bestRealityRealTime(timespan) {
    this.toMilliseconds(
      timespan,
      value => player.records.bestReality.realTime = value,
    );
  },

  /**
   * @return {TimeSpan}
   */
  get worstChallenge() {
    return this.fromMilliseconds(() => GameCache.worstChallengeTime.value);
  },

  /**
   * @return {TimeSpan}
   */
  get challengeSum() {
    return this.fromMilliseconds(() => GameCache.challengeTimeSum.value);
  },

  /**
   * @return {TimeSpan}
   */
  get infinityChallengeSum() {
    return this.fromMilliseconds(() =>
      GameCache.infinityChallengeTimeSum.value,
    );
  },
};
