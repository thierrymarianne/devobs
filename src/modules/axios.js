import axios from 'axios';
import Vue from 'vue';

import Config from '../config';

const useAxios = () => {
  const createAxios = () => (axios.create({
    baseURL: `${Config.api.scheme}${Config.api.host}`,
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
