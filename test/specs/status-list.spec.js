import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { expect } from 'chai';
import { createLocalVue, mount } from '@vue/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import Api from '../../src/modules/axios';
import Styles from '../../src/styles';

import EventHub from '../../src/modules/event-hub';
import SharedState from '../../src/modules/shared-state';
import routes from '../../src/modules/routes';
import store from '../../src/store';
import StatusList from '../../src/components/status-list/status-list.vue';

const calls = {};
const responder = {
  reply() {},
  calls
};

const router = new VueRouter({
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
});

const mockApi = responseFactory => {
  const mock = new MockAdapter(axios, { delayResponse: 0 });
  mock.onGet(/\/[\S+/]+/).reply(responseFactory.reply);

  const localVue = createLocalVue();

  localVue.use(Vuex);
  localVue.use(VueRouter);

  Api.useAxios(localVue);

  localVue.component(
    'font-awesome-icon',
    Styles.components['font-awesesome-icon']
  );

  return localVue;
};

SharedState.logLevel.isSilent = true;

const avatarUrl = 'http://bit.ly/jasmine-bdd';

describe('Status list', () => {
  it('should handle empty aggregate.', () => {
    responder.reply = () => [200, {}];
    const localVue = mockApi(responder);

    const statusListWrapper = mount(StatusList, {
      localVue,
      router,
      store
    });

    statusListWrapper.vm.$destroy();
    statusListWrapper.vm.$el.remove();
  });

  it('should handle the default aggregate.', () => {
    let statusListWrapper;

    SharedState.logLevel.onError = () => {};

    responder.reply = config => {
      if (config.url === '/press-review') {
        return [
          200,
          [
            {
              avatar_url: avatarUrl,
              text: '',
              published_at: new Date()
            }
          ]
        ];
      }
      return [404];
    };
    const localVue = mockApi(responder);

    EventHub.$on('status_list.after_fetch', () => {
      expect(typeof statusListWrapper.vm.visibleStatuses.statuses).to.equal(
        'object'
      );
      expect(
        Object.keys(statusListWrapper.vm.visibleStatuses.statuses).length
      ).to.equal(1);
    });

    statusListWrapper = mount(StatusList, {
      attachToDocument: true,
      localVue,
      router,
      store
    });

    statusListWrapper.vm.$destroy();
    statusListWrapper.vm.$el.remove();
  });
});
