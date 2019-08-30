import Errors from '../modules/errors';

export default {
  methods: {
    setUpCommonHeaders() {
      if (typeof this.idToken === 'undefined') {
        throw new Errors.InvalidSession();
      }

      const requestOptions = {
        headers: {
          'x-auth-admin-token': this.idToken
        }
      };

      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      return requestOptions;
    }
  }
};
