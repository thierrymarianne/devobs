import auth0 from 'auth0-js';
import Config from '../config';
import EventHub from './event-hub';

// @see https://auth0.com/docs/quickstart/spa/vuejs/01-login#configure-auth0

const authenticationService = new auth0.WebAuth({
  domain: Config.authentication.auth0.host,
  clientID: Config.authentication.auth0.clientId,
  redirectUri: Config.authentication.auth0.redirectUri,
  responseType: 'token id_token',
  scope: 'openid'
});

const setSession = authResult => {
  const expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );
  localStorage.setItem('access_token', authResult.accessToken);
  localStorage.setItem('id_token', authResult.idToken);
  localStorage.setItem('expires_at', expiresAt);

  EventHub.$emit('authentication.changed', { authenticated: true });
};

const handleAuthentication = () => {
  authenticationService.parseHash((err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);
    }

    EventHub.$emit('navigate_to_homepage');
  });
};

const isAuthenticated = () => {
  const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
  return expiresAt !== null && new Date().getTime() < expiresAt;
};

const getIdToken = () => {
  if (!isAuthenticated()) {
    return null;
  }

  return localStorage.getItem('id_token');
};

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');

  EventHub.$emit('authentication.changed', { authenticated: false });
  // @see https://auth0.com/docs/logout#redirect-users-after-logout
  window.location = Config.authentication.auth0.logoutUri;
};

export default {
  login: () => {
    authenticationService.authorize();
  },
  logout,
  getIdToken,
  handleAuthentication,
  isAuthenticated
};
