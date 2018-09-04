<template>
  <div class='status'>
    <div class='status__row'>
      <div class='status__publication-date'>{{ publicationDate }}</div>
    </div>
    <div v-if='isRetweet' class='status__row'>
      <a 
        class='status__username'
        :href='memberTimelineUrl'
      >@{{ status.usernameOfRetweetingMember }}</a>&nbsp;retweeted&nbsp;<a 
        class='status__username'
        :href='retweetingMemberTimelineUrl'
      >@{{ status.username }}</a>

    </div>
    <div v-else class='status__row'>
      <a 
        class='status__username'
        :href='memberTimelineUrl'
      >@{{ status.username }}</a>
    </div>
    <div class='status__row'>
      <div class='status__avatar-container'>
        <div
          class='status__avatar' 
          :style='"background: center / 24px no-repeat url(" +  avatarUrl + ")"'
        ></div>
      </div>
      <span class='status__text'>{{ status.text }}</span>
    </div>
    <div class='status__row'>
      <a class='status__url' :href='status.url'>Permalink</a>
      <a
        :href='link'
        class='status__url' 
        v-for='link in status.links'
      >{{ link }}</a>
    </div>
    <div class='status__row'>
      <a class='status__web-intent' :href='urls.reply'>
        <font-awesome-icon icon='reply' />
        <span>Reply</span>
      </a>
      <a class='status__web-intent' :href='urls.retweet'>
        <font-awesome-icon icon='retweet' />
        <span>Retweet</span>
      </a>
      <a class='status__web-intent' :href='urls.like'>
        <font-awesome-icon icon='heart' />
        <span>Like</span>
      </a>
      <button
        v-if='!isBucketVisible'
        class='status__web-intent'
        @click='toggleBucketAddition'
      >
        <font-awesome-icon :icon='addedToBucketIcon' />
        <span>{{ bucketAdditionLabel }}</span>
      </button>
      <button 
        v-else-if='canBeRemovedFromBucket'
        class='status__web-intent'
        @click='removeFromBucket'
      >
        <font-awesome-icon icon='minus' />
        <span>Remove from bucket</span>
      </button>
    </div>
    <button
      class='status__web-intent'
      v-if='isBucketVisible && canBeRefreshed'
      @click='syncStatus'
    >
      <font-awesome-icon
        class='action-menu__replied-icon'
        icon='sync' 
      />
      <span>Refresh</span>
    </button>    
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapActions, mapGetters, mapMutations } = createNamespacedHelpers('bucket');

import ApiMixin  from '../../mixins/api';
import StatusFormat  from '../../mixins/status-format';
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';
import ActionTypes from '../../store/bucket-action-types';

export default {
  name: 'status',
  mixins: [ApiMixin, StatusFormat],
  props: {
    statusAtFirst: {
      type: Object,
      required: true,
    },
    canBeRemovedFromBucket: {
      type: Boolean,
      default: true
    },
    canBeRefreshed: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    addedToBucketIcon: function () {
      if (!this.addedToBucket) {
        return 'plus';
      }

      return 'minus';
    },
    bucketAdditionLabel: function () {
      if (!this.addedToBucket) {
        return 'Add to bucket';
      }

      return 'Remove from bucket';
    },
    avatarUrl: function () {
      return this.status.avatarUrl;
    },
    isBucketVisible: function () {
      return this.visibleStatuses.name === "bucket";
    },
    isRetweet: function () {
      if (typeof this.status === 'undefined') {
        return false;
      }
      return this.status.retweet;
    },
    urls: function () {
      if (typeof this.status === 'undefined') {
        return '';
      }
      
      return {
        reply: `https://twitter.com/intent/tweet?in_reply_to=${this.status.statusId}`,
        retweet: `https://twitter.com/intent/retweet?tweet_id=${this.status.statusId}`,
        like: `https://twitter.com/intent/like?tweet_id=${this.status.statusId}`,
      }
    },
    publicationDate: function () {
      if (typeof this.status === 'undefined') {
        return '';
      }

      const publicationDate = new Date(this.status.publishedAt);
      return `${publicationDate.toDateString()} ${publicationDate.toTimeString()}`;
    },
    memberTimelineUrl: function () {
      if (typeof this.status === 'undefined') {
        return '';
      }

      return `https://twitter.com/${this.status.username}`;
    },
    retweetingMemberTimelineUrl: function () {
      if (typeof this.status === 'undefined' &&
      this.status.retweet === false) {
        return '';
      }

      return `https://twitter.com/${this.status.usernameOfRetweetingMember}`;
    }    
  },
  data: function () {
    return {
      addedToBucket: this.statusAtFirst.isInBucket,
      errorMessages: SharedState.errors,
      logger: SharedState.logger,
      status: this.statusAtFirst,
      visibleStatuses: SharedState.state.visibleStatuses
    };
  },
  methods: {
    ...mapActions([
      ActionTypes.PERSIST_CONVERSATION_ADDITION_TO_BUCKET,
      ActionTypes.PERSIST_CONVERSATION_REMOVAL_FROM_BUCKET,
    ]),
    ...mapGetters([
      'isStatusInBucket',
    ]),
    removeFromBucket: function () {
      this.removeStatusFromBucket();
      EventHub.$emit('status_list.intent_to_refresh_bucket');
    },
    removeStatusFromBucket: function () {
      EventHub.$emit('status.removed_from_bucket', { status: this.status });
      this.addedToBucket = !this.addedToBucket;      
    },
    syncStatus: function () {
      const method = this.routes.actions.syncStatus.method;
      let route = this.routes.actions.syncStatus.route;
      const parameters = this.routes.actions.syncStatus.parameters;

      const statusIndex = Object.values(this.visibleStatuses.statuses).indexOf(this.status);

      route = route.replace(':statusId', this.status.statusId);

      const authenticationToken = localStorage.getItem('x-auth-token');
      this.$http[method](route, {
        headers: { 'x-auth-token': authenticationToken }
      }).
      then(({ data }) => {
        const syncing = true;
        const formattedStatuses = this.formatStatuses(data, syncing);
        this.status = formattedStatuses[0];

        if (this.status.statusRepliedTo) {
          let conversation = [this.status, this.status.statusRepliedTo]; 
          let repliedToStatus = this.status.statusRepliedTo;
          while ('statusRepliedTo' in repliedToStatus) {
            conversation.push(repliedToStatus.statusRepliedTo);
            repliedToStatus = repliedToStatus.statusRepliedTo;
          }

          const reversedConversation = conversation.reverse();
          this.persistConversationAdditionToBucket({
            conversation: reversedConversation,
            statusId: this.status.statusId
          });
          // this.removeFromBucket(this.status);
        }
      }).catch(e => this.logger.error(e.message, 'status', e));

    },
    toggleBucketAddition: function () {
      if (this.addedToBucket === false) {
        EventHub.$emit('status.added_to_bucket', { status: this.status });
        this.addedToBucket = !this.addedToBucket;
        return;
      }

      this.removeStatusFromBucket()
    }
  }
};
</script>

<style lang='scss' scoped>
@import './status.scss';
</style>