<template>
  <div :class="aggregateClasses">
    <div class="aggregate__label">
      <div class="aggregate__row">
        <input
          :class="aggregateNameClasses"
          :ref="refName"
          :readonly="!isUnderEdition"
          :title="aggregateName"
          v-model="aggregateName"
          type="text"
          @keyup.esc="makeNonEditable(refName)"
        >
        <div class="aggregate__buttons">
          <font-awesome-icon
            v-if="isUnderEdition"
            :data-aggregate="aggregate.beingEdited"
            icon="check"
            class="aggregate__button-validate-name-edition"
            @click="makeNonEditable(refName)"
          />
          <font-awesome-icon
            v-else
            icon="pen"
            class="aggregate__button-edit-name"
            @click="makeEditable(refName)"
          />
        </div>
        <font-awesome-icon
          :class='membersClasses'
          icon="users"
          @click="clickHandler(aggregate.id)"
        />
      </div>
      <span class="aggregate__numbers">
        ({{ formatTotalMembers(aggregate) }})
        ({{ formatTotalStatuses(aggregate) }})
      </span>
      <div class="aggregate__row--last">
        <label
          :for="aggregate.id"
          class="aggregate__label-select-aggregate"
        >
          <input
            v-model="state.isAggregateSelected"
            :id="aggregate.id"
            :name="aggregate.id"
            class="aggregate__button-select-aggregate"
            type="checkbox"
          >
          <span
            class="aggregate__label-select-aggregate-text"
          >Add to bucket</span>
        </label>
        <span
          class="aggregate__navigate-to-list"
        >
          <a
            :href='formatListUrl(aggregate)'
            class="aggregate__list-anchor"
            target="_blank"
          >
            <font-awesome-icon
              :icon="['fab', 'twitter']"
              class="aggregate__list-twitter-icon"
            />
          </a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import MemberMixin from '../member/member-mixin';
import StatusMixin from '../status/status-mixin';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'aggregate',
  mixins: [MemberMixin, StatusMixin],
  props: {
    aggregate: {
      type: Object,
      required: true
    },
    clickHandler: {
      type: Function,
      required: true
    },
    refName: {
      type: Number,
      required: true
    },
    isGridCell: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      state: {
        beingEdited: false,
        isAggregateSelected: false
      }
    };
  },
  computed: {
    ...mapAuthenticationGetters(['getProfile']),
    aggregateClasses() {
      const classes = { aggregate: true };

      if (this.state.isAggregateSelected) {
        classes['aggregate--is-selected'] = true;
      }

      return classes;
    },
    aggregateNameClasses() {
      if (!this.isUnderEdition) {
        return { aggregate__name: true };
      }

      return { 'aggregate__name-under-edition': true };
    },
    isUnderEdition() {
      if (typeof this.state === 'undefined') {
        return false;
      }

      return this.state.beingEdited === true;
    },
    aggregateName() {
      return this.format(this.aggregate.name);
    },
    membersClasses() {
      const classes = { 'aggregate__button-enter': true };

      if (this.aggregate.totalMembers === 0) {
        classes['aggregate__button-enter--hidden'] = true;
      }

      return classes;
    }
  },
  methods: {
    format(subject) {
      const capitalizedSubject = `${subject
        .substring(0, 1)
        .toUpperCase()}${subject.substring(1, subject.length)}`;

      return capitalizedSubject.replace('::', '>');
    },
    formatListUrl(subject) {
      return `https://twitter.com/${
        this.getProfile.username
      }/lists/${subject.name.replace(' :: ', '-')}`;
    },
    makeEditable(ref) {
      const editable = this.$refs[ref];

      if (!this.isUnderEdition) {
        editable.setAttribute('contenteditable', 'true');
      }
      this.$set(this.state, 'beingEdited', true);
    },
    makeNonEditable(ref) {
      const editable = this.$refs[ref];
      editable.removeAttribute('contenteditable');
      this.$set(this.state, 'beingEdited', false);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './aggreggate.scss';
</style>
