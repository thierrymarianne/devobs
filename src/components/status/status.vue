<template>
  <div class='status'>
    <div class='status__row'>
      <div class='status__publication-date'>{{ publicationDate }}</div>
    </div>
    <div class='status__row'>
      <a 
        class='status__username'
        :href='memberTimelineUrl'
      >@{{ status.username }}</a>
    </div>
    <div class='status__row'>
      <div class='status__avatar-container'>
        <div
          class='status__avatar' 
          :style='"background: center / 24px no-repeat url(" +  status.avatarUrl + ")"'
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
        Reply
      </a>
      <a class='status__web-intent' :href='urls.retweet'>
        <font-awesome-icon icon='retweet' />
        Retweet
      </a>
      <a class='status__web-intent' :href='urls.like'>
        <font-awesome-icon icon='heart' />
        Like
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'status',
  props: {
    status: {
      type: Object,
      required: true,
    },
  },
  computed: {
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
    }
  },
};
</script>

<style lang='scss' scoped>
@import './status.scss';
</style>