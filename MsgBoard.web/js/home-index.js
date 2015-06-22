/// <reference path="E:\Projects\PSight2\MsgBoard.web\templates/newTopicView.html" />
var homeIndexModule = angular.module("homeIndex", ['ngRoute', 'ui.bootstrap']);


homeIndexModule.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/", {
        controller: "topicsController",
        templateUrl: "/templates/topicsView.html"
    });

    $routeProvider.when("/newMessage", {
        controller: "newTopicController",
        templateUrl: "/templates/newTopicView.html"
    });

    $routeProvider.when("/message/:id", {
        controller: "singleTopicController",
        templateUrl: "/templates/singleTopicView.html"
    });
    $routeProvider.when("/update/:id", {
        controller: "updateTopicController",
        templateUrl: "/templates/UpdateTopic.html"
    });

    $routeProvider.otherwise({ redirectTo: "/" });
}]);

homeIndexModule.factory("dataService", ["$http", "$q", function ($http, $q) {
    var topics = [];
    var isInit = false;

    var isReady = function () {
        return isInit;
    };

    var getTopics = function () {
        var deferred = $q.defer();
        $http.get("/api/topics?includeReplies=true")
            .then(function (result) {
                // success
                angular.copy(result.data, topics);
                deferred.resolve();
                isInit = true;
            },
                function () {
                    // error
                    deferred.reject();
                });

        return deferred.promise;
    };

    var addTopic = function (newTopic) {
        var deferred = $q.defer();

        $http.post("/api/topics", newTopic)
          .then(function (result) {
              //success
              var newlyCreatedTopic = result.data;
              topics.splice(0, 0, newlyCreatedTopic);
              deferred.resolve(newlyCreatedTopic);
          },
          function () {
              //error
              deferred.reject();
          });

        return deferred.promise;

    };

    function findTopic(id) {
        var found = null;

        $.each(topics, function (i, item) {
            if (item.id == id) {
                found = item;
                return false;
            }
        });
        return found;
    }

    var getTopicById = function (id) {
        var deferred = $q.defer();

        if (isReady()) {
            var topic = findTopic(id);
            if (topic) {
                deferred.resolve(topic);
            } else {
                deferred.reject();
            }
        } else {
            getTopics()
                .then(function () {
                    //success
                    getTopicById(id);
                    var topic = findTopic(id);
                    if (topic) {
                        deferred.resolve(topic);
                    } else {
                        deferred.reject();
                    }
                }, function () {
                    //error
                    deferred.reject();
                });
        }
        return deferred.promise;
    };

    var saveReply = function (topic, newReply) {
        var deferred = $q.defer();

        $http.post("/api/topics/" + topic.id + "/replies", newReply)
            .then(function (result) {
                //success
                if (topic.replies == null) topic.replies = [];
                topic.replies.push(result.data);
                deferred.resolve();
            }, function () {
                //error
                deferred.reject();
            });

        return deferred.promise;


    };

    var deleteTopic = function (id, idx) {
        var deferred = $q.defer();
        var topic = findTopic(id);

        $http.delete("/api/topics/" + id)
          .then(function (result) {
              //success
              //  var newlyCreatedTopic = result.data;
              topics.splice(idx, 1);
              deferred.resolve(topic);
          },
          function () {
              //error
              deferred.reject();
          });

        return deferred.promise;

    };

    var updateTopic = function (topic) {
        var deferred = $q.defer();
       // topic.body = topic.newBody;
        $http.put("/api/topics/" + topic.id, topic)
        .then(function (result) {
            var t = findTopic(topic.id);
            t.body = topic.body;
            t.title = topic.title;
             deferred.resolve();
        },
        function () {
            deferred.reject; 
        });
        return deferred.promise; 
    };

    return {
        topics: topics,
        getTopics: getTopics,
        addTopic: addTopic,
        isReady: isReady,
        getTopicById: getTopicById,
        saveReply: saveReply,
        deleteTopic: deleteTopic,
        updateTopic: updateTopic
    };

}]);


homeIndexModule.controller("topicsController", ["$modal", "$scope", "$http", "dataService", function ($modal, $scope, $http, dataService) {
    $scope.data = dataService;
    $scope.isBusy = false;

    if (dataService.isReady() === false) {
        $scope.isBusy = true;
        dataService.getTopics()
            .then(function () {
                // success
            },
                function () {
                    // error
                    alert("could not load topics.");
                })
            .then(function () {
                $scope.isBusy = false;
            });
    }

    //MODAL windows
    //reply 
    $scope.reply = function (topic, idx) {

        var modalInstance = $modal.open({
            controller: "singleTopicControllerInline",
            templateUrl: "/templates/singleTopicViewInline.html",
            resolve: {
                topic: function () {
                    return topic;
                },
                idx: function () {
                    return idx;
                }
            }
        });
    };

    // delete 
    $scope.delete = function (topic, idx) {
        var modalInstance = $modal.open({
            controller: "deleteControllerInline",
            templateUrl: '/templates/deleteContent.html',
            resolve: {
                topic: function () {
                    return topic;
                },
                idx: function () {
                    return idx;
                }
            }
        });
    };

    //updateTopic
    $scope.updateTopic = function (topic, idx)
    {
        var modalInstance = $modal.open({
            controller: "updateTopicControllerInline",
            templateUrl: '/templates/updateTopicInline.html',
            resolve: {
                topic: function () {
                    return angular.copy(topic);
                },
                idx: function () {
                    return idx;
                }
               
            }
        });
    };

    //Insert Topic
    $scope.insert = function () {
        var modalInstance = $modal.open({
            controller: "newTopicControllerInline",
            templateUrl: "/templates/newTopicView.html"
            }
        )
    };

    


}]);

