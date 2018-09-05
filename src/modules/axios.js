import axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar';
import 'axios-progress-bar/dist/nprogress.css';

import Config from '../config';

const useAxios = Vue => {
  const createAxios = () =>
    axios.create({
      baseURL: Config.getSchemeAndHost(),
      headers: {
        'x-auth-token': localStorage.getItem('x-auth-token')
      }
    });

  const axiosInstance = createAxios();
  axiosInstance.defaults.headers.common['x-auth-token'] = localStorage.getItem(
    'x-auth-token'
  );

  loadProgressBar(undefined, axiosInstance);
  Vue.prototype.$http = axiosInstance;
};

export default {
  useAxios
};
