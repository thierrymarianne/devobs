export default {
  methods: {
    goToRoute({ routeName, newParams }) {
      const params = this.$route.params || {};
      Object.keys(newParams).forEach(name => {
        params[name] = newParams[name];
      });

      this.$router.push({
        name: routeName,
        params: newParams
      });
    }
  }
};
