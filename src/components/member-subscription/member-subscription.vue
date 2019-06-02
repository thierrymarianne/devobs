<template>
  <div :class="classes" @mouseover="showTitle()" @mouseout="hideTitle()">
    <div class="member-subscription__description-wrapper">
      <p
        v-show="shouldDescriptionBeVisible"
        class="member-subscription__description"
        v-html="parseDescription(subscription.description)"
      ></p>
    </div>
    <div class="member-subscription__row">
      <template v-if="subscription.url">
        <a
          :href="subscription.url"
          class="member-subscription__url"
          target="__blank"
        >
          <span class="member-subscription__username">{{
            subscription.username
          }}</span>
        </a>
      </template>
      <span v-else class="member-subscription__username">{{
        subscription.username
      }}</span>
    </div>
    <div class="member-subscription__row">
      <div
        class="member-subscription__row member-subscription__row--actionable"
      >
        <anchored-icon
          v-if="subscription.username"
          :icons="['fab', 'twitter']"
          :url="formatMemberProfileUrl(subscription.username)"
          :anchor-classes="{}"
          :icon-classes="{}"
          :wrapper-classes="{
            'member-subscription__anchored-icon-wrapper': true
          }"
        />
        <a
          :href="formatMemberProfileUrl(subscription.username)"
          class="member-subscription__external-link"
          target="_blank"
          >Go to profile</a
        >
      </div>
    </div>
    <div
      class="member-subscription__row member-subscription__row--actionable"
      @click="() => refreshMember(subscription.username)"
    >
      <anchored-icon
        :icons="['fas', 'sync']"
        :anchor-classes="{}"
        :icon-classes="{}"
        :wrapper-classes="{
          'member-subscription__anchored-icon-wrapper': true
        }"
      />
      <span class="member-subscription__refresh-member-profile"
        >Refresh profile</span
      >
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
    AnchoredIcon
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
