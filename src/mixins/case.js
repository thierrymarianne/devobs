export default {
  methods: {
    normalize(subject) {
      return subject.replace(/\s+/g, '-').toLowerCase();
    }
  }
};
