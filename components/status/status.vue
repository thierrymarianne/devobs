<template>
  <div :class="statusClasses()">

    <div class="status__row">
      <div class="status__publication-date">
        <a
          :href="status.url"
          class="status__url"
          rel="noreferrer"
          target="_blank"
        >{{ $dateFns.format(publicationDate, 'PPPPpp') }}</a>
      </div>
      <div class="status__vanity-metrics">
        <a
          :href="status.url"
          class="status__url status__url--permanent-link"
          rel="noreferrer"
        >
          <font-awesome-icon
            :icon="['fab', 'twitter']"
            class="status__vanity-metric-icon"
          />
          Publication originale
        </a>
        <font-awesome-icon
          icon="retweet"
          class="status__vanity-metric-icon"
        />
        <span class="status__vanity-metric">{{ retweet }}</span>
        <font-awesome-icon
          icon="heart"
          class="status__vanity-metric-icon" />
        <span class="status__vanity-metric">{{ favorite }}</span>
      </div>
    </div>

    <div
      class="status__row">
      <div class="status__publisher">
        <a
          :style="publisherStyle"
          :href="memberTimelineUrl"
          class="status__username"
          rel="noreferrer"
          target="_blank"
        >
          <span class="status__publisher-name">@{{ status.username }}</span>
        </a>
      </div>
    </div>

    <div class="status__row">
      <div class="status__content">
        <p
          class="status__text"
          v-html="statusText"
        ></p>
      </div>
    </div>

    <div
      v-if="canShowMedia"
      class="status__row status__row--media">
      <div class="status__media">
        <img
          v-for="(document, index) in status.media"
          @click="openMediaItem(document)"
          class="status__media-item lazyload"
          :alt="getMediaTitle(document)"
          :title="getMediaTitle(document)"
          :key="index"
          :data-src="getMediaUrl(document)"
          :style="getMediaProperties()"
          :width="getMediaWidth(document)"
          :height="getMediaHeight(document)"
        >
      </div>
    </div>

    <div class="status__row">
      <div class="status__web-intents">
        <a
          v-if="canBeRepliedTo"
          :href="urls.reply"
          class="status__web-intent"
          rel="noreferrer"
          target="_blank"
        >
          <font-awesome-icon icon="reply" />
          <span>Reply</span>
        </a>
        <a
          v-if="canBeRetweeted"
          :href="urls.retweet"
          class="status__web-intent"
          rel="noreferrer"
          target="_blank"
        >
          <font-awesome-icon icon="retweet" />
          <span>Retweet</span>
        </a>
        <a
          v-if="canBeLiked"
          :href="urls.like"
          class="status__web-intent"
          rel="noreferrer"
          target="_blank"
        >
          <font-awesome-icon icon="heart" />
          <span>Like</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api';
import StatusFormat from '../../mixins/status-format';
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  name: 'status',
  mixins: [ApiMixin, StatusFormat],
  props: {
    statusAtFirst: {
      type: Object,
      required: true
    },
    showMedia: {
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
  computed: {
    canShowMedia() {
      return this.status.media && this.status.media.length > 0 && this.showMedia;
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

      return new Date(this.status.publishedAt);
    },
    memberTimelineUrl() {
      if (typeof this.status === 'undefined') {
        return '';
      }

      return `https://twitter.com/${this.status.username}`;
    },
    publisherStyle() {
      if (typeof this.status.avatarUrl === 'undefined') {
        return '';
      }
      const size = '48px';
      return `--avatar-url: center / ${size} no-repeat url("${this.status.avatarUrl}");
      --avatar-size: ${size};
      `;
    },
  },
  data() {
    return {
      errorMessages: SharedState.errors,
      logger: new SharedState.Logger(this.$sentry),
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
  updated() {
    this.status = this.statusAtFirst;
  },
  methods: {
    canBeShared() {
      if (this.$route.name === 'status') {
        return false;
      }

      if (
        this.$route.name === 'aggregate' ||
        this.$route.name === 'aggregate-status' ||
        this.$route.name === 'press-review'
      ) {
        return this.isAuthenticated;
      }

      return this.canBeSharedAtFirst && this.isAuthenticated;
    },
    formatStatusText(status) {
      if (typeof status === 'undefined' || typeof status === 'string') {
        return '';
      }

      let text = this.replaceHyperlinksWithAnchors(status.text);
      text = this.replaceMentionsWithWithAnchors(text);

      return text.replace(/\s/g, ' ');
    },
    replaceHyperlinksWithAnchors(subject) {
      const whitespace = 's';
      const startCharacterClass = '[^\\';
      const pattern = `(http(s?)://${startCharacterClass}${whitespace}]+)`;

      return subject.replace(new RegExp(pattern, 'gi'), matchingText => {
        if (matchingText.indexOf('press-review') !== -1) {
          return matchingText;
        }

        return `<a class="status__text-external-link"
                   rel="noreferrer"
                   target="_blank" href="${matchingText}">${matchingText}</a>`;
      });
    },
    replaceMentionsWithWithAnchors(subject) {
      const whitespace = 's';
      const startCharacterClass = '[^\\';
      const pattern = `(\\${whitespace}?)@(${startCharacterClass}${whitespace}]+)(\\${whitespace}?)`;

      return subject.replace(
        new RegExp(pattern, 'gi'),
        (matchingSubstring, prefix, mention, suffix) => {
          if (matchingSubstring.indexOf('revue-de-presse') !== -1) {
            return matchingSubstring;
          }

          return `${prefix}<a
                     class="status__text-external-link"
                     rel="noreferrer"
                     target="_blank"
                     href="https://twitter.com/${mention}">@${mention}</a>${suffix}`;
        }
      );
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
        'width': 'calc(100% - 1em)',
        'max-height': '80vw',
        'max-width': '90vw',
        'object-fit': 'scale-down'
      };
    },
    getMediaUrl(media) {
      return `${media.url}:small`;
    },
    getMediaHeight(media) {
      return media.sizes.small.h;
    },
    getMediaWidth(media) {
      return media.sizes.small.w;
    },
    getMediaTitle(media) {
      return media.title ? media.title : '';
    },
    goToPermalink(status) {
      this.$router.push({
        name: 'status',
        params: { statusId: status.statusId }
      });
    },
    openMediaItem(document) {
      EventHub.$emit('modal_window.show_intended', { media: document });
    }
  }
};
</script>

<style lang='scss' scoped>
@import './status.scss';
</style>
