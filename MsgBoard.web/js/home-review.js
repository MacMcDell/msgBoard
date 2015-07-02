
var homeReviewModule = angular.module("homeReview", ['ngRoute', 'ui.bootstrap'])
     , hub = $.connection.myHub;





homeReviewModule.config(["$routeProvider", function ($routeProvider) {
    $routeProvider.when("/Home/Reviews", {
        controller: "reviewsController",
        templateUrl: "/templates/Reviews.html"
    });

    //$routeProvider.when("/newMessage", {
    //    controller: "newReviewController",
    //    templateUrl: "/templates/newReviewView.html"
    //});

    //$routeProvider.when("/message/:id", {
    //    controller: "singleReviewController",
    //    templateUrl: "/templates/singleReviewView.html"
    //});
    //$routeProvider.when("/update/:id", {
    //    controller: "updateReviewController",
    //    templateUrl: "/templates/UpdateReview.html"
    //});

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
            t.body = review.body;
            t.title = review.title;
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

homeReviewModule.controller("reviewsController", ["$modal", "$scope", "$http", "dataService", function ($modal, $scope, $http, dataService) {
    $scope.reviews = [];
    $scope.data = dataService;
    $scope.sortIdSubscibed;


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
    
    //original
    //    $scope.getAllFromCustomer = function () {
    //        if ($scope.customerId.length == 0) return;
    //       $http.get('/api/reviews/' + $scope.customerId)
    //        .success(function (data, status) {
    //            $scope.reviews = data; // show current reviews

    //            if ($scope.sortIdSubscibed &&
    //                $scope.sortIdSubscibed.length > 0 &&
    //                $scope.sortIdSubscibed !== $scope.customerId) {
    //                // unsubscribe to stop to get notifications for old customer
    //                hub.server.unsubscribe($scope.sortIdSubscibed);
    //            }
    //            // subscribe to start to get notifications for new customer
    //            hub.server.subscribe($scope.customerId);
    //            $scope.sortIdSubscibed = $scope.customerId;
    //        })
    //        .error(function (data, status) {
    //            $scope.reviews = [];
    //            $scope.errorToSearch = errorMessage(data, status);
    //        })
    //};

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


    //$scope.deleteOne = function (item) {
    //    $http.delete('/api/reviews/' + item.id)
    //        .success(function (data, status) {
    //            $scope.errorToDelete = null;
    //        })
    //        .error(function (data, status) {
    //            $scope.errorToDelete = errorMessage(data, status);
    //        })
    //};



    $scope.toShow = function () {
        return $scope.reviews && $scope.reviews.length > 0;
    };

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
        var array = $scope.reviews;
        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i].id === item.id) {
                array[i].review = item.review;
                $scope.$apply();
            }
        }
    }

    $.connection.hub.start(); // connect to signalr hub



}]);


//homeReviewModule.controller("reviewsController", ["$modal", "$scope", "$http", "dataService", function ($modal, $scope, $http, dataService) {
//    console.log("in controller");
//    $scope.data = dataService;
//    $scope.isBusy = false;

//    if (dataService.isReady() === false) {
//        $scope.isBusy = true;
//        dataService.getReviews()
//            .then(function () {
//                // success
//            },
//                function () {
//                    // error
//                    alert("could not load reviews.");
//                })
//            .then(function () {
//                $scope.isBusy = false;
//            });
//    }

//    ////MODAL windows
//    ////reply 
//    //$scope.reply = function (review, idx) {

//    //    var modalInstance = $modal.open({
//    //        controller: "singleReviewControllerInline",
//    //        templateUrl: "/templates/singleReviewViewInline.html",
//    //        resolve: {
//    //            review: function () {
//    //                return review;
//    //            },
//    //            idx: function () {
//    //                return idx;
//    //            }
//    //        }
//    //    });
//    //};

//    //// delete 
//    //$scope.delete = function (review, idx) {
//    //    var modalInstance = $modal.open({
//    //        controller: "deleteControllerInline",
//    //        templateUrl: '/templates/deleteContent.html',
//    //        resolve: {
//    //            review: function () {
//    //                return review;
//    //            },
//    //            idx: function () {
//    //                return idx;
//    //            }
//    //        }
//    //    });
//    //};

//    ////updateReview
//    //$scope.updateReview = function (review, idx) {
//    //    var modalInstance = $modal.open({
//    //        controller: "updateReviewControllerInline",
//    //        templateUrl: '/templates/updateReviewInline.html',
//    //        resolve: {
//    //            review: function () {
//    //                return angular.copy(review);
//    //            },
//    //            idx: function () {
//    //                return idx;
//    //            }

//    //        }
//    //    });
//    //};

