export default {
  methods: {
    formatTotalStatuses(subject) {
      if (subject.totalStatuses === -1) {
        return '0 status';
      }

      if (subject.totalStatuses === 1) {
        return '1 status';
      }

      return `${subject.totalStatuses} statuses`;
    }
  }
};
