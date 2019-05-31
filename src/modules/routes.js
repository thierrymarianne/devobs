import Admin from '../components/admin/admin.vue';
import AggregateList from '../components/aggreggate-list/aggreggate-list.vue';
import Callback from '../components/authentication/callback.vue';
import KeywordList from '../components/keyword-list/keyword-list.vue';
import HighlightList from '../components/highlight-list/highlight-list.vue';
import MemberList from '../components/member-list/member-list.vue';
import MemberStatusList from '../components/member-status-list/member-status-list.vue';
import StatusList from '../components/status-list/status-list.vue';
import Time from './time';

const defaultRedirect = `/highlights/${Time.today()}/${Time.today()}`;

export default [
  {
    path: '/',
    redirect: defaultRedirect
  },
  {
    component: HighlightList,
    path: '/highlights/:startDate/:endDate',
    name: 'highlights'
  },
  {
    component: HighlightList,
    path: '/highlights/private/:startDate/:endDate',
    name: 'private-highlights'
  },
  {
    component: Admin,
    name: 'admin',
    path: '/admin',
    children: [
      {
        component: KeywordList,
        path: 'keywords/:startDate/:endDate',
        name: 'keywords'
      },
      {
        component: AggregateList,
        path: 'lists',
        name: 'lists'
      },
      {
        component: AggregateList,
        path: 'lists/:keywords',
        name: 'searched-lists'
      },
      {
        component: MemberList,
        path: 'list/:aggregateId',
        name: 'list'
      },
      {
        component: MemberStatusList,
        path: 'member/:aggregateId/:memberName',
        name: 'member'
      },
      {
        component: Callback,
        path: 'callback',
        name: 'authentication-callback'
      },
      {
        component: StatusList,
        path: 'timeline',
        children: [
          {
            path: 'press-review',
            name: 'press-review'
          },
          {
            path: 'bucket',
            name: 'bucket'
          },
          {
            path: 'aggregate/:aggregateType',
            name: 'aggregate'
          },
          {
            path: 'aggregate/:aggregateType/:statusId',
            name: 'aggregate-status'
          },
          {
            path: 'status/:statusId',
            name: 'status'
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: defaultRedirect
  }
];
