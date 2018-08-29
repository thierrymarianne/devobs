import Vuex from 'vuex';
import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import Api from '../../src/modules/axios';
import Styles from '../../src/styles';
import StatusList from '../../src/components/status-list/status-list.vue';
import SharedState from '../../src/modules/shared-state';

const calls = {};
const responseFactory = {
  reply: function (config) {
    calls[`${config.method}|${config.url}`] = config;
    debugger;
    if (config.url == '/press-review') {
      return [200, [{

      }]];
    }

    return [200, {}];
  },
  calls: calls,
};
const mock = new MockAdapter(axios);
mock.onGet(/\/[\S+/]+/).reply(responseFactory.reply);

SharedState.enableTestMode();
console.log(SharedState.isTestModeActive());

const localVue = createLocalVue();

localVue.use(Vuex);
Api.useAxios(localVue);

localVue.component(
  'font-awesome-icon',
  Styles.components['font-awesesome-icon'],
);

SharedState.logLevel.isSilent = true;

describe('Status', () => {
  it('should handle the default aggregate.', () => {
    const statusListWrapper = mount(
      StatusList,
      { localVue },
    );
    expect(statusListWrapper.vm.visibleStatuses.statuses.length).to.equal(1);
  });

  it('should handle empty aggregate.', (done) => {
    SharedState.logLevel.onError = ({ error }) => {
      expect(error).to.equal(SharedState.errors.REQUIRED_COLLECTION);
      done();
    };

    mount(
      StatusList,
      { localVue },
    );
  });
});
