<template>
  <div :class="statusClasses()">

    <div class="status__row">
      <div class="status__publication-date">
        <a
          :href="status.url"
          class="status__url"
        >{{ publicationDate }}</a>
      </div>
      <div class="status__vanity-metrics">
        <font-awesome-icon
          icon="retweet"
          class="status__vanity-metric-icon" />
        <span class="status__vanity-metric">{{ retweet }}</span>
        <font-awesome-icon
          icon="heart"
          class="status__vanity-metric-icon" />
        <span class="status__vanity-metric">{{ favorite }}</span>
      </div>
    </div>

    <div
      v-if="isRetweet" 
      class="status__row">
      <div class="status__relay">
        <a
          :href="retweetingMemberTimelineUrl"
          class="status__username"
        >@{{ status.usernameOfRetweetingMember }}</a>
        <span class="status__verb">&nbsp;retweeted&nbsp;</span>
        <a
          :href="memberTimelineUrl"
          class="status__username"
        >@{{ status.username }}</a>
      </div>
    </div>

    <div
      v-if="isLike"
      class="status__row">
      <div class="status__relay">
        <a
          :href="likingMemberTimelineUrl"
          class="status__username"
        >@{{ status.likedBy }}</a>
        <span class="status__verb">&nbsp;liked&nbsp;</span>
        <a
          :href="memberTimelineUrl"
          class="status__username"
        >@{{ status.username }}</a>
      </div>
    </div>

    <div 
      v-else 
      class="status__row">
      <div class="status__publication">
        <a
          :href="memberTimelineUrl"
          class="status__username"
        >@{{ status.username }}</a>
      </div>
    </div>
    <div class="status__row">
      <div class="status__content">
        <div class="status__avatar-container">
          <div
            :style="'background: center / 48px no-repeat url(' + avatarUrl + ')'"
            class="status__avatar"
          ></div>
        </div>
        <p
          class="status__text"
          v-html="statusText"
        ></p>
      </div>
    </div>

    <div
      v-if="status.media && status.media.length > 0"
      class="status__row status__row--media">
      <div class="status__media">
        <img
          v-for="(document, index) in status.media"
          :key="index"
          :src="getMediaUrl(document)"
          :style="getMediaProperties()"
          class="status__media-item"
          @click="openMediaItem(document)"
        >
      </div>
    </div>

    <div
      v-if="shouldDisplayPermalink"
      class="status__row"
    >
      <div class="status__links">
        <a
          class="status__url"
          @click="goToPermalink(status)">Permalink</a>
        <a
          v-for="(link, index) in status.links"
          :key="index"
          :href="link"
          class="status__url status__url--secondary-link"
        >{{ link }}</a>
      </div>
    </div>

    <div class="status__row">
      <div class="status__web-intents">
        <a
          v-if="canBeRepliedTo"
          :href="urls.reply"
          class="status__web-intent">
          <font-awesome-icon icon="reply" />
          <span>Reply</span>
        </a>
        <a
          v-if="canBeRetweeted"
          :href="urls.retweet"
          class="status__web-intent">
          <font-awesome-icon icon="retweet" />
          <span>Retweet</span>
        </a>
        <a
          v-if="canBeLiked"
          :href="urls.like"
          class="status__web-intent">
          <font-awesome-icon icon="heart" />
          <span>Like</span>
        </a>
        <template v-if="shouldDisplayAddToBucketButton">
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
            <span class="status__web-intent--remove-from-bucket">Remove from bucket</span>
          </button>
        </template>
      </div>
    </div>

    <div
      v-if="canBeShared()"
      class="status__row"
    >
      <div class="status__web-intents">
        <button
          v-clipboard="urlWhichCanBeShared"
          class="status__web-intent status__web-intent--share-url"
          @click="shareStatus"
        >
          <font-awesome-icon icon="link" />
          <span>Share this status</span>
          <a
            :href="urlWhichCanBeShared"
            class='hide'
          >{{ urlWhichCanBeShared }}</a>
        </button>
      </div>
    </div>

    <div
      v-if="shouldShowConversationIntentButtons"
      :class="conversationClasses"
    >
      <div class="status__web-intents">
        <button
          v-if="isBucketVisible && canBeRefreshed && !isAllowedToOpenConversation"
          class="status__web-intent status__web-intent--load-conversation"
          @click="syncStatus"
        >
          <font-awesome-icon
            class="status__replied-icon"
            icon="comments"
          />

          <span>Load conversation</span>

          <font-awesome-icon
            v-if="couldNotFindStartOfConversation"
            class="status__error"
            icon="exclamation-triangle"
          />
        </button>

        <button
          v-else-if="isAllowedToOpenConversation"
          class="status__web-intent status__web-intent--open-conversation"
          @click="syncStatus"
        >
          <font-awesome-icon
            class="status__replied-icon"
            icon="comments"
          />

          <span>Conversation</span>

          <font-awesome-icon
            v-if="couldNotFindStartOfConversation"
            class="status__error"
            icon="exclamation-triangle"
          />
        </button>
      </div>
    </div>

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
const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'status',
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
    },
    canBeLiked: {
      type: Boolean,
      default: true
    },
    canBeRetweeted: {
      type: Boolean,
      default: true
    },
    canBeRepliedTo: {
      type: Boolean,
      default: true
    },
    canBeSharedAtFirst: {
      type: Boolean,
      default: false
    },
    fromAggregateType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      addedToBucket: this.statusAtFirst.isInBucket,
      errorMessages: SharedState.errors,
      couldNotFindStartOfConversation: false,
      logger: SharedState.logger,
      status: this.statusAtFirst,
      visibleStatuses: SharedState.state.visibleStatuses,
      aggregateType: this.fromAggregateType
    };
  },
  watch: {
    statusAtFirst(newStatus) {
      this.status = newStatus;
    }
  },
  computed: {
    ...mapAuthenticationGetters(['isAuthenticated']),
    avatarUrl() {
      return this.status.avatarUrl;
    },
    isAllowedToOpenConversation() {
      return (
        this.isBucketVisible &&
        this.isConversationInBucket()(this.status.statusId) &&
        this.canBeRefreshed
      );
    },
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
    conversationClasses() {
      const classes = { status__conversation: true };
      if (this.couldNotFindStartOfConversation) {
        classes['status__conversation--has-error'] = true;
      }

      return classes;
    },
    favorite() {
      return this.status.totalLike || 0;
    },
    urlWhichCanBeShared() {
      const basePath = `${window.location.protocol}//${window.location.host}`;
      return `${basePath}/#/aggregate/${this.fromAggregateType}/${
        this.status.statusId
      }`;
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
    isLike() {
      if (typeof this.status === 'undefined') {
        return false;
      }
      return this.status.likedBy;
    },
    retweet() {
      return this.status.totalRetweet || 0;
    },
    statusText() {
      if (
        typeof this.status === 'undefined' ||
        typeof this.status === 'string'
      ) {
        return '';
      }

      return this.formatStatusText(this.status);
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
      return this.$moment(publicationDate).format('LLLL');
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
    },
    likingMemberTimelineUrl() {
      if (typeof this.status === 'undefined' && this.status.retweet === false) {
        return '';
      }

      return `https://twitter.com/${this.status.likedBy}`;
    },
    shouldDisplayAddToBucketButton() {
      return this.isAuthenticated;
    },
    shouldDisplayPermalink() {
      return this.isAuthenticated;
    },
    shouldShowConversationIntentButtons() {
      return (
        this.$route.name === 'bucket' &&
        (this.isAllowedToOpenConversation ||
          (this.isBucketVisible &&
            this.canBeRefreshed &&
            !this.isAllowedToOpenConversation))
      );
    }
  },
  mounted() {
    EventHub.$on(
      'status.removal_from_bucket_intended',
      this.intendToRemoveStatusFromBucket
    );
  },
  updated() {
    this.status = this.statusAtFirst;
  },
  methods: {
    ...mapActions([
      ActionTypes.PERSIST_CONVERSATION_ADDITION_TO_BUCKET,
      ActionTypes.PERSIST_CONVERSATION_REMOVAL_FROM_BUCKET
    ]),
    ...mapGetters(['isStatusInBucket', 'isConversationInBucket']),
    canBeShared() {
      if (this.$route.name === 'status') {
        return false;
      }

      if (
        this.$route.name === 'aggregate' ||
        this.$route.name === 'aggregate-status' ||
        this.$route.name === 'press-review'
      ) {
        return true;
      }

      return this.canBeSharedAtFirst;
    },
    formatStatusText(status) {
      if (typeof status === 'undefined' || typeof status === 'string') {
        return '';
      }

      const whitespace = 's';
      const startCharacterClass = '[^';
      const pattern = `(http(s?)://${startCharacterClass}${whitespace}]+)`;

      const text = status.text.replace(
        new RegExp(pattern, 'gi'),
        '<a class="status__text-external-link" target="_blank" href="$1">$1</a>'
      );

      return text.replace(/\s/g, ' ');
    },
    statusClasses() {
      const classes = { status: true };

      if (!this.canBeShared()) {
        return classes;
      }

      classes['status__can-be-shared'] = true;

      return classes;
    },
    getMediaProperties() {
      return {
        'max-height': '80vw',
        width: '100vmin',
        objectFit: 'scale-down'
      };
    },
    getMediaUrl(media) {
      return media.url;
    },
    goToPermalink(status) {
      this.$router.push({
        name: 'status',
        params: { statusId: status.statusId }
      });
    },
    intendToRemoveStatusFromBucket({ statusId }) {
      if (this.status.statusId !== statusId) {
        return;
      }

      this.addedToBucket = !this.addedToBucket;
      EventHub.$emit('status_list.intent_to_refresh_bucket');
    },
    openMediaItem(document) {
      EventHub.$emit('modal_window.show_intended', { media: document });
    },
    removeFromBucket() {
      this.removeStatusFromBucket();
      EventHub.$emit('status_list.intent_to_refresh_bucket');
    },
    removeStatusFromBucket() {
      EventHub.$emit('status.removed_from_bucket', { status: this.status });
    },
    shareStatus() {
      let { aggregateType } = this;
      if (this.status.foundIn) {
        aggregateType = this.status.foundIn;
      }

      const path = `/aggregate/${aggregateType}/${this.status.statusId}`;
      this.$router.push({ path });

      EventHub.$emit('action_menu.hide_intended');
      EventHub.$emit('status_list.reload_intended', {
        aggregateType,
        filter: status => status.statusId === this.status.statusId
      });
    },
    syncStatus() {
      if (this.couldNotFindStartOfConversation) {
        return;
      }

      const { method } = this.routes.actions.syncStatus;
      let { route } = this.routes.actions.syncStatus;
      route = route.replace(':statusId', this.status.statusId);

      const authenticationToken = localStorage.getItem('x-auth-token');
      this.$http[method](route, {
        headers: { 'x-auth-token': authenticationToken }
      })
        .then(({ data }) => {
          const syncing = true;
          [this.status] = this.formatStatuses(data, syncing);

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
        .catch(e => {
          if (e.response.status === 404) {
            this.couldNotFindStartOfConversation = true;
            return;
          }

          this.logger.error(e.message, 'status', e);
        });
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
