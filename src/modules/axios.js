import axios from 'axios';

import Config from '../config';

const useAxios = (Vue) => {
  const createAxios = () => (axios.create({
    baseURL: Config.getSchemeAndHost(),
    headers: {
      'x-auth-token': localStorage.getItem('x-auth-token'),
    },
  }));

  const axiosInstance = createAxios();
  axiosInstance.defaults.headers
  .common['x-auth-token'] = localStorage.getItem('x-auth-token');

  Vue.prototype.$http = axiosInstance;
};


export default {
  useAxios,
};
