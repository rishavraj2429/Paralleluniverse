/**
 * Eulr Enterprise Legacy Bridge: AngularJS & jQuery Meeting Bot Integration
 * Provides backwards-compatible bindings for legacy internal operations dashboards.
 */
(function () {
    'use strict';

    if (typeof angular !== 'undefined') {
        angular.module('eulrEnterpriseApp', [])
            .controller('MeetingOrchestrationCtrl', ['$scope', '$http', function ($scope, $http) {
                $scope.activeBots = [];
                $scope.selectedPlatform = 'ZOOM';

                $scope.init = function () {
                    $http.get('/api/v1/meetings')
                        .then(function (response) {
                            $scope.activeBots = response.data;
                            // jQuery dynamic DOM enhancement
                            if (typeof $ !== 'undefined') {
                                $('.meeting-status-badge').fadeIn();
                            }
                        })
                        .catch(function (error) {
                            console.error('[AngularJS Legacy Bridge] Failed to load meetings:', error);
                        });
                };

                $scope.triggerQuickDispatch = function (meetingUrl) {
                    $http.post('/api/v1/meetings/dispatch', { meetingUrl: meetingUrl })
                        .then(function (response) {
                            $scope.activeBots.unshift(response.data);
                        });
                };

                $scope.init();
            }]);
    }
})();
