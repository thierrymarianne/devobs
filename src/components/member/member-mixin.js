export default {
  methods: {
    formatTotalMembers(subject) {
      if (subject.totalMembers === -1) {
        return '0 members';
      }

      if (subject.totalMembers === 1) {
        return '1 member';
      }

      return `${subject.totalMembers} members`;
    }
  }
};
