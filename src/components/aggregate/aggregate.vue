<template>
  <div class="aggregate">
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
    <div
      class="aggregate__label"
      @click="labelClickHandler"
    >
      <span
        :class="aggregateClasses"
        :ref="refName"
        @keyup.esc="makeNonEditable(refName)"
      >{{ format(aggregate.name) }}
      </span>
      ({{ formatTotalMembers(aggregate) }})
      ({{ formatTotalStatuses(aggregate) }})
    </div>
    <font-awesome-icon
      icon="door-open"
      class="aggregate__button-enter"
      @click="clickHandler(aggregate.id)"
    />
  </div>
</template>

<script>
import MemberMixin from '../member/member-mixin';
import StatusMixin from '../status/status-mixin';

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
    }
  },
  data() {
    return { state: { beingEdited: false } };
  },
  computed: {
    aggregateClasses() {
      if (!this.isUnderEdition) {
        return {};
      }

      return { 'aggregate__name-under-edition': true };
    },
    isUnderEdition() {
      if (typeof this.state !== 'undefined') {
        return false;
      }

      return this.state.beingEdited === true;
    },
    labelClickHandler() {
      if (this.isUnderEdition) {
        return () => {};
      }

      return () => this.clickHandler(this.aggregate.id);
    }
  },
  methods: {
    format(subject) {
      const capitalizedSubject = `${subject
        .substring(0, 1)
        .toUpperCase()}${subject.substring(1, subject.length)}`;

      return capitalizedSubject.replace('::', '>');
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
