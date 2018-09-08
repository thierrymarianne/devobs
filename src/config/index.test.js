const raven = {
  dsn: ''
};

const testMode = false;

const getApi = () => ({
  host: 'press.review',
  scheme: 'https://',
  routes: {
    'Press review': '/press-review'
  }
});

const authentication = {
  apiKey: ''
};
localStorage.setItem('x-auth-token', localStorage.getItem('x-auth-token'));

export default {
  getApi,
  authentication,
  raven,
  testMode
};
