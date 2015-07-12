
var homeReviewModule = angular.module("homeReview", ['ngRoute', 'ui.bootstrap'])
     , hub = $.connection.myHub;


homeReviewModule.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/Home/Reviews", {
        controller: "reviewsController",
        templateUrl: "/templates/Reviews.html"
    });
    $routeProvider.otherwise({ redirectTo: "/Home/Reviews" });
}]);

homeReviewModule.factory("dataService", ["$http", "$q", function ($http, $q) {

    var reviews = [];
    var isInit = false;

    var isReady = function () {
        return isInit;
    };

    var getReviews = function (sortId) {
        var deferred = $q.defer();
        $http.get("/api/reviews/" + sortId)
            .then(function (result) {
                // success
                angular.copy(result.data, reviews);
                deferred.resolve();
                isInit = true;
            },
                function () {
                    // error
                    deferred.reject();
                });

        return deferred.promise;
    };

    var addReview = function (newReview) {
        var deferred = $q.defer();

        $http.post("/api/reviews", newReview)
          .then(function (result) {
              //success
              var newlyCreatedReview = result.data;
              Reviews.splice(0, 0, newlyCreatedReview);
              deferred.resolve(newlyCreatedReview);
          },
          function () {
              //error
              deferred.reject();
          });

        return deferred.promise;

    };

    function findReview(id) {
        var found = null;

        $.each(reviews, function (i, item) {
            if (item.id == id) {
                found = item;
                return false;
            }
        });
        return found;
    }

    var getReviewById = function (id) {
        var deferred = $q.defer();

        if (isReady()) {
            var review = findReview(id);
            if (review) {
                deferred.resolve(review);
            } else {
                deferred.reject();
            }
        } else {
            getReviews()
                .then(function () {
                    //success
                    getReviewById(id);
                    var review = findReview(id);
                    if (review) {
                        deferred.resolve(review);
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

    var saveReply = function (review, newReply) {
        var deferred = $q.defer();

        $http.post("/api/reviews/" + review.id + "/replies", newReply)
            .then(function (result) {
                //success
                if (review.replies == null) review.replies = [];
                review.replies.push(result.data);
                deferred.resolve();
            }, function () {
                //error
                deferred.reject();
            });

        return deferred.promise;


    };

    var deleteItem = function (item) {
        var deferred = $q.defer();
        var review = findReview(item.id);

        $http.delete("/api/reviews/" + item.id)
          .then(function (result) {
              //success
              //  var newlyCreatedReview = result.data;
              deferred.resolve(review);
          },
          function () {
              //error
              deferred.reject();
          });

        return deferred.promise;

    };

    var deleteReview = function (id, idx) {
        var deferred = $q.defer();
        var review = findReview(id);

        $http.delete("/api/reviews/" + id)
          .then(function (result) {
              //success
              //  var newlyCreatedReview = result.data;
              reviews.splice(idx, 1);
              deferred.resolve(review);
          },
          function () {
              //error
              deferred.reject();
          });

        return deferred.promise;

    };

    var updateReview = function (review) {
        var deferred = $q.defer();
        // review.body = review.newBody;
        $http.put("/api/reviews/" + review.id, review)
        .then(function (result) {
            var t = findReview(review.id);
            t.review = review.review;
            deferred.resolve();
        },
        function () {
            deferred.reject;
        });
        return deferred.promise;
    };

    return {
        reviews: reviews,
        getReviews: getReviews,
        addReview: addReview,
        isReady: isReady,
        getReviewById: getReviewById,
        saveReply: saveReply,
        deleteReview: deleteReview,
        deleteItem: deleteItem,
        updateReview: updateReview
    };

}]);

homeReviewModule.controller("reviewsController", ["$modal", "$scope", "$http", "dataService", "$log", function ($modal, $scope, $http, dataService, $log) {
    $scope.reviews = [];
    $scope.data = dataService;
    $scope.sortIdSubscibed;

    $scope.toShow = function () {
        return $scope.reviews && $scope.reviews.length > 0;
    };

    $scope.getAllFromCustomer = function () {
        dataService.getReviews($scope.customerId)
            .then(function () {
                // success
                $scope.reviews = dataService.reviews;
                if ($scope.sortIdSubscibed &&
                    $scope.sortIdSubscibed.length > 0 &&
                    $scope.sortIdSubscibed !== $scope.customerId) {
                    // unsubscribe to stop to get notifications for old customer
                    hub.server.unsubscribe($scope.sortIdSubscibed);
                }
                // subscribe to start to get notifications for new customer
                hub.server.subscribe($scope.customerId);
                $scope.sortIdSubscibed = $scope.customerId;
            },
                function () {
                    // error
                    $scope.reviews = [];
                    $scope.errorToSearch = errorMessage(data, status);

                });
    };
    
    $scope.postOne = function () {
        $http.post("/api/reviews", {
            sort: $scope.customerId,
            review: $scope.revToAdd
        })
            .success(function (data, status) {
                $scope.errorToAdd = null;
                $scope.descToAdd = null;
            })
            .error(function (data, status) {
                $scope.errorToAdd = errorMessage(data, status);
            })
    };

    $scope.deleteOne = function (item) {
        dataService.deleteItem(item)
        .then(function () {
            //success
            //  $scope.reviews = dataService.reviews;
        },
        function () {
            //error
        });
    };

    $scope.editIt = function (item) {
        $scope.idToUpdate = item.id;
        $scope.descToUpdate = item.review;

    };

    $scope.putOne = function () {
        var item = {
            id: $scope.idToUpdate,
            sort: $scope.customerId,
            review: $scope.descToUpdate
        }
        dataService.updateReview(item)
        .then(function () {
            //sucess

        },
        function () {
            console.log("put failed");

            //faileure
        });

    }
   
    // at initial page load
    $scope.orderProp = 'id';

    // signalr client functions
    hub.client.addItem = function (item) {
        $scope.reviews.push(item);
        $scope.$apply(); // this is outside of angularjs, so need to apply
    }

    hub.client.deleteItem = function (item) {
        console.log("dleete item");
        var array = $scope.reviews;
        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i].id === item.id) {
                array.splice(i, 1);
                $scope.$apply();
            }
        }
    }

    hub.client.updateItem = function (item) {
        $log.info("Item" + item.id + " updated.");
        var array = $scope.reviews;
        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i].id === item.id) {
                array[i].review = item.review;
                $scope.$apply();
            }
        }
    }

    $.connection.hub.start(); // connect to signalr hub

    // end signalr client

}]);

//helpers
function goHome() {
    window.location = "#/";
}

function closeModal(instance) {

    instance.close();
}