//    ////Insert Review
//    //$scope.insert = function () {
//    //    var modalInstance = $modal.open({
//    //        controller: "newReviewControllerInline",
//    //        templateUrl: "/templates/newReviewView.html"
//    //    }
//    //    )
//    //};




//}]);

//homeReviewModule.controller("newReviewController", ["$scope", "$http", "$window", "dataService", function ($scope, $http, $window, dataService) {
//    $scope.newReview = {};
//    $scope.save = function () {

//        dataService.addReview($scope.newReview)
//            .then(function () {
//                //success
//            },
//                function () {
//                    //error
//                    alert("Review not saved.");
//                });
//    };
//}]);

//homeReviewModule.controller("singleReviewController", ["$scope", "dataService", "$window", "$routeParams", function ($scope, dataService, $window, $routeParams) {

//    $scope.reviews = dataService.getReviews();
//    $scope.review = null;
//    $scope.newReply = {};
//    $scope.reviewIdSubscribed;
//    dataService.getReviewById($routeParams.id)
//        .then(function (review) {
//            //success
//            $scope.review = review;

//        },
//            function () {
//                //error
//                goHome();
//            });

//    $scope.addReply = function () {
//        dataService.saveReply($scope.review, $scope.newReply)
//            .then(function () {
//                //success
//                $scope.newReply.body = "";
//            }, function () {
//                //error
//                alert("could not save");
//            });
//    };

//}]);

//homeReviewModule.controller("updateReviewController", ["$scope", "dataService", "$window", "$routeParams", function ($scope, dataService, $window, $routeParams) {
//    $scope.review = null;
//    $scope.newReply = {};
//    dataService.getReviewById($routeParams.id)
//        .then(function (review) {
//            //success
//            $scope.review = review;
//        },
//            function () {
//                //error
//                goHome();
//            });

//    $scope.updateReview = function () {
//        dataService.updateReview($scope.review)
//            .then(function () {
//                //success
//                //   goHome();
//                //    $scope.review.body = "done";
//            }, function () {
//                //error
//                alert("could not save");
//            });

//    };

//}]);

//homeReviewModule.controller("updateReviewControllerInline", ["$modalInstance", "$scope", "dataService", "$window", "review", "idx", function ($modalInstance, $scope, dataService, $window, review, idx) {
//    //$scope.something = {};
//    $scope.review = review;
//    $scope.idx = idx;
//    //   $scope.something = $scope.review;
//    //   $scope.review.newBody = $scope.review.body;
//    $scope.updateReview = function () {
//        dataService.updateReview($scope.review, idx)
//            .then(function () {
//                //success

//                $modalInstance.close();
//            }, function () {
//                //error
//                alert("could not save");
//            });

//    };

//    $scope.cancel = function () {
//        closeModal($modalInstance);

//    };

//}]);

//homeReviewModule.controller("singleReviewControllerInline", ["$modalInstance", "$scope", "dataService", "$window", "review", "idx", function ($modalInstance, $scope, dataService, $window, review, idx) {
//    $scope.review = review;
//    $scope.idx = idx;
//    $scope.newReply = {};


//    $scope.addReply = function () {
//        dataService.saveReply($scope.review, $scope.newReply)
//            .then(function () {
//                //success
//                $scope.newReply.body = "";
//                $modalInstance.close();
//            }, function () {
//                //error
//                alert("could not save");
//            });

//    };

//    $scope.cancel = function () {
//        closeModal($modalInstance);

//    };

//}]);

//homeReviewModule.controller("newReviewControllerInline", ["$modalInstance", "$scope", "$http", "$window", "dataService", function ($modalInstance, $scope, $http, $window, dataService) {
//    $scope.newReview = {};
//    $scope.save = function () {

//        dataService.addReview($scope.newReview)
//            .then(function () {
//                //success
//                closeModal($modalInstance);
//            },
//                function () {
//                    //error
//                    alert("Review not saved.");
//                });
//    };
//    $scope.cancel = function () {
//        closeModal($modalInstance);
//    };
//}]);

//homeReviewModule.controller('deleteControllerInline', function ($scope, $modalInstance, $http, review, idx, dataService) {

//    $scope.review = review;
//    $scope.idx = idx;
//    $scope.delete = function (id, idx) {

//        dataService.deleteReview(id, idx)
//              .then(function (review) {
//                  //success  
//                  //    $scope.review = review;
//                  $modalInstance.close({
//                      controller: "ModalInstanceCtrl"
//                  });

//              },
//            function () {
//                //error
//                alert("could not delete.");
//            });

//    };

//    $scope.cancel = function () {
//        closeModal($modalInstance);

//    };
//});



//helpers
function goHome() {
    window.location = "#/";
}

function closeModal(instance) {

    instance.close();
}