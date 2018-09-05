<template>
  <div class="status">
    <div class="status__row">
      <div class="status__publication-date">{{ publicationDate }}</div>
    </div>
    <div 
      v-if="isRetweet" 
      class="status__row">
      <div class="status__relay">
        <a
          :href="memberTimelineUrl"
          class="status__username"
        >@{{ status.usernameOfRetweetingMember }}</a>&nbsp;retweeted&nbsp;<a
          :href="retweetingMemberTimelineUrl"
          class="status__username"
        >@{{ status.username }}</a>
      </div>
    </div>
    <div 
      v-else 
      class="status__row">
      <a 
        :href="memberTimelineUrl"
        class="status__username"
      >@{{ status.username }}</a>
    </div>
    <div class="status__row">
      <div class="status__content">
        <div class="status__avatar-container">
          <div
            :style="'background: center / 24px no-repeat url(' + avatarUrl + ')'"
            class="status__avatar"
          />
        </div>
        <span class="status__text">{{ status.text }}</span>
      </div>
    </div>
    <div 
      v-if="status.media && status.media.length > 0"
      class="status__row">
      <div class="status__media">
        <div
          v-for="(document, index) in status.media"
          :key="index"
          :style="getDocumentProperties(document)" />
      </div>
    </div>
    <div class="status__row">
      <div class="links">
        <a
          :href="status.url"
          class="status__url">Permalink</a>
        <a
          v-for="(link, index) in status.links"
          :key="index"
          :href="link"
          class="status__url"
        >{{ link }}</a>
      </div>
      <button
        v-if="isBucketVisible && isConversationInBucket()(status.statusId) && canBeRefreshed"
        class="status__web-intent status__web-intent--open-conversation"
        @click="syncStatus"
      >
        <font-awesome-icon
          class="action-menu__replied-icon"
          icon="comments"
        />
        <span>Conversation</span>
      </button>
    </div>
    <div class="status__row">
      <a 
        :href="urls.reply" 
        class="status__web-intent">
        <font-awesome-icon icon="reply" />
        <span>Reply</span>
      </a>
      <a 
        :href="urls.retweet" 
        class="status__web-intent">
        <font-awesome-icon icon="retweet" />
        <span>Retweet</span>
      </a>
      <a 
        :href="urls.like" 
        class="status__web-intent">
        <font-awesome-icon icon="heart" />
        <span>Like</span>
      </a>
      <button
        v-if="!isBucketVisible"
        class="status__web-intent"
        @click="toggleBucketAddition"
      >
        <font-awesome-icon :icon="addedToBucketIcon" />
        <span>{{ bucketAdditionLabel }}</span>
      </button>
      <button 
        v-else-if="canBeRemovedFromBucket"
        class="status__web-intent"
        @click="removeFromBucket"
      >
        <font-awesome-icon icon="minus" />
        <span>Remove from bucket</span>
      </button>
    </div>
    <button
      v-if="isBucketVisible && canBeRefreshed"
      class="status__web-intent"
      @click="syncStatus"
    >
      <font-awesome-icon
        class="action-menu__replied-icon"
        icon="sync"
      />
      <span>Refresh</span>
    </button>    
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import StatusFormat from '../../mixins/status-format';
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';
import ActionTypes from '../../store/bucket-action-types';

const { mapActions, mapGetters } = createNamespacedHelpers('bucket');

export default {
  name: 'Status',
  mixins: [ApiMixin, StatusFormat],
  props: {
    statusAtFirst: {
      type: Object,
      required: true
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
  data() {
    return {
      addedToBucket: this.statusAtFirst.isInBucket,
      errorMessages: SharedState.errors,
      logger: SharedState.logger,
      status: this.statusAtFirst,
      visibleStatuses: SharedState.state.visibleStatuses
    };
  },
  computed: {
    addedToBucketIcon() {
      if (!this.addedToBucket) {
        return 'plus';
      }

      return 'minus';
    },
    bucketAdditionLabel() {
      if (!this.addedToBucket) {
        return 'Add to bucket';
      }

      return 'Remove from bucket';
    },
    avatarUrl() {
      return this.status.avatarUrl;
    },
    isBucketVisible() {
      return this.visibleStatuses.name === 'bucket';
    },
    isRetweet() {
      if (typeof this.status === 'undefined') {
        return false;
      }
      return this.status.retweet;
    },
    urls() {
      if (typeof this.status === 'undefined') {
        return '';
      }

      return {
        reply: `https://twitter.com/intent/tweet?in_reply_to=${
          this.status.statusId
        }`,
        retweet: `https://twitter.com/intent/retweet?tweet_id=${
          this.status.statusId
        }`,
        like: `https://twitter.com/intent/like?tweet_id=${this.status.statusId}`
      };
    },
    publicationDate() {
      if (typeof this.status === 'undefined') {
        return '';
      }

      const publicationDate = new Date(this.status.publishedAt);
      return `${publicationDate.toDateString()} ${publicationDate.toTimeString()}`;
    },
    memberTimelineUrl() {
      if (typeof this.status === 'undefined') {
        return '';
      }

      return `https://twitter.com/${this.status.username}`;
    },
    retweetingMemberTimelineUrl() {
      if (typeof this.status === 'undefined' && this.status.retweet === false) {
        return '';
      }

      return `https://twitter.com/${this.status.usernameOfRetweetingMember}`;
    }
  },
  mounted() {
    EventHub.$on(
      'status.removal_from_bucket_intended',
      this.intendToRemoveStatusFromBucket
    );
  },
  methods: {
    ...mapActions([
      ActionTypes.PERSIST_CONVERSATION_ADDITION_TO_BUCKET,
      ActionTypes.PERSIST_CONVERSATION_REMOVAL_FROM_BUCKET
    ]),
    ...mapGetters(['isStatusInBucket', 'isConversationInBucket']),
    getBackgroundProperties(document) {
      return `url(${document.url}) center / cover no-repeat`;
    },
    getDocumentProperties(document) {
      return {
        background: this.getBackgroundProperties(document),
        height: `200px`,
        width: '50vw'
      };
    },
    intendToRemoveStatusFromBucket({ statusId }) {
      if (this.status.statusId !== statusId) {
        return;
      }

      this.addedToBucket = !this.addedToBucket;
      EventHub.$emit('status_list.intent_to_refresh_bucket');
    },
    removeFromBucket() {
      this.removeStatusFromBucket();
      EventHub.$emit('status_list.intent_to_refresh_bucket');
    },
    removeStatusFromBucket() {
      EventHub.$emit('status.removed_from_bucket', { status: this.status });
      this.addedToBucket = !this.addedToBucket;
    },
    syncStatus() {
      const { method } = this.routes.actions.syncStatus;
      let { route } = this.routes.actions.syncStatus;
      route = route.replace(':statusId', this.status.statusId);

      const authenticationToken = localStorage.getItem('x-auth-token');
      this.$http[method](route, {
        headers: { 'x-auth-token': authenticationToken }
      })
        .then(({ data }) => {
          const syncing = true;
          const formattedStatuses = this.formatStatuses(data, syncing);
          this.status = formattedStatuses[0];

          if (this.status.statusRepliedTo) {
            const conversation = [this.status, this.status.statusRepliedTo];
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
          }
        })
        .catch(e => this.logger.error(e.message, 'status', e));
    },
    toggleBucketAddition() {
      if (this.addedToBucket === false) {
        EventHub.$emit('status.added_to_bucket', { status: this.status });
        this.addedToBucket = !this.addedToBucket;
        return;
      }

      this.removeStatusFromBucket();
    }
  }
};
</script>

<style lang='scss' scoped>
@import './status.scss';
</style>
