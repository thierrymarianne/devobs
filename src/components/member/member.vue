<template>
  <div class="member">
    <div class="member__column">
      <div class="member__row">
        <span class="member__username" @click="goToMember(member.name)">
          @{{ format(member.name) }}
        </span>
      </div>
      <div class="member__row">
        <span class="member__total-statuses">
          ({{ formatTotalStatuses(member) }})
        </span>
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
      <anchored-icon
        v-bind="twitterAnchorClasses"
        :icons="['fab', 'twitter']"
        :url="getMemberProfileUrl(member.name)"
      />
      <action-icon
        :click-handler="() => unlockAggregate(member, index)"
        :icons="['fa', 'lock']"
        v-bind="unlockAggregateButtonClasses(member)"
      />
      <action-icon
        v-if="canCollectionBeRequested"
        :click-handler="() => requestStatusCollection(member.name)"
        :icons="['fa', 'file-download']"
        :button-classes="{ 'member__button-collect-status': true }"
      />
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import AuthenticationHeadersMixin from '../../mixins/authentication-headers';
import ActionIcon from '../action-icon/action-icon.vue';
import AnchoredIcon from '../anchored-icon/anchored-icon.vue';
import Config from '../../config';
import EventHub from '../../modules/event-hub';
import ApiMixin from '../../mixins/api';
import StatusMixin from '../status/status-mixin';
import SharedState from '../../modules/shared-state';
import Toggler from '../toggler/toggler.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member',
  components: { ActionIcon, AnchoredIcon, Toggler },
  mixins: [ApiMixin, AuthenticationHeadersMixin, StatusMixin],
  props: {
    member: {
      type: Object,
      default: () => ({})
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
  data: () => ({
    logger: SharedState.logger
  }),
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken'
    }),
    twitterAnchorClasses() {
      return {
        'anchor-classes': { 'member__button-navigate-to-twitter': true },
        'wrapper-classes': {
          'member__button-navigate-to-twitter-wrapper': true
        },
        'icon-classes': { 'member__button-navigate-to-twitter-icon': true }
      };
    }
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
      const requestOptions = this.setUpCommonHeaders();
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
    isMemberLocked(member) {
      return member.locked;
    },
    unlockAggregateButtonClasses(member) {
      return {
        'button-classes': {
          'member__button-unlock-aggregate': true,
          'member__button-unlock-aggregate--invisible': !this.isMemberLocked(member)
        }
      };
    },
    unlockAggregate(member, index) {
      if (!this.isMemberLocked(member)) {
        return;
      }

      const requestOptions = this.setUpCommonHeaders();
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
