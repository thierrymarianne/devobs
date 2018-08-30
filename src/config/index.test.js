const raven = {
  dsn: '',
};

const testMode = true;

const getApi = () => ({
  host: 'press.review',
  scheme: 'https://',
  routes: {
    pressReview: '/press-review',
  },
});

const authentication = {
  apiKey: '',
};
localStorage.setItem('x-auth-token', authentication.apiKey);

export default {
  getApi,
  authentication,
  raven,
  testMode,
};
