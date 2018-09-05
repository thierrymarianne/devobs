import Vuex from 'vuex';
import Vue from 'vue';

import BucketStore from './bucket-store';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    bucket: BucketStore
  },
  strict: debug
});
