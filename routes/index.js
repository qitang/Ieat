var express = require('express');
var sugar = require('sugar');
var async = require('async');
var router = express.Router();
var cheerio = require("cheerio");
var url = require('url');
var fs = require('fs');
var  _ = require("underscore");
var data = require('../data/loadData.js').getCorrelation('./correlation.csv');
var getCateMap = require('../data/loadData.js').getCateMap('./map.txt');
var getTimeMap = require('../data/loadData.js').getTimeMap('./map_cuisine_time.csv');
var time_zone = require('../data/loadData.js').time_zone;

var request = require("request")
var passport = require('passport');
var models = require('../models/index');
var User = models.User;
var Restaurant = models.Restaurant;
var moment = require('moment');
var Stats = require('fast-stats').Stats;



// Restaurant.findOne({id:'statler-grill-new-york'},function(err,user){
//    console.log("haha",user.isOpen("2015-03-29 3:55:18-04:00"), user.open_hours);
// })

// var contents = fs.readFileSync('./map.csv','utf-8');
// var stream = fs.createWriteStream("map.txt");

// contents.split('\n').forEach(function(line){
//    var words = line.split(',');
//     if(words[3]) {
     
//       stream.write(words[3] + ":" + words[4] + "\r\n");
//     }
// });
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
// query = Restaurant.find({});
// query.limit(1000);
// query.exec(function (err, docs) {
//   async.each(docs.filter(function(i){
//    //if(!i.open && !i.good_for) return true;
//     return true;
//   }), function(single, callback) {
//     request({
//       url: "http://www.yelp.com/biz/" + single.id,
//       json: true
//     },function(error, response, body){
//          console.log("start crawling " + single.id);
//         if (!error && response.statusCode === 200) {
//           console.log("get the html content status code is :  ", response.statusCode )
//           var $ = cheerio.load("<div>" + body + "</div>");
//           single.food_image_url = [];
//           $("div.showcase-photo-box img.photo-box-img[height='250']").each(function(i,e){
//             single.food_image_url.push($(this).attr("src").replace(/ls(?=.jpg)/,"o"));
//           });
//           $('table.hours-table tr').each(function(i,element){
//             var day = $(this).children('th').text().trim();
//             var hours = $(this).children('td').first().text().trim();
//             single.open_hours.push({
//               day : day,
//               hours : hours
//             });
//           });
//           //var open = $('span.hour-range').siblings().text().toLowerCase();
//           // var good_for = $('div.short-def-list dl dt').filter(function(i,el){ return $(this).text().trim() === 'Good For'}).siblings().text().trim().toLowerCase();
//           // single.open = open.indexOf("open") !== -1;
//           // single.good_for = good_for;
//           console.log(single.open_hours,'---------', single.food_image_url);
//           single.save(function(err){
//             console.log(single.id + "   saved!!")
//             callback();
//           });
//         }
//     })
//   } ,function(){
//       if(err) console.log(err)
//       console.log("done");
//   });
// });

function processResult(rests,currentTime,cb) {
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
                  // r.food_image_url = $("div.showcase-photo-box img.photo-box-img[height='250']").first().attr("src").replace(/ls(?=.jpg)/,"o");
                  r.food_image_url = [];
                  r.open_hours = [];
                  try {
                      $("div.showcase-photo-box img.photo-box-img[height='250']").each(function(i,e){
                        r.food_image_url.push($(this).attr("src").replace(/ls(?=.jpg)/,"o"));
                      });
                      doc.food_image_url = r.food_image_url;
                      r.good_for = $('div.short-def-list dl dt').filter(function(i,el){ return $(this).text().trim() === 'Good For'}).siblings().text().trim().toLowerCase();
                      doc.good_for = r.good_for;

                      $('table.hours-table tr').each(function(i,element){
                        var day = $(this).children('th').text().trim();
                        var hours = $(this).children('td').first().text().trim();
                        r.open_hours.push({
                          day : day,
                          hours : hours
                        });
                      });
                      doc.open_hours = r.open_hours;
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
                      r.open = doc.isOpen(currentTime);
                  }  catch (error) {
                     console.log(error.message)
                     callback(error.message)
                  }                 
              }
              doc.save(function(err){
                if(err) callback(err);
                callback();
              });
            })
        } else {
          r.open = doc.isOpen(currentTime);
          r.price = doc.price;
          obj.prices += r.price;
          r.food_image_url = doc.food_image_url;
          r.good_for = doc.good_for;
          r.open_hours = doc.open_hours;
          callback();
        }
    })
  },function(err){
      cb(err, rests, obj);
  });
}

