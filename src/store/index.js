import Vuex from 'vuex';
import Vue from 'vue';

import AuthenticationStore from './authentication-store';
import BucketStore from './bucket-store';
import MemberListStore from '../components/member-list/store/member-list';
import MemberSubscriptionStore from '../components/member-subscription/store/member-subscription';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    bucket: BucketStore,
    authentication: AuthenticationStore,
    'member-list': MemberListStore,
    'member-subscription': MemberSubscriptionStore
  },
  strict: debug
});
