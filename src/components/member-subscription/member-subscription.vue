<template>
  <div :class="classes" @mouseover="showTitle()" @mouseout="hideTitle()">
    <div class="member-subscription__description-wrapper">
      <p
        v-show="shouldDescriptionBeVisible"
        class="member-subscription__description"
        v-html="parseDescription(subscription.description)"
      ></p>
    </div>
    <div v-if="subscription.username" class="member-subscription__row">
      <labelled-icon
        :icon="['fab', 'twitter']"
        :label="subscription.username"
        :url="formatMemberProfileUrl(subscription.username)"
      />
    </div>
    <div class="member-subscription__row">
      <labelled-icon
        :icon="['fas', 'sync']"
        :click-handler="() => refreshMember(subscription.username)"
        label="Refresh profile"
      />
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import AnchoredIcon from '../anchored-icon/anchored-icon.vue';
import ApiMixin from '../../mixins/api';
import AuthenticationHeadersMixin from '../../mixins/authentication-headers';
import Config from '../../config';
import EmojiParser from '../../modules/emoji-parser';
import Errors from '../../modules/errors';
import EventHub from '../../modules/event-hub';
import LabelledIcon from '../labelled-icon/labelled-icon.vue';
import MemberSubscriptionActions from './store/actions';
import SharedState from '../../modules/shared-state';

const { mapActions: mapMemberSubscriptionActions } = createNamespacedHelpers(
  'member-subscription'
);

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-subscription',
  components: {
    AnchoredIcon,
    LabelledIcon
  },
  mixins: [ApiMixin, AuthenticationHeadersMixin, EmojiParser],
  props: {
    subscription: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      logger: SharedState.logger,
      requiresUpdate: false,
      isDescriptionVisible: false
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken'
    }),
    classes() {
      return {
        'member-subscription': true,
        'member-subscription--requiring-update': this.requiresUpdate,
        'member-subscription--having-description': this.hasDescription
      };
    },
    hasDescription() {
      return (
        this.subscription.description &&
        this.subscription.description.length > 0
      );
    },
    shouldDescriptionBeVisible() {
      if (!this.hasDescription) {
        return false;
      }

      return this.isDescriptionVisible;
    }
  },
  methods: {
    ...mapMemberSubscriptionActions({
      refreshMemberProfile: MemberSubscriptionActions.REFRESH_MEMBER_PROFILE
    }),
    formatMemberProfileUrl(memberName) {
      return `https://twitter.com/${memberName}`;
    },
    hideTitle() {
      this.isDescriptionVisible = false;
    },
    parseDescription(description) {
      try {
        return this.parseTextForEmojis(description);
      } catch (error) {
        if (error instanceof Errors.InvalidEmoji) {
          this.requiresUpdate = true;

          return description;
        }

        throw error;
      }
    },
    refreshMember(memberName) {
      const action = this.routes.actions.refreshMemberProfile;
      const requestOptions = this.setUpCommonHeaders();
      requestOptions.params = { memberName };

      this.refreshMemberProfile({
        $http: this.$http,
        method: action.method,
        route: `${Config.getSchemeAndHost()}${action.route}`,
        requestOptions,
        onSuccess: () => {
          EventHub.$emit('member_subscription_list.reload_intended');
        },
        onFailure: e => this.logger.error(e.message, 'member-subscription', e)
      });
    },
    showTitle() {
      if (this.subscription.description.length === 0) {
        return;
      }

      this.isDescriptionVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './member-subscription.scss';
</style>
