<template>
  <div class="conversation">
    <status
      v-for="status in statuses"
      :status-at-first="status"
      :can-be-refreshed="false"
      :can-be-retweeted="isActionable(status)"
      :can-be-replied-to="isActionable(status)"
      :can-be-liked="isActionable(status)"
      :can-be-removed-from-bucket="canBeRemovedFromBucketList(status)"
      :key="getKey(status)"
    />
  </div>
</template>

<script>
import Status from '../status/status.vue';

export default {
  name: 'conversation',
  components: {
    Status
  },
  props: {
    statuses: {
      type: Array,
      required: true
    },
    originatesFrom: {
      type: Object,
      default: () => {},
      require: true
    }
  },
  methods: {
    canBeRemovedFromBucketList(status) {
      return status.statusId === this.originatesFrom.statusId;
    },
    isActionable(status) {
      return status.statusId === this.originatesFrom.statusId;
    },
    getKey(status) {
      return `${this.originatesFrom.statusId}-${status.statusId}`;
    }
  }
};
</script>

<style lang='scss'>
@import './conversation.scss';
</style>
