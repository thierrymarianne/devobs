<template>
  <label
    :class="datesClass"
    for="start-date"
  >
    <input
      id="start-date"
      v-model="since"
      :min="minDate"
      :max="intervalMaxStartDate"
      type="date"
    >
    <input
      v-if="showEndDate"
      id="end-date"
      v-model="until"
      :min="intervalMinEndDate"
      :max="maxDate"
      type="date"
    >
    <input
      v-else
      v-model="until"
      :min="intervalMinEndDate"
      :max="maxDate"
      type="hidden"
    >
  </label>
</template>

<script>
export default {
  name: 'date-interval',
  props: {
    namespace: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    maxDate: {
      type: String,
      required: true
    },
    maxStartDate: {
      type: String,
      required: true
    },
    minDate: {
      type: String,
      required: true
    },
    minEndDate: {
      type: String,
      required: true
    },
    showEndDate: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: String,
      required: true
    }
  },
  data() {
    return Object.assign({
      since: this.startDate,
      until: this.endDate,
      intervalMaxStartDate: this.maxStartDate,
      intervalMinEndDate: this.minEndDate
    });
  },
  computed: {
    datesClass() {
      return {
        'date-interval': true,
        'date-interval--having-end-date': this.showEndDate
      };
    }
  },
  updated() {
    this.intervalMaxStartDate = this.until;
    this.intervalMinEndDate = this.since;

    this.$emit(`date_interval.${this.namespace}`, {
      startDate: this.since,
      endDate: this.until
    });
  }
};
</script>

<style lang="scss" scoped>
@import './date-interval.scss';
</style>
