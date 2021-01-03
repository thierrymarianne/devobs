import he from "he";
import EmojiConvertor from "emoji-js";

import EventHub from "../modules/event-hub";
import Errors from "../modules/errors";

export default {
  methods: {
    filterStatuses: function(statuses, filterType) {
      if (typeof filterType === "undefined" || filterType === null) {
        return statuses;
      }

      let filteredStatuses;

      if (typeof filterType === "function") {
        filteredStatuses = Object.values(statuses).filter(filterType);

        if (filteredStatuses.length === 0) {
          throw new Errors.NoRemainingStatusAfterApplyingFilter();
        }

        return filteredStatuses;
      }

      if (filterType === "media") {
        const filter = status => status.media && status.media.length > 0;
        filteredStatuses = Object.values(statuses).filter(filter);
        if (filteredStatuses.length === 0) {
          EventHub.$emit("status_list.apologize_about_empty_list_intended");
          return Object.values(statuses);
        }

        return filteredStatuses;
      }

      if (filterType === "top100") {
        filteredStatuses = Object.values(Object.assign({}, statuses));
        const sortByRetweet = (firstStatus, secondStatus) => {
          if (firstStatus.totalRetweet === secondStatus.totalRetweet) {
            return 0;
          }

          if (firstStatus.totalRetweet < secondStatus.totalRetweet) {
            return 1;
          }

          return -1;
        };

        return filteredStatuses.sort(sortByRetweet).slice(0, 10);
      }

      return statuses;
    },
    formatStatus(status) {
      const formattedStatuses = this.formatStatuses([status]);
      return formattedStatuses[0];
    },
    formatStatuses: function(statuses) {
      if (typeof statuses === "undefined" || statuses === null) {
        return [];
      }

      let formattedStatuses = [];

      if (typeof statuses.forEach !== "function") {
        throw Error(this.errorMessages.REQUIRED_COLLECTION);
      }

      statuses.forEach(status => {
        if (
          typeof status === "undefined" ||
          (typeof status.text === "undefined" &&
            typeof status.full_text === "undefined")
        ) {
          return;
        }

        if (typeof status.full_text !== "undefined") {
          status.text = status.full_text;
        }

        if (typeof status.text.match !== "function") {
          return;
        }

        let links = status.text.match(/http(?:s)?:\/\/\S+/g);

        if (links === null || links === undefined || links.length <= 1) {
          links = [];
        }

        let aggregate;
        if (
          this.$route.name === "press-review" ||
          this.$route.name === "status"
        ) {
          aggregate = this.$route.name;
        }
        if (this.$route.name === "aggregate") {
          aggregate = this.$route.params.aggregateType;
        }

        const formattedStatus = {
          inAggregate: aggregate,
          username: status.username,
          avatarUrl: status.avatar_url,
          publishedAt: new Date(status.published_at),
          statusId: status.status_id,
          text: this.parseFromString(status.text),
          url: status.url,
          isVisible: false,
          media: status.media,
          totalRetweet: status.retweet_count,
          totalLike: status.favorite_count,
          links
        };

        if (status.status_replied_to) {
          formattedStatus.statusRepliedTo = this.formatStatuses([
            status.status_replied_to
          ])[0];
        }

        formattedStatus.retweet = status.retweet;
        if (status.retweet) {
          formattedStatus.usernameOfRetweetingMember =
            status.username_of_retweeting_member;
        }

        if (status.liked_by) {
          formattedStatus.likedBy = status.liked_by;
        }

        formattedStatuses.push(formattedStatus);
      });

      formattedStatuses = formattedStatuses.sort(this.sortByPublicationDate);
      formattedStatuses = formattedStatuses.reduce(
        (statusCollection, status) => {
          statusCollection.indexOf(status);
          statusCollection[
            statusCollection.indexOf(status)
          ].key = statusCollection.indexOf(status);
          return statusCollection;
        },
        formattedStatuses
      );

      return formattedStatuses;
    },
    sortByPublicationDate: function(statusA, statusB) {
      if (statusA.publishedAt === statusB.publishedAt) {
        return 0;
      }

      if (statusA.publishedAt < statusB.publishedAt) {
        return 1;
      }

      return -1;
    },
    // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
    parseFromString: function(subject) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(
        `<!doctype html><body>${subject}</body>`,
        "text/html"
      );
      const parsedSubject = he.escape(dom.body.textContent);
      const emoji = new EmojiConvertor();

      // @see https://github.com/iamcal/emoji-data
      emoji.img_sets.apple.path = `https://${process.env.API_HOST}/emoji-data/img-apple-64/`;
      return emoji.replace_unified(parsedSubject);
    }
  }
};
