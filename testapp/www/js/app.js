// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
app.service('PouchService', function() {

  var testDb = new PouchDB('testDb');

  testDb.transform({
      incoming: function(doc) {
       //do something before retrival 
        Object.keys(doc).forEach(function(field) {
          if (field !== '_id' && field !== '_rev') {
            doc[field] = encrypt(doc[field].toString());
          }
        });
        return doc;
      },
      outgoing: function(doc) {
        // do something to the document after retrieval
        Object.keys(doc).forEach(function(field) {
          if (field !== '_id' && field !== '_rev') {
            doc[field] = decrypt(doc[field]);
          }
        });

        return doc;
      }
    });

  function encrypt(text) {
    var encrypted = CryptoJS.AES.encrypt(text, 'secret key 123');
    return encrypted;
  }

  function decrypt(text) {
    var bytes = CryptoJS.AES.decrypt(text, 'secret key 123');
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }

  return {

    insertRec: function(rec) {

      console.log(JSON.stringify(rec));
      return testDb.put(rec).then(function(resp) {

          console.log("######" + JSON.stringify(resp));
        })
        .catch(function(err) {

          console.log(err);

        });

    },
    liveSyncing: function() {
      var remote = 'http://192.168.2.4:5984/test'
      testDb.sync(remote, {
        live: true,
        retry: true
      }).on('change', function(change) {
        console.log("yo, something changed!");
      }).on('paused', function(info) {
        console.log("replication was paused, usually because of a lost connection");
        console.log(JSON.stringify(info));
      }).on('active', function(info) {
        console.log("replication was resumed");
      }).on('complete', function() {
        console.log("replication complete");
      }).on('error', function(err) {
        console.log("totally unhandled error (shouldn't happen)");
      });
    }

  }
});
app.controller('MainCtrl', function($scope, PouchService) {
  $scope.data = {_id:"",name:""};
  console.log("hello");
  $scope.pouchService = PouchService
  $scope.insertRec = function(){
    var savedRec = {
      "_id" : $scope.data.name,
      "name": $scope.data.name
    };
    $scope.pouchService.insertRec(savedRec).then(function(resp){
      console.log(JSON.stringify(resp));

    }).catch(function(err){
      console.log(err.message);
    })
  }
});

