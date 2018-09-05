import StatusList from '../components/status-list/status-list.vue';

const defaultRedirect = '/status-list';
export default [
  {
    path: '/',
    redirect: defaultRedirect
  },
  {
    component: StatusList,
    path: '/status-list',
    name: 'status-list'
  },
  {
    path: '*',
    redirect: defaultRedirect
  }
];
