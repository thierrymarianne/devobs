import Actions from './actions';

const MemberSubscription = {
  namespaced: true,
  actions: {
    [Actions.REFRESH_MEMBER_PROFILE](
      _,
      { $http, method, route, requestOptions, onSuccess, onFailure }
    ) {
      $http[method](route, requestOptions)
        .then(onSuccess)
        .catch(onFailure);
    }
  }
};

export default MemberSubscription;
