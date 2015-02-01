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
var models = require('../models/index');
var User = models.User;
var Restaurant = models.Restaurant;




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
// var contents = fs.readFileSync('./migrate.txt','utf-8');
// var js = JSON.parse(contents)
// var a = [];
// for(var k in js) {
//   var rest = {};
//   rest.id = k;
//   rest.price = js[k].price;
//   rest.food_image_url = js[k].food_image_url.replace(/ls(?=.jpg)/,"o");
//   a.push(rest)
// }
// async.each(a, function(single, callback){
//     var r = new Restaurant();
//     r.id = single.id;
//     r.price = single.price;
//     r.food_image_url = single.food_image_url;
//     r.save(function(err){
//       callback();
//     });

// },function(err){
//   if(err) console.log(err)
//   console.log("done")
//  });

// var map = require('../data/loadData.js').getPrices('./price_tags.txt');
// var ar =[];
// for(var k in map){
//   var t ={};
//   t.id = k;
//   t.price = map[k];
//   ar.push(t);
// }
// var stream = fs.createWriteStream("migrate.txt");
// var data = {}
// Restaurant.find({},function(err,docs){
//    for(var i =0 ;i <docs.length ;i++) {
//       var temp = {}
//       temp.img_url = docs[i].img_url;
//       temp.price = docs[i].price;
//       data[docs[i].id] = temp;
//    }
//    stream.write(JSON.stringify(data));
//    stream.end()

// })

// async.eachSeries(ar,function(single,callback){
//   request({
//     url: "http://www.yelp.com/biz/" + single.id,
//     json:true
//   },function(error,response,body){
//     console.log(response.statusCode)
//       if (!error && response.statusCode === 200) {

//          var $ = cheerio.load("<div>" + body + "</div>");
//          var temp = new Restaurant();
//          temp.img_url = $("div.showcase-photo-box img.photo-box-img[height='250']").first().attr("src");
//          temp.id = single.id;
//          temp.price = single.price;
//          console.log(++count, " file processed!");
//          stream.write(temp.id + "::::" + temp.price + "::::" + temp.img_url + "\r\n" );
//               setTimeout(function(){
//                 callback();
//               }, 100);
//       } else {
//          setTimeout(function(){
//                 callback();
//               }, 500);
//       }
//   });
// },function(err){
//   stream.end();
//   console.log("done!")
// });

//var query = Restaurant.find({"open_hours": {$exists: true}});
query = Restaurant.find({});
query.limit(1000);
query.exec(function (err, docs) {
  async.each(docs.filter(function(i){
   //if(!i.open && !i.good_for) return true;
    return true;
  }), function(single, callback) {
    request({
      url: "http://www.yelp.com/biz/" + single.id,
      json: true
    },function(error, response, body){
         console.log("start crawling " + single.id);
        if (!error && response.statusCode === 200) {
          console.log("get the html content status code is :  ", response.statusCode )
          var $ = cheerio.load("<div>" + body + "</div>");
          single.food_image_url = [];
          $("div.showcase-photo-box img.photo-box-img[height='250']").each(function(i,e){
            single.food_image_url.push($(this).attr("src").replace(/ls(?=.jpg)/,"o"));
          });
          $('table.hours-table tr').each(function(i,element){
            var day = $(this).children('th').text().trim();
            var hours = $(this).children('td').first().text().trim();
            single.open_hours.push({
              day : day,
              hours : hours
            });
          });
          //var open = $('span.hour-range').siblings().text().toLowerCase();
          // var goodfor = $('div.short-def-list dl dt').filter(function(i,el){ return $(this).text().trim() === 'Good For'}).siblings().text().trim().toLowerCase();
          // single.open = open.indexOf("open") !== -1;
          // single.good_for = goodfor;
          console.log(single.open_hours,'---------', single.food_image_url);
          single.save(function(err){
            console.log(single.id + "   saved!!")
            callback();
          });
        }
    })
  } ,function(){
      if(err) console.log(err)
      console.log("done");
  });
});


