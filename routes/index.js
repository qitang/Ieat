var express = require('express');
var sugar = require('sugar');
var async = require('async');
var router = express.Router();
var cheerio = require("cheerio");
var url = require('url');
var fs = require('fs');
var  _ = require("underscore");
var data = require('../data/loadData.js').getCorrelation('./correlation.csv');

var request = require("request")
var passport = require('passport');
var User = require('../models/index').User;


/*
  crawl the restaurants price tags
*/

// var seed = "http://www.yelp.com/search/snippet?find_desc&find_loc=New%20York%2C%20NY&start={}&cflt=restaurants&parent_request_id=4f2957b1529b194c&request_origin=hash&bookmark=true"
// var urls = [];
// var fs = require('fs');
// var stream = fs.createWriteStream("price_tags.txt");

// for(var i =0 ; i<=990 ;i+=10) {
//   urls.push( seed.replace(/{}/g,i));
// }
// async.each(urls,function(url,callback){
//   request({
//      url: url,
//      json: true
//   }, function (error, response, body) {
//     if (!error && response.statusCode === 200) {
//         var $ = cheerio.load("<div>" + body.search_results + "</div>");
//         $('div.search-result').each(function(index, a) {
//           if($(this).find('span.price-range').text() !== "")
//              stream.write($(this).find('a.biz-name').attr("href").replace('/biz/',"").unescapeURL(true) + ":" + $(this).find('span.price-range').text() + "\r\n")
//         });
//     }
//     callback();
//   })
// },function(err){
//     if(err) console.log(err);
//     else {
//       stream.end();
//     }
// })


var yelp = require("yelp").createClient({
  consumer_key: "ph_JGhSGyT5lSZNSK5LBXw",
  consumer_secret: "O2MR0dFNJSHGst_Cq9fAPuozNR8",
  token: "ael3LhQAnLwKxQWDc3BjqOwgYz1SWyyV",
  token_secret: "OEdg-WFJpQRSzplKEtT1RH-3UP4"
});

function cal(rest,preference,comment_avg,price_avg,price) {
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
  var max_cuisine_score = 0;
  var price_score;
  for(var iter in rest.categories) {
    if(typeof data.dic[rest.categories[iter][0].replace(/\s/g,"_")] === 'undefined') {
       continue;
    }
    max_cuisine_score = Math.max(max_cuisine_score, preference[data.dic[rest.categories[iter][0].replace(/\s/g,"_")]]);
  }
  var price_socre;
  var cuisine_score = ( max_cuisine_score + 0.5) * base.cuisine;
  var distance_score = (Math.exp(1-rest.distance/400))* base.distance/2.718
  var comment_score = (rest.review_count > comment_avg ? Math.log(rest.review_count) / Math.log(comment_avg) : rest.review_count/rest.review_count) * base["comments"];
  if(price[rest.id] !== 'undefined') {
    price_score = price[rest.id] < price_avg ? base.price : base.price/(1 + (price[rest.id] - price_avg) * 2 );

  } else {
    price_score = 10;
  }
  return rating_score + cuisine_score + distance_score + comment_score + price_score;

}

/* GET login page. */
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('home', { message: req.flash('message') });
  });

  /* Handle Login POST */
  router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/',
    failureFlash : true
  }) ,function(req,res){
      res.redirect("/home/" + req.body.latitude + "/" + req.body.longitude);
  });

  /* GET Registration Page */
  router.get('/signup', function(req, res){
    res.render('register',{message: req.flash('message')});
  });

router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});

  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash : true
  }));







/* GET home page. */
router.get('/home/:lati/:long', function(req, res) {
User.findOne({username:req.user.username},function(err,user){
  var sum = [];
  for(var i in data.dic) {
    sum.push(0);
  }
  for(var i in user.cuisine_count) {
      for(var j in data.map[i]) {
        sum[j] += user.cuisine_count[i] * parseFloat(data.map[i][j]) / 100.0;
      }
  }

  var total = 0;
  sum.forEach(function(d){
    total += d;
  });

  //if total is 0, do not normalize it
  if( parseInt(total) !== 0) {
   sum = sum.map(function(d){
      return d/total;
    });
  }
  var preference = [];
  for(var i in sum) {
    preference.push(sum[i]);
  }

  var price = require('../data/loadData.js').getPrices('./price_tags.txt');
  var first;
  var second;
  async.parallel([
     function(callback){
        yelp.search({category_filter:"restaurants",sort:"2",ll:req.params.lati+","+req.params.long,radius_filter :"500",limit:'20',offset:'0'}, function(err,d){
          first = d.businesses;

          callback(null);
        });
      },
      function(callback){
        yelp.search({category_filter:"restaurants",sort:"2",ll:req.params.lati+","+req.params.long,radius_filter :"500",limit:'20',offset:'20'}, function(err,d){
           second = d.businesses;
          callback(null);
        });
      }
    ],function(err){
      var comments = 0;
      var prices = 0;
      var count = 0;
      var temp = _.union(first,second);
      var rest_to_crawl = [];
      temp.forEach(function(item){
        if(typeof price[item.id] === 'undefined') {
          rest_to_crawl.push(item.id);
        }
      });
      var stream = fs.createWriteStream("price_tags.txt",{'flags': 'a'});
      async.each(rest_to_crawl,function(id,callback){
        request({
             url: "http://www.yelp.com/biz/" + id,
             json: true
          }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var $ = cheerio.load("<div>" + body + "</div>");
                $('.biz-main-info span.price-range').each(function(index, a) {
                  if($(this).text() !== "") {
                    price[id] = ($(this).text().trim().length);
                    stream.write(id + ":" + $(this).text() + "\r\n");
                  }
                });
            }
            callback();
          })
        },function(err){
              temp.forEach(function(item){
                comments += item.review_count;
                if(typeof price[item.id] !== 'undefined') {
                  count++;
                  item.price = price[item.id];
                  prices += price[item.id];
                }
              })
              stream.end();
              var sorted_result = _.sortBy(temp,function(rest){
                var score = cal(rest,preference,comments/temp.length,prices/count,price);
                return 0-score;
            });
           res.render("index",{bu:sorted_result});
        })
    });
});

  //"40.636385,-74.017424"
});

module.exports = router;
