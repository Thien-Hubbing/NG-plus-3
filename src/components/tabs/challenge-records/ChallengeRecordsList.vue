<script>
export default {
  name: "ChallengeRecordsList",
  props: {
    name: {
      type: String,
      required: true,
    },
    start: {
      type: Number,
      required: true,
    },
    times: {
      type: Array,
      required: true,
    },
  },
  computed: {
    timeSum() {
      return this.times.sum();
    },
    completedAllChallenges() {
      return this.timeSum.lt(new Decimal("10^^8900000000000000"));
    },
  },
  methods: {
    timeDisplayShort,
    completionString(time) {
      return time.lt(new Decimal("10^^8900000000000000"))
        ? `record time: ${timeDisplayShort(time)}`
        : "has not yet been completed";
    },
  },
};
</script>

<template>
  <div>
    <br>
    <div
      v-for="(time, i) in times"
      :key="i"
    >
      <span>{{ name }} {{ start + i }} {{ completionString(time) }}</span>
    </div>
    <br>
    <div v-if="completedAllChallenges">
      Sum of {{ name }} record times: {{ timeDisplayShort(timeSum) }}
    </div>
    <div v-else>
      You have not completed all {{ name }}s yet.
    </div>
  </div>
</template>
