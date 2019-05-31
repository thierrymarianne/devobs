<template>
  <div
    v-if="isAuthenticated"
    class="member-list list"
  >
    <div class="list__search">
      <input
        class="list__button list__button-go-to-parent"
        type="button"
        value="Parent"
        @click="goToParent()"
      >
      <label
        class="list__typeahead-label"
        for="typeahead">
        <input
          id="typeahead"
          v-model="keyword"
          class='list__typeahead'
          type="text"
          placeholder="fabpot, dan_abramov, youyuxi"
          @keyup.enter="fetchMembers"
        >
      </label>
      <input
        class="list__button-search"
        type="button"
        value="Search"
        @click="fetchMembers"
      >
      <input
        v-if="previousPageExists()"
        class="list__button"
        type="button"
        value="previous"
        @click="fetchPreviousPage"
      >
      <label
        for="total-pages"
        class="list__total-pages"
      >
        <input
          id="total-pages"
          v-model="pageSize"
          type="number"
        >
      </label>
      <input
        v-if="nextPageExists()"
        class="list__button"
        type="button"
        value="next"
        @click="fetchNextPage"
      >
    </div>
    <div
      class="member-list__selectors"
    >
      <toggler
        id="less-than-ten"
        :click-handler="getMembersHavingLessThanTenStatusesSelector()"
        :do="() => requestBulkStatusCollection()"
        :is-selected="areMembersHavingLessThanTenStatusesSelected"
        :label-text="lessThanLabel"
        icon-name="file-download"
      />
    </div>
    <ul class="list__items">
      <li
        v-for="(member, index) in sortedItems"
        :key="member.name"
        :data-key="member.name"
        class="list__item"
      >
        <member
          :data-index="getOriginalIndexBySortedItemIndex(index)"
          :is-selected="getMemberSelectionIsser(index)"
          :member="member"
          :select-member="getMemberSelector(index)"
          :unlock="getMemberUnlockingCapability(index)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

import ApiMixin from '../../mixins/api';
import RequestMixin from '../../mixins/request';
import StatusMixin from '../status/status-mixin';
import EventHub from '../../modules/event-hub';
import Config from '../../config';
import Member from '../member/member.vue';
import MemberListActions from './store/actions';
import SharedState from '../../modules/shared-state';
import Toggler from '../toggler/toggler.vue';

const { mapActions: mapMemberListActions } = createNamespacedHelpers(
  'member-list'
);

const { mapGetters: mapAuthenticationGetters } = createNamespacedHelpers(
  'authentication'
);

