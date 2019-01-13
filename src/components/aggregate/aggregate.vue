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
      </div>
      <div class="aggregate__numbers">
        <div>
          {{ formatTotalMembers(aggregate) }}
          <font-awesome-icon
            :class='membersClasses'
            icon="users"
            @click="clickHandler(aggregate.id)"
          />
        </div>
        {{ formatTotalStatuses(aggregate) }}
      </div>
      <div class="aggregate__row--last">
        <toggler
          :click-handler="selectAggregate"
          :id="getAggregateId(aggregate)"
          :is-selected="state.isAggregateSelected"
          label-text="Add to bucket"
        />
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
import EventHub from '../../modules/event-hub';
import Toggler from '../toggler/toggler.vue';

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'aggregate',
  components: { Toggler },
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
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      state: {
        beingEdited: false,
        isAggregateSelected: this.isSelected
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
      const classes = { 'aggregate__button-list-members': true };

      if (this.aggregate.totalMembers === 0) {
        classes['aggregate__button-list-members--hidden'] = true;
      }

      return classes;
    }
  },
  watch: {
    isSelected(isSelected) {
      if (isSelected !== this.state.isAggregateSelected) {
        this.state.isAggregateSelected = isSelected;
      }
    }
  },
  methods: {
    format(subject) {
      if (typeof subject === 'undefined') {
        return '';
      }

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
    getAggregateId(aggregate) {
      return `aggregate-${aggregate.id}`;
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
    },
    selectAggregate(event, updateToggling) {
      if (event.target.getAttribute('type')) {
        const isSelected = !this.state.isAggregateSelected;
        EventHub.$emit('aggregate.selected', {
          index: this.refName,
          isSelected
        });
        updateToggling(isSelected);
        this.state.isAggregateSelected = isSelected;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import './aggreggate.scss';
</style>