var yelp = require("yelp").createClient({
  consumer_key: "ph_JGhSGyT5lSZNSK5LBXw",
  consumer_secret: "O2MR0dFNJSHGst_Cq9fAPuozNR8",
  token: "ael3LhQAnLwKxQWDc3BjqOwgYz1SWyyV",
  token_secret: "OEdg-WFJpQRSzplKEtT1RH-3UP4"
});

function getPreference(user) {
   var sum = [];
   var cuisine_count = [];
   for(var i in data.dic) {
     cuisine_count.push(0);
     sum.push(0);
   }
   if(user.history.length === 0 ) return sum;
   for(var rh = 0 ; rh < user.history.length ; rh++) {
     var arr = user.history[rh].restaurant.categories;
     for(var c = 0 ;c <  arr.length ; c++) {
       var index = data.dic[arr[c]];
       cuisine_count[index] += 1/arr.length;
     }
   }
   console.log(cuisine_count)
   for(var j= 0 ; j<data.map[0].length ; j++) {
     for(var i in cuisine_count) {
       sum[j] +=cuisine_count[i] * parseFloat(data.map[i][j]) / 100.0;
     }
   }
  var s = new Stats().push(sum);
  var mean = s.percentile(30);
  var stddev = s.stddev();

   var preference = [];
   for(var i in sum) {
     preference.push((sum[i]-mean)/3/stddev);
   }

   return preference;
  
};

function getScore(rest,preference,comment_avg,price_avg,avgUserPrice) {
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
    price:10,
    time:30
  }
  
  if(!rest.open) {
    return {
      closed : true,
      rating_score : 0,
      cuisine_score : 0,
      distance_score : 0,
      comment_score : 0,
      price_score : 0,
      time_score : 0,
      total_score: 0
    }
  }


  var rating_score = (rest.rating - 2) * base.rating /3;
  var max_cuisine_score = Number.NEGATIVE_INFINITY;
  var max_time_score = Number.NEGATIVE_INFINITY;
  var price_score;
  var cuisine_score;
  var time_score;
  try {
     for(var iter in rest.categories) {
      // console.log(rest.categories[iter])
       if(typeof data.dic[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]] === 'undefined') {
          max_time_score =  Math.max(max_time_score, parseInt(getTimeMap['Others'][time_zone[parseInt(moment().format('HH'))]].slice(0,-1)));
          continue;
       }
       max_cuisine_score = Math.max(max_cuisine_score, preference[data.dic[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]]]);
       if(!getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]]) {
         console.log(getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]],rest.categories[iter],  getCateMap[rest.categories[iter][0].replace(/\s/g,"_")])
       } 
       max_time_score = Math.max(max_time_score, parseInt(getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]][time_zone[parseInt(moment().format('HH'))]].slice(0,-1)));
       //console.log(getCateMap[rest.categories[iter][0].replace(/\s/g,"_")] , "----" , getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]][time_zone[parseInt(moment().format('HH'))]].slice(0,-1))
      //console.log(time_zone[parseInt(moment().format('HH'))])
     }
     max_time_score *=  1.0 * base.time/100;
     if(rest.good_for) {
       if(rest.good_for.replace(/\s+/,"").indexOf(time_zone[parseInt(moment().format('HH'))]) !== -1) {
         max_time_score +=1;
       }
     }
     time_score = max_time_score;
     if(isFinite(max_cuisine_score)) {
       cuisine_score = ( max_cuisine_score + 0.5) * base.cuisine;
     } else {
       console.log("no cuisine score the rest categories is ", rest.categories,"the restaurant ID is " + rest.id)
       cuisine_score = 0;
     } 
  } catch(error) {
     console.log(error.message);
     return  {
      rating_score : 0,
      cuisine_score : 0,
      distance_score : 0,
      comment_score : 0,
      price_score : 0,
      time_score : 0,
      total_score: 0
     }
  }
  
  var price_socre;
  var distance_score = (Math.exp(1-rest.distance/400))* base.distance/2.718
  var comment_score = (rest.review_count > comment_avg ? Math.log(rest.review_count) / Math.log(comment_avg) : rest.review_count/comment_avg) * base["comments"];
  price_score = rest.price < avgUserPrice ? base.price : base.price/(1 + (rest.price - avgUserPrice) * 2 );
  var total_score =  rating_score + cuisine_score + distance_score + comment_score + price_score + time_score;
  return {
    rating_score : rating_score,
    cuisine_score : cuisine_score,
    distance_score : distance_score,
    comment_score : comment_score,
    price_score : price_score,
    time_score : time_score,
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
      if(! rest) {
        return res.send('restaurant undefined');
      }
        if(user === null) {
           var user   = new User();
           user.username    = req.body.username;
          
        }
        var temp = [];

        for(var iter in rest.categories) {

          if(typeof data.dic[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]] === 'undefined'){
            continue;
          }
          temp.push(getCateMap[rest.categories[iter][0].replace(/\s/g,'_')]);
        }
        rest.categories = temp;
        Restaurant.findOneAndUpdate({id : rest.id}, rest, function(err, r){
          if(err) return res.send(err);
          else {
            user.history.push({
              restaurant:r._id,
              like:req.body.like
            });
            user.save(function(err) {
              if (err) return res.send(err);
              res.send("user saved");
            });
          }
        });
     })
  });


 router.get('/user/:name', function(req,res) {
  if(!req.params.name) return res.send("no username is found");
   User.findOne({username : req.params.name}).populate('history.restaurant').exec(function(err,user){
    console.log(user)

    if(err) res.send(err);
    if(!user) res.send('user not exist');
    else {
      try{
        var preference = getPreference(user);

        res.send({
          user : user,
          preference : preference
        })
      } catch(err) {
        return res.send(err.message)
      }
    }
   });
 });