function processResult(rests,cb) {
  var obj = {
       comments : 0,
        prices : 0 
  }
  
  async.each(rests,function(r,callback){
    obj.comments += r.review_count;
    Restaurant.findOne({id:r.id},function(err,doc){
        if(doc ===null) {
            doc = new Restaurant();
            doc.id = r.id;
            request({
               url: "http://www.yelp.com/biz/" + r.id,
               json: true
            }, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                  var $ = cheerio.load( body);
                  r.food_image_url = $("div.showcase-photo-box img.photo-box-img[height='250']").first().attr("src").replace(/ls(?=.jpg)/,"o");
                  doc.food_image_url = r.food_image_url;
                  var p = $('div.price-category span.price-range').text();
                  if(p) {
                    r.price = p.trim().length;
                    doc.price = r.price;
                    obj.price = r.price;
                  } else {
                    r.price = 2.5;
                    doc.price = 2.5;
                    obj.prices += 2.5;
                  }
                  // $('div.search-result').each(function(index, a) {
                  //   if($(this).find('span.price-range').text() !== "") {
                  //      r.price = $(this).find('span.price-range').text().trim().length;
                  //      doc.price = r.price;
                  //      obj.prices += r.price;
                  //   }
                  //    else {
                  //     r.price = 2.5;
                  //     doc.price = 2.5;
                  //     obj.prices += 2.5;
                  //   }
                  // });
              }
              doc.save(function(err){
                callback();
              });
            })
        } else {
          r.price = doc.price;
          obj.prices += r.price;
          r.food_image_url = doc.food_image_url;
          callback();
        }
    })
  },function(err){
      cb(rests,obj);
  });
}

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
  var max_cuisine_score = Number.NEGATIVE_INFINITY;
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
  var comment_score = (rest.review_count > comment_avg ? Math.log(rest.review_count) / Math.log(comment_avg) : rest.review_count/comment_avg) * base["comments"];
  price_score = rest.price < price_avg ? base.price : base.price/(1 + (rest.price - price_avg) * 2 );
  var total_score =  rating_score + cuisine_score + distance_score + comment_score + price_score;
  return {
    rating_score : rating_score,
    cuisine_score : cuisine_score,
    distance_score : distance_score,
    comment_score : comment_score,
    price_score : price_score,
    total_score: total_score
  };
}

/* GET login page. */
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('home', { message: req.flash('message') });
  });

  // /* Handle Login POST */
  // router.post('/login', passport.authenticate('local-login', {
  //   failureRedirect: '/',
  //   failureFlash : true
  // }) ,function(req,res){
  //     res.redirect("/home/" + req.body.latitude + "/" + req.body.longitude);
  // });
router.post('/login',function(req,res){
  res.redirect("/home/" + req.body.latitude + "/" + req.body.longitude);
})

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

  router.post('/select',function(req,res) {
     User.findOne({username:req.body.username},function(err, user){
      var rest = req.body.restaurant;
        if(user === null) {
           var user   = new User();
           user.username    = req.body.username;
          
        }
        var temp = [];

        for(var iter in rest.categories) {

          if(typeof data.dic[rest.categories[iter][0].replace(/\s/g,"_")] === 'undefined'){
            continue;
          }
          temp.push(rest.categories[iter][0].replace(/\s/g,'_'));
        }
        user.history.push({
          id:rest.id,
          categories:temp,
          like:req.body.like
        });
        user.save(function(err) {
          if (err) res.send("error!");
          res.send("got you!");
        });
     })
  });





/* GET home page. */
router.post('/search', function(req, res) {
User.findOne({username:req.body.username},function(err,user){
  if(user === null) {
     var user   = new User();
     user.username    = req.body.username;
  }
  var sum = [];
  var cuisine_count = [];
  for(var i in data.dic) {
    cuisine_count.push(0);
    sum.push(0);
  }
  
  for(var rh = 0 ; rh < user.history.length ; rh++) {
    var arr = user.history[rh].categories;
    for(var c = 0 ;c <  arr.length ; c++) {
      var index = data.dic[arr[c]];
      cuisine_count[index] += 1;
    }
  }
  for(var i in cuisine_count) {
      for(var j in data.map[i]) {
        sum[j] += cuisine_count[i] * parseFloat(data.map[i][j]) / 100.0;
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
  var first;
  var second;
  async.parallel([
     function(callback){
        yelp.search({category_filter:"restaurants",sort:"2",ll:req.body.latitude+","+req.body.longitude,radius_filter :"500",limit:'20',offset:'0'}, function(err,d){
          first = d.businesses;

          callback(null);
        });
      },
      function(callback){
        yelp.search({category_filter:"restaurants",sort:"2",ll:req.body.latitude+","+req.body.longitude,radius_filter :"500",limit:'20',offset:'20'}, function(err,d){
           second = d.businesses;
          callback(null);
        });
      }
    ],function(err){
      var temp = _.union(first,second);
       processResult(temp,function(rests,total_obj){
          rests.forEach(function(d){
              d.score = cal(d,preference,total_obj.comments/temp.length,total_obj.prices/temp.length);
          });
          var sorted_result = _.sortBy(temp,function(rest){
              return 0-rest.score.total_score;
          });
          res.send(sorted_result);
        })
    });
});

  //"40.636385,-74.017424"
});

module.exports = router;
