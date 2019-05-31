import Actions from './actions';

const MemberList = {
  namespaced: true,
  actions: {
    [Actions.BULK_COLLECT_STATUS](
      _,
      { $http, method, route, requestOptions, onSuccess, onFailure }
    ) {
      $http[method](route, requestOptions)
        .then(onSuccess)
        .catch(onFailure);
    }
  }
};

export default MemberList;