/* GET home page. */
router.post('/search', function(req, res) {
  if(!req.body.username) return res.send("no username found in the request body");
  var radius = req.body.radius || String(500);
  var currentTime = req.body.time;
  console.log("radius is :" + radius , "currentTime is :"  + req.body.time)
  User.findOne({username:req.body.username}).populate('history.restaurant').exec(function(err,user){

  if(user === null) {
     console.log("no user is find in the databse, will create a new one");
     var user   = new User();
     user.username    = req.body.username;
  }
  var preference;
  try{
    preference = getPreference(user);
    console.log("preference is " , preference);
    var totalUserPrice = 0;
    for(var i =0 ; i < user.history.length ; i++) {
      var price = user.history[i].restaurant.price || 0;
      totalUserPrice += parseInt(price);
    }
    console.log(totalUserPrice)
    var avgUserPrice = totalUserPrice === 0 ? 3.4 : totalUserPrice/user.history.length ;
    console.log("average price is " , avgUserPrice)
  } catch(error) {
    return res.send(error.message)
  }
  var first;
  var second;
  async.parallel([
     function(callback){
        yelp.search({category_filter:"restaurants",sort:"2",ll:req.body.latitude+","+req.body.longitude,radius_filter :"500" ,limit:'20',offset:'0'}, function(err,d){
          first = d.businesses;
          if(!first) return callback('no result');
          console.log("got ",first.length, "restaurants")
          if(err) return callback(err);
          else return callback(null);
        });
      },
      function(callback){
        yelp.search({category_filter:"restaurants",sort:"2",ll:req.body.latitude+","+req.body.longitude,radius_filter :"500" ,limit:'20',offset:'20'}, function(err,d){
          second = d.businesses;
          if(!second) return callback('no result');
          console.log("got ",second.length, "restaurants")
          if(err) return callback(err);
          else return callback(null);
        });
      }
    ],function(err){
      if(err) return res.send(err);
      var temp = _.union(first,second);
      try{
        processResult(temp,currentTime,function(err,rests,total_obj){
           if(err) return res.send(err);
           // rests.forEach(function(d){
              
           // });

           var open_restaurants = _.filter(rests,function(d) {
              d.score = getScore(d,preference,total_obj.comments/temp.length,total_obj.prices/temp.length,avgUserPrice);
              return !d.score.closed;
           })
           var sorted_result = _.sortBy(open_restaurants,function(rest){
               return 0-rest.score.total_score;
           });
           user.save(function (err) {
             if(err) res.send(err);
             else res.send(sorted_result);
           });
         })
      } catch(e) {
        console.log(e.message);
        return res.send(e.message)
      } 
    });
});

  //"40.636385,-74.017424"
});

module.exports = router;
