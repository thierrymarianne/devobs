const raven = {
  dsn: '',
};

const getApi = () => ({
  host: 'press.review',
  scheme: 'https://',
  routes: {
    'press-review': '/press-review',
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
};
