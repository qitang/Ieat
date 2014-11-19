var express = require('express');
var async = require('async');
var router = express.Router();
var  _ = require("underscore");
var data = require('../data/correlation.js')('./data/correlation.csv');
var dic = [];
for(var i in data) {
  dic.push(i);
}
var models = require('../models/');

var yelp = require("yelp").createClient({
  consumer_key: "ph_JGhSGyT5lSZNSK5LBXw", 
  consumer_secret: "O2MR0dFNJSHGst_Cq9fAPuozNR8",
  token: "ael3LhQAnLwKxQWDc3BjqOwgYz1SWyyV",
  token_secret: "OEdg-WFJpQRSzplKEtT1RH-3UP4"
});

function cal(rest,preference,comment_avg) {
  var average = {
      rating:0,
      comments:0,
      distance:0,
  }

  var base = {
    rating:30,
    cuisine:30,
    comments:10,
    distance:20,
    price:10
  }
  var rating_score = (rest.rating - 2) * base.rating /3;
  //var cuisine_score = (preference[rest.categories][1] + 0.5) * base.cuisine;
  var distance_score = (Math.exp(1-rest.distance/400))* base.distance/2.718
  var comment_score = (rest.review_count > comment_avg ? Math.log(rest.review_count) / Math.log(comment_avg) : rest.review_count/rest.review_count) * base["comments"];
}

/* GET home page. */
router.get('/*', function(req, res) {
models.User.findOne({name:req.query.name},function(err,u){
  if(u === null) {
    var user = new models.User();
    user.name = req.query.name;
    var temp = {};
    for(var i in data) {
      temp[i] = 0;
    }
    user.bucket = temp;
  } 
  var sum = [];
  for(var i =0; i < dic.length ; i++) {
    sum.push(1);
  }
  for(var i in user.bucket) {
      for(var j in data[i]) {
        sum[j] += user.bucket[i] * parseFloat(data[i][j]) / 100.0;
      }
  }
  var total = 0;
  sum.forEach(function(d){
    total += d;
  });
  var p = sum.map(function(d){
    return d/total;
  });
  var preference = {};
  for(var i in p) {
    preference[dic[i]] = p[i];
  }
  var bu = [];
  async.parallel([
      function(cb){
          yelp.search({term: "restaurant",sort:"2",ll:req.query.lati + "," + req.query.long,radius_filter :"500"}, function(error, data) {
             bu = bu.concat(data.businesses);
             cb(null);
          });
      },
      function(cb){
          yelp.search({term: "restaurant",sort:"2",ll:req.query.lati + "," + req.query.long,radius_filter :"500",offset:"20"}, function(error, data) {
             bu = bu.concat(data.businesses);
             cb(null);
          });
      }

    ],function(err,r){
        var comments = 0;
        bu.forEach(function(r){
          comments += r.review_count;
        });
        _.sortBy(bu,function(rest){
            return cal(rest,preference,comments/bu.length);
        });
        res.render("index",{bu:bu});
  });
});

  //"40.636385,-74.017424"
});

module.exports = router;
