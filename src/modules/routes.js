import StatusList from '../components/status-list/status-list.vue';

const defaultRedirect = '/press-review';
export default [
  {
    path: '/',
    redirect: defaultRedirect
  },
  {
    component: StatusList,
    path: '/press-review',
    name: 'press-review'
  },
  {
    component: StatusList,
    path: '/bucket',
    name: 'bucket'
  },
  {
    component: StatusList,
    path: '/aggregate/:aggregateType',
    name: 'aggregate'
  },
  {
    component: StatusList,
    path: '/aggregate/:aggregateType/:statusId',
    name: 'status'
  },
  {
    path: '*',
    redirect: defaultRedirect
  }
];
