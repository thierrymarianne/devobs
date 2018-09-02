import ActionTypes from './bucket-action-types';
import MutationTypes from './bucket-mutation-types';

const ensurePersistentBucketExists = () => {
  if ((typeof localStorage.getItem('bucket') === 'undefined')
  || localStorage.getItem('bucket') === null) {
    const bucket = { statuses: {} };
    localStorage.setItem('bucket', JSON.stringify(bucket));
  }
};

const Bucket = {
  namespaced: true,
  state: {
    statuses: {},
  },
  mutations: {
    [MutationTypes.ADD_TO_BUCKET](state, status) {
      state.statuses[status.statusId] = status;
    },
    [MutationTypes.REMOVE_FROM_BUCKET](state, status) {
      if (!(status.statusId in state.statuses)) {
        return;
      }

      delete state.statuses[status.statusId];
    },
    [MutationTypes.REPLACE_BUCKET](state, statuses) {
      if (!(typeof state.statuses !== 'undefined')) {
        return;
      }

      state.statuses = statuses;
    },
  },
  actions: {
    [ActionTypes.PERSIST_ADDITION_TO_BUCKET]({ commit }, status) {
      ensurePersistentBucketExists();
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      bucket.statuses[status.statusId] = status;
      localStorage.setItem('bucket', JSON.stringify(bucket));

      commit(MutationTypes.ADD_TO_BUCKET, status);
    },
    [ActionTypes.RESTORE_BUCKET_FROM_PERSISTENCE_LAYER]({ commit }) {
      ensurePersistentBucketExists();
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      commit(MutationTypes.REPLACE_BUCKET, bucket.statuses);
    },
    [ActionTypes.PERSIST_REMOVAL_FROM_BUCKET]({ commit }, status) {
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      if (typeof bucket.statuses[status.statusId] !== 'undefined') {
        delete bucket.statuses[status.statusId];
      }
      localStorage.setItem('bucket', JSON.stringify(bucket));

      commit(MutationTypes.REMOVE_FROM_BUCKET, status);
    },
  },
  getters: {
    getStatusesInBucket: function (state) {
      return state.statuses;
    },
    isStatusInBucket: (state) => {
      let statusInBucket;
      let isStatusInBucket;
      return (statusId) => {
        statusInBucket = state.statuses[statusId];
        isStatusInBucket = typeof statusInBucket !== 'undefined';
        return isStatusInBucket;
      };
    },
  },
};

export default Bucket;
