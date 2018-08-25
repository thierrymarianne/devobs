<template>
  <div class='status-list'>
    <ul class='status-list__list'>
      <li v-for='status in statuses' class='status-list__item'>
        <div class='status-list__status'>
          <span class='status-list__text'>{{ status.text }}</span>
          <div class='status-list__url-list'>
            <a class='status-list__url' :href='status.url'>Permalink</a>
            <a class='status-list__url' v-for='link in status.links' :href='link'>{{ link }}</a>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import ApiMixin from '../../mixins/api';

export default {
  mixins: [ApiMixin],
  name: 'status-list',
  created: function () {
    this.$http.get(this.routes.showLatestStatuses)
    .then(response => {
      this.statuses = this.formatStatuses(response.data);
    })
    .catch(e => {
      this.errors.push(e)
    })
  },
  methods: {
    formatStatuses: function (statuses) {

      if (typeof statuses === 'undefined' || statuses === null) {
        return [];
      }

      const formattedStatuses = [];

      statuses.forEach((status) => {
        const links = status.text.match(/http(?:s)?:\/\/\S+/);
        formattedStatuses.push({
          publishedAt: new Date(status.published_at),
          text: this.parseFromString(status.text),
          url: status.url,
          links
        });
      });

      formattedStatuses.sort(this.sortByPublicationDate);


      return formattedStatuses;
    },
    sortByPublicationDate: function (statusA, statusB) {
      if (statusA.publishedAt === statusB.publishedAt) {
        return 0;
      }

      return statusA.publishedAt < statusB.publishedAt;
    },
    // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
    parseFromString: function (subject) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(
          '<!doctype html><body>' + subject,
          'text/html');
      return dom.body.textContent;
    },
  },
  data: function () {
    return {
      errors: [],
      statuses: null,
      formattedStatuses: null
    };
  },
}
</script>

<style scoped>
@import './status-list.scss';
</style>