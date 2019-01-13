export default {
  methods: {
    getBaseRequestOptions() {
      return {
        headers: {
          'x-auth-admin-token': this.idToken
        }
      };
    }
  }
};