export default {
  name: 'member-list',
  components: { Member, Toggler },
  mixins: [ApiMixin, RequestMixin, StatusMixin],
  props: {
    statusesThreshold: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      items: [],
      logger: SharedState.logger,
      keyword: null,
      pageIndex: 1,
      pageSize: 25,
      totalPages: null,
      selection: {
        lessThan10: false
      },
      sortedItems: []
    };
  },
  computed: {
    ...mapAuthenticationGetters({
      idToken: 'getIdToken',
      isAuthenticated: 'isAuthenticated'
    }),
    areMembersHavingLessThanTenStatusesSelected() {
      return this.selection.lessThan10;
    },
    lessThanLabel() {
      return `Select members with less than ${this.statusesThreshold} statuses`;
    },
    selectedMembers() {
      return this.sortedItems.concat([]).filter(member => member.isSelected);
    }
  },
  watch: {
    items(newItems) {
      this.sortedItems = this.sortItems(newItems);
    }
  },
  destroyed() {
    EventHub.$off('aggregate.reload_intended');
  },
  created() {
    if (!this.isAuthenticated) {
      return;
    }

    EventHub.$off('aggregate.reload_intended');
    EventHub.$on('aggregate.reload_intended', this.fetchMembers);

    this.fetchMembers();
    this.filterMembers();
  },
  methods: {
    ...mapMemberListActions({
      bulkCollectStatuses: MemberListActions.BULK_COLLECT_STATUS
    }),
    previousPageExists() {
      return this.pageIndex > 1;
    },
    nextPageExists() {
      return this.totalPages && this.pageIndex < this.totalPages;
    },
    fetchPreviousPage() {
      this.fetchMembers({ pageIndex: this.pageIndex - 1 });
    },
    fetchNextPage() {
      this.fetchMembers({ pageIndex: this.pageIndex + 1 });
    },
    fetchMembers(params = {}) {
      const requestOptions = this.getBaseRequestOptions();
      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      if (this.keyword) {
        requestOptions.params = {
          keyword: this.keyword
        };
      }

      if (params.pageIndex) {
        if (!('params' in requestOptions)) {
          requestOptions.params = {};
        }

        requestOptions.params.pageIndex = params.pageIndex;
      }

      if (!('params' in requestOptions)) {
        requestOptions.params = {};
      }
      requestOptions.params.aggregateId = this.$route.params.aggregateId;

      if (this.pageSize > 0) {
        requestOptions.params.pageSize = this.pageSize;
      }

      const action = this.routes.actions.fetchMembers;
      const route = `${Config.getSchemeAndHost()}${action.route}`;
      this.$http[action.method](route, requestOptions)
        .then(response => {
          this.items = JSON.parse(response.data).map((member, index) => {
            const notSelectedMember = Object.assign({}, member);
            notSelectedMember.isSelected = false;
            notSelectedMember.index = index;
            return notSelectedMember;
          });
          this.totalPages = parseInt(response.headers['x-total-pages'], 10);
          this.pageIndex = parseInt(response.headers['x-page-index'], 10);
        })
        .catch(e => this.logger.error(e.message, 'member-list', e));
    },
    filterMembers() {
      const filteredMembers = this.sortedItems.concat([]);

      if (this.selection.lessThan10) {
        filteredMembers.forEach((member, index) => {
          if (member.totalStatuses < this.statusesThreshold) {
            this.selectMember(member.name, index);
          }
        });
        return;
      }

      filteredMembers.forEach((member, index) => {
        return this.unselectMember(member.name, index);
      });
    },
    getMemberSelectionIsser(index) {
      const members = this.items;

      return () => {
        const member = members[this.getOriginalIndexBySortedItemIndex(index)];
        return this.isMemberSelected(member);
      };
    },
    goToParent() {
      this.$router.push({
        name: 'lists'
      });

      EventHub.$emit('aggregate_list.reload_intended');
    },
    getMemberUnlockingCapability(index) {
      return () => {
        this.items[index].locked = false;
      };
    },
    isMemberSelected(member) {
      if (typeof member.isSelected === 'undefined') {
        return false;
      }

      return member.isSelected;
    },
    getMemberSelector(index) {
      return ($event, updateSelection) => {
        const memberName = $event.itemId.replace('member-', '');

        const member = this.items[
          this.getOriginalIndexBySortedItemIndex(index)
        ];
        const shouldSelectMember = !this.isMemberSelected(member);
        updateSelection(shouldSelectMember);

        if (shouldSelectMember) {
          this.selectMember(memberName, index);
          return;
        }

        this.unselectMember(memberName, index);
      };
    },
    getMembersHavingLessThanTenStatusesSelector() {
      return ($event, updateSelection) => {
        const areMembersSelected = this.selection.lessThan10;
        const shouldSelectMembers = !areMembersSelected;
        updateSelection(shouldSelectMembers);

        this.selection.lessThan10 = shouldSelectMembers;

        this.filterMembers();
      };
    },
    getOriginalIndexBySortedItemIndex(index) {
      const sortedItem = this.sortedItems[index];
      let originalIndex = -1;
      this.items.forEach((item, itemIndex) => {
        if (item.name === sortedItem.name) {
          originalIndex = itemIndex;
        }
      });
      return originalIndex;
    },
    requestBulkStatusCollection() {
      const requestOptions = this.getBaseRequestOptions();
      const headerName = Object.keys(requestOptions.headers)[0];
      this.$http.defaults.headers.common[headerName] =
        requestOptions.headers[headerName];

      requestOptions.params = {
        aggregateId: this.$route.params.aggregateId,
        membersNames: this.selectedMembers.map(member => member.name)
      };

      const action = this.routes.actions.bulkRequestStatusCollection;

      this.bulkCollectStatuses({
        $http: this.$http,
        method: action.method,
        route: `${Config.getSchemeAndHost()}${action.route}`,
        requestOptions,
        onSuccess: response => {
          this.logger.info(response);
        },
        onFailure: e => this.logger.error(e.message, 'status-list', e)
      });
    },
    selectMember(memberName, index) {
      this.items[
        this.getOriginalIndexBySortedItemIndex(index)
      ].isSelected = true;
    },
    sortItems(items) {
      const sortedItems = items.concat([]);
      sortedItems.sort((firstItem, secondItem) => {
        if (secondItem.totalStatuses === firstItem.totalStatuses) {
          return 0;
        }

        if (secondItem.totalStatuses > firstItem.totalStatuses) {
          return -1;
        }

        return 1;
      });

      return sortedItems;
    },
    unselectMember(memberName, index) {
      this.items[
        this.getOriginalIndexBySortedItemIndex(index)
      ].isSelected = false;
    }
  }
};
</script>

<style lang='scss' scoped>
@import './member-list.scss';
</style>
