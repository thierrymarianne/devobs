<template>
  <div class='conversation'>
    <status
      :status-at-first='status'
      :can-be-refreshed='false'
      :can-be-removed-from-bucket='canBeRemovedFromBucketList(status)'
      :key='getKey(status)'
      v-for='status in statuses'
    />
  </div>
</template>

<script>
import Status from '../status/status';

export default {
  components: {
    Status
  },
  methods: {
    canBeRemovedFromBucketList: function (status) {
      return status.statusId === this.originatesFrom.statusId;
    },
    getKey: function (status) {
      return `${this.originatesFrom.statusId}-${status.statusId}`;
    }
  },
  name: 'conversation',
  props: {
    statuses: {
      type: Array,
      required: true
    },
    originatesFrom: {
      type: Object,
      require: true
    }
  },
};
</script>

<style lang='scss' scoped>
@import './conversation.scss';
</style>