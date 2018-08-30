const raven = {
  dsn: '',
};

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

const testMode = true;

export default {
  getApi,
  authentication,
  raven,
  testMode,
};
