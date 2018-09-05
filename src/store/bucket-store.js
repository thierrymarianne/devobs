import ActionTypes from './bucket-action-types';
import MutationTypes from './bucket-mutation-types';
import EventHub from '../modules/event-hub';

const ensurePersistentBucketExists = () => {
  if (
    typeof localStorage.getItem('bucket') === 'undefined' ||
    localStorage.getItem('bucket') === null
  ) {
    const bucket = { statuses: {}, conversations: {} };
    localStorage.setItem('bucket', JSON.stringify(bucket));
    return;
  }

  const bucket = JSON.parse(localStorage.getItem('bucket'));

  if (typeof bucket.conversations !== 'undefined') {
    return;
  }

  bucket.conversations = {};
  localStorage.setItem('bucket', JSON.stringify(bucket));
};

const Bucket = {
  namespaced: true,
  state: {
    statuses: {},
    conversations: {}
  },
  mutations: {
    [MutationTypes.ADD_TO_BUCKET](state, status) {
      state.statuses[status.statusId] = status;
    },
    [MutationTypes.ADD_CONVERSATION_TO_BUCKET](
      state,
      { conversation, statusId }
    ) {
      state.conversations[statusId] = conversation;
    },
    [MutationTypes.REMOVE_FROM_BUCKET](state, status) {
      if (!(status.statusId in state.statuses)) {
        return;
      }

      delete state.statuses[status.statusId];
    },
    [MutationTypes.REMOVE_CONVERSATION_FROM_BUCKET](state, statusId) {
      if (!(statusId in state.conversations)) {
        return;
      }

      delete state.conversations[statusId];
    },
    [MutationTypes.REPLACE_BUCKET](state, statuses) {
      if (!(typeof state.statuses !== 'undefined')) {
        return;
      }

      state.statuses = statuses;
    },
    [MutationTypes.REPLACE_CONVERSATIONS_IN_BUCKET](state, conversations) {
      if (!(typeof state.conversations !== 'undefined')) {
        return;
      }

      state.conversations = conversations;
    }
  },
  actions: {
    [ActionTypes.PERSIST_ADDITION_TO_BUCKET]({ commit }, status) {
      ensurePersistentBucketExists();
      const bucket = JSON.parse(localStorage.getItem('bucket'));

      if (typeof bucket.statuses[status.statusId] !== 'undefined') {
        return;
      }

      bucket.statuses[status.statusId] = status;
      localStorage.setItem('bucket', JSON.stringify(bucket));

      commit(MutationTypes.ADD_TO_BUCKET, status);
    },
    [ActionTypes.RESTORE_BUCKET_FROM_PERSISTENCE_LAYER]({ commit }) {
      ensurePersistentBucketExists();
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      commit(MutationTypes.REPLACE_BUCKET, bucket.statuses);
      commit(
        MutationTypes.REPLACE_CONVERSATIONS_IN_BUCKET,
        bucket.conversations
      );
    },
    [ActionTypes.PERSIST_REMOVAL_FROM_BUCKET]({ commit }, status) {
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      if (typeof bucket.statuses[status.statusId] !== 'undefined') {
        delete bucket.statuses[status.statusId];
      }
      localStorage.setItem('bucket', JSON.stringify(bucket));

      commit(MutationTypes.REMOVE_FROM_BUCKET, status);
      EventHub.$emit('status.removal_from_bucket_intended', {
        statusId: status.statusId
      });
    },
    [ActionTypes.PERSIST_CONVERSATION_ADDITION_TO_BUCKET](
      { commit },
      { conversation, statusId }
    ) {
      ensurePersistentBucketExists();
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      if (typeof bucket.conversations[statusId] !== 'undefined') {
        EventHub.$emit('status_list.intent_to_refresh_bucket', { statusId });
        return;
      }

      bucket.conversations[statusId] = conversation;
      localStorage.setItem('bucket', JSON.stringify(bucket));

      commit(MutationTypes.ADD_CONVERSATION_TO_BUCKET, {
        conversation,
        statusId
      });
      EventHub.$emit('status_list.intent_to_refresh_bucket', { statusId });
    },
    [ActionTypes.PERSIST_CONVERSATION_REMOVAL_FROM_BUCKET](
      { commit },
      statusId
    ) {
      const bucket = JSON.parse(localStorage.getItem('bucket'));
      if (typeof bucket.conversations[statusId] !== 'undefined') {
        delete bucket.conversations[statusId];
      }
      localStorage.setItem('bucket', JSON.stringify(bucket));

      commit(MutationTypes.REMOVE_CONVERSATION_FROM_BUCKET, statusId);
    }
  },
  getters: {
    getStatusesInBucket: function(state) {
      return state.statuses;
    },
    getConversationsInBucket: function(state) {
      return state.conversations;
    },
    isStatusInBucket: state => {
      let statusInBucket;
      let isStatusInBucket;
      return statusId => {
        statusInBucket = state.statuses[statusId];
        isStatusInBucket = typeof statusInBucket !== 'undefined';
        return isStatusInBucket;
      };
    },
    isConversationInBucket: state => {
      let conversationInBucket;
      let isConversationInBucket;
      return statusId => {
        conversationInBucket = state.conversations[statusId];
        isConversationInBucket = typeof conversationInBucket !== 'undefined';
        return isConversationInBucket;
      };
    }
  }
};

export default Bucket;
