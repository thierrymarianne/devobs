<template>
  <div class="member">
    <div class="member__column">
      <div class="member__row">
        <span
          class="member__username"
          @click="goToMember(member.name)"
        >
          @{{ format(member.name) }}
        </span>
        <a
          :href="getMemberProfileUrl(member.name)"
          target="_blank"
          class="member__button-navigate-to-twitter"
        >
          <font-awesome-icon
            :icon="['fab', 'twitter']"
          />
        </a>
      </div>
      <div class="member__row">
        <span class="member__total-statuses">
          ({{ formatTotalStatuses(member) }})
        </span>
        <font-awesome-icon
          v-if="member.locked"
          icon="lock"
          class="member__button-unlock-aggregate"
          @click="unlockAggregate(member, index)"
        />
      </div>
      <div class="member__row">
        <toggler
          :click-handler="selectMember"
          :id="getMemberId(member)"
          :is-selected="member.isSelected"
          label-text="Add to bucket"
        />
      </div>
    </div>
    <div class="member__column">
      <font-awesome-icon
        v-if="canCollectionBeRequested"
        icon="file-download"
        class="member__button-collect-status"
        @click="requestStatusCollection(member.name)"
      />
    </div>
  </div>
</template>

<script>
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import ApiMixin from '../../mixins/api';
import RequestMixin from '../../mixins/request';
import StatusMixin from '../status/status-mixin';
import SharedState from '../../modules/shared-state';
import Toggler from '../toggler/toggler.vue';

export default {
  name: 'member',
  components: { Toggler },
  mixins: [ApiMixin, RequestMixin, StatusMixin],
  props: {
    member: {
      type: Object,
      default: () => {
        return {};
      }
    },
    unlock: {
      type: Function,
      default: () => () => {}
    },
    selectMember: {
      type: Function,
      required: true
    }
  },
  data: () => {
    return {
      logger: SharedState.logger
    };
  },
  methods: {
    canCollectionBeRequested() {
      return !SharedState.getEnvironmentParameters().productionMode;
    },
    format(subject) {
      const capitalizedSubject = `${subject
        .substring(0, 1)
        .toUpperCase()}${subject.substring(1, subject.length)}`;

      return capitalizedSubject.replace('::', '>');
    },
    getMemberId(member) {
      return `member-${member.name}`;
    },
    getMemberProfileUrl(memberName) {
      return `http://twitter.com/${memberName}`;
    },
    goToMember(memberName) {
      this.$router.push({
        name: 'member',
        params: {
          memberName,
          aggregateId: this.$route.params.aggregateId
        }
      });

      EventHub.$emit('member_status.reload_intended');
    },
    requestStatusCollection(memberName) {
      const requestOptions = this.getBaseRequestOptions();
      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      requestOptions.params = {
        aggregateId: this.$route.params.aggregateId,
        memberName
      };

      const action = this.routes.actions.requestStatusCollection;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.logger.info(response);
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    },
    unlockAggregate(member, index) {
      const requestOptions = this.getBaseRequestOptions();
      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      requestOptions.params = {
        aggregateId: this.$route.params.aggregateId,
        memberName: member.name
      };

      const action = this.routes.actions.unlockAggregate;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.logger.info(response);
          this.unlock(index);
        })
        .catch(e => this.logger.error(e.message, 'status-list', e));
    }
  }
};
</script>

<style lang="scss" scoped>
@import './member.scss';
</style>