homeIndexModule.controller("newTopicController", ["$scope", "$http", "$window", "dataService", function ($scope, $http, $window, dataService) {
    $scope.newTopic = {};
    $scope.save = function () {

        dataService.addTopic($scope.newTopic)
            .then(function () {
                //success
            },
                function () {
                    //error
                    alert("Topic not saved.");
                });
    };
}]);

homeIndexModule.controller("singleTopicController", ["$scope", "dataService", "$window", "$routeParams", function ($scope, dataService, $window, $routeParams) {
    $scope.topic = null;
    $scope.newReply = {};
    dataService.getTopicById($routeParams.id)
        .then(function (topic) {
            //success
            $scope.topic = topic;
        },
            function () {
                //error
                goHome();
            });

    $scope.addReply = function () {
        dataService.saveReply($scope.topic, $scope.newReply)
            .then(function () {
                //success
                $scope.newReply.body = "";
            }, function () {
                //error
                alert("could not save");
            });

    };

}]);

homeIndexModule.controller("updateTopicController", ["$scope", "dataService", "$window", "$routeParams", function ($scope, dataService, $window, $routeParams) {
    $scope.topic = null;
    $scope.newReply = {};
    dataService.getTopicById($routeParams.id)
        .then(function (topic) {
            //success
            $scope.topic = topic;
        },
            function () {
                //error
                goHome();
            });

    $scope.updateTopic = function () {
        dataService.updateTopic($scope.topic)
            .then(function () {
                //success
             //   goHome();
            //    $scope.topic.body = "done";
            }, function () {
                //error
                alert("could not save");
            });

    };

}]);

homeIndexModule.controller("updateTopicControllerInline", ["$modalInstance", "$scope", "dataService", "$window", "topic", "idx", function ($modalInstance, $scope, dataService, $window, topic, idx) {
    //$scope.something = {};
    $scope.topic = topic;
    $scope.idx = idx;
 //   $scope.something = $scope.topic;
 //   $scope.topic.newBody = $scope.topic.body;
    $scope.updateTopic = function () {
        dataService.updateTopic($scope.topic,idx)
            .then(function () {
                //success
              
                $modalInstance.close();
            }, function () {
                //error
                alert("could not save");
            });

    };

    $scope.cancel = function () {
        closeModal($modalInstance);

    };

}]);

homeIndexModule.controller("singleTopicControllerInline", ["$modalInstance", "$scope", "dataService", "$window", "topic", "idx", function ($modalInstance, $scope, dataService, $window, topic, idx) {
    $scope.topic = topic;
    $scope.idx = idx;
    $scope.newReply = {};


    $scope.addReply = function () {
        dataService.saveReply($scope.topic, $scope.newReply)
            .then(function () {
                //success
                $scope.newReply.body = "";
                $modalInstance.close();
            }, function () {
                //error
                alert("could not save");
            });

    };

    $scope.cancel = function () {
        closeModal($modalInstance);

    };

}]);

homeIndexModule.controller("newTopicControllerInline", ["$modalInstance","$scope", "$http", "$window", "dataService", function ($modalInstance,$scope, $http, $window, dataService) {
    $scope.newTopic = {};
    $scope.save = function () {

        dataService.addTopic($scope.newTopic)
            .then(function () {
                //success
                closeModal($modalInstance);
            },
                function () {
                    //error
                    alert("Topic not saved.");
                });
    };
    $scope.cancel = function () {
        closeModal($modalInstance);
    };
}]);

homeIndexModule.controller('deleteControllerInline', function ($scope, $modalInstance, $http, topic, idx, dataService) {

    $scope.topic = topic;
    $scope.idx = idx;
    $scope.delete = function (id, idx) {

        dataService.deleteTopic(id, idx)
              .then(function (topic) {
                  //success  
                  //    $scope.topic = topic;
                  $modalInstance.close({
                      controller: "ModalInstanceCtrl"
                  });

              },
            function () {
                //error
                alert("could not delete.");
            });

    };

    $scope.cancel = function () {
        closeModal($modalInstance);

    };
});



//helpers
function goHome() {
    window.location = "#/";
}

function closeModal(instance) {
   
    instance.close(); 
}