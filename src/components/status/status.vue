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
        v-else
        class='status__web-intent'
        @click='removeFromBucket'
      >
        <font-awesome-icon icon='minus' />
        <span>Remove from bucket</span>
      </button>
    </div>
  </div>
</template>

<script>
import EventHub from '../../modules/event-hub';
import SharedState from '../../modules/shared-state';

export default {
  name: 'status',
  props: {
    status: {
      type: Object,
      required: true,
    },
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
      return SharedState.state.visibleStatuses.name === "bucket";
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
      addedToBucket: this.status.isInBucket,
    };
  },
  methods: {
    removeFromBucket: function () {
      this.removeStatusFromBucket();
      EventHub.$emit('status_list.intent_to_refresh_bucket');
    },
    removeStatusFromBucket: function () {
      EventHub.$emit('status.removed_from_bucket', { status: this.status });
      this.addedToBucket = !this.addedToBucket;      
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