export default {
  methods: {
    formatTotalMembers(subject) {
      if (subject.totalMembers === -1) {
        return '0 member';
      }

      if (subject.totalMembers === 1) {
        return '1 member';
      }

      return `${subject.totalMembers} members`;
    }
  }
};
