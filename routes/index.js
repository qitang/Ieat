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

// var stream = fs.createWriteStream("map1.txt");
// var contents = fs.readFileSync('map.txt','utf-8');
// contents.split('\r\n').forEach(function(line){
//   var temp = line.split('\t');
//   stream.write(temp[1] + ":" + temp[3] + "\r\n");
// });
// stream.end()

var config = {
  'secrets' : {
    'clientId' : 'ORSKR0AIZN0RB03PAPWN1LUVE3NMAOW44DE4BELTI0HLH2WK',
    'clientSecret' : 'CHHO2A1PUGSOVWRW3YPCBKPP04NACBTDXVHM0W45XAMVT0AW',
    'redirectUrl' : 'http://dry-fortress-8563.herokuapp.com/'
  }
}




var foursquare = function(latitude, longitude,radius, callback) {
  var radiusString = '';
  if(radius) radiusString = "&radius=" + radius;
  request({
      url : "https://api.foursquare.com/v2/venues/explore?ll=" + latitude + "," + longitude + radiusString +  "&client_id=ORSKR0AIZN0RB03PAPWN1LUVE3NMAOW44DE4BELTI0HLH2WK&client_secret=CHHO2A1PUGSOVWRW3YPCBKPP04NACBTDXVHM0W45XAMVT0AW&v=20140806&query=food&venuePhotos=1",
      json : true
    },function(err, response, body){
        //console.log(body.response)
        try {
           callback(err,body.response.groups[0].items);
         } catch(e) {
          callback(e,null);
         }
       
    }
  );
}

// request({
//   url : 'https://api.foursquare.com/v2/venues/explore?ll=40.7,-74&client_id=ORSKR0AIZN0RB03PAPWN1LUVE3NMAOW44DE4BELTI0HLH2WK&client_secret=CHHO2A1PUGSOVWRW3YPCBKPP04NACBTDXVHM0W45XAMVT0AW&v=20140806&query=restaurant',
//   json : true
// }, function(err, response, body){
//   console.log(body.response.groups[0].items);
//   fs.writeFile('test.txt',JSON.stringify(body.response.groups[0]),function(){
//       console.log("saved")
//   })
  // body.response.groups[0].items.forEach(function(r){
  //     //console.log(r.venue,"++++")
  //     r.tips.forEach(function(d){
  //       console.log("----------", d.photo.suffix)
  //     });
  // });
// })

// Restaurant.findOne({id:'statler-grill-new-york'},function(err,user){
//    console.log("haha",user.isOpen("2015-03-29 3:55:18-04:00"), user.open_hours);
// })

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
// //query.limit(1000);
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

// function processResult(rests,currentTime,cb) {
//   var obj = {
//        comments : 0,
//         prices : 0 
//   }
  
//   async.each(rests,function(r,callback){
//     obj.comments += r.review_count;
//     Restaurant.findOne({id:r.id},function(err,doc){
//         if(doc ===null) {
//            // doc = new Restaurant();
//            // doc.id = r.id;
//             request({
//                url: "http://www.yelp.com/biz/" + r.id,
//                json: true
//             }, function (error, response, body) {
//               if (!error && response.statusCode === 200) {
//                   var $ = cheerio.load( body);
//                   // r.food_image_url = $("div.showcase-photo-box img.photo-box-img[height='250']").first().attr("src").replace(/ls(?=.jpg)/,"o");
//                   r.food_image_url = [];
//                   r.open_hours = [];
//                   try {
//                       $("div.showcase-photo-box img.photo-box-img[height='250']").each(function(i,e){
//                         r.food_image_url.push($(this).attr("src").replace(/ls(?=.jpg)/,"o"));
//                       });
//                      // doc.food_image_url = r.food_image_url;
//                       r.good_for = $('div.short-def-list dl dt').filter(function(i,el){ return $(this).text().trim() === 'Good For'}).siblings().text().trim().toLowerCase();
//                       //doc.good_for = r.good_for;

//                       $('table.hours-table tr').each(function(i,element){
//                         var day = $(this).children('th').text().trim();
//                         var hours = $(this).children('td').first().text().trim();
//                         r.open_hours.push({
//                           day : day,
//                           hours : hours
//                         });
//                       });
//                       //doc.open_hours = r.open_hours;
//                       var p = $('div.price-category span.price-range').text();
//                       if(p) {
//                         r.price = p.trim().length;
//                         //doc.price = r.price;
//                         obj.price += r.price;
//                       } else {
//                         r.price = 2.5;
//                         //doc.price = 2.5;
//                         obj.prices += 2.5;
//                       }
                      
//                   }  catch (error) {
//                      console.log(error.stack)
//                      callback(error.stack)
//                   }                 
//               }
//               Restaurant.create(r,function(err,newDoc){
//                 r.open = newDoc.isOpen(currentTime);
//                 if(err) callback(err);
//                 callback();
//               })
//               // doc.save(function(err){
//               //   r.open = r.isOpen(currentTime);
//               //   if(err) callback(err);
//               //   callback();
//               // });
//             })
//         } else {
//           r.open = doc.isOpen(currentTime);
//           r.price = doc.price;
//           obj.prices += r.price;
//           r.food_image_url = doc.food_image_url;
//           r.good_for = doc.good_for;
//           r.open_hours = doc.open_hours;
//           callback();
//         }
//     })
//   },function(err){
//       cb(err, rests, obj);
//   });
// }

var yelp = require("yelp").createClient({
  consumer_key: "ph_JGhSGyT5lSZNSK5LBXw",
  consumer_secret: "O2MR0dFNJSHGst_Cq9fAPuozNR8",
  token: "ael3LhQAnLwKxQWDc3BjqOwgYz1SWyyV",
  token_secret: "OEdg-WFJpQRSzplKEtT1RH-3UP4"
});
// var seed = [];
// for(var i = 0 ; i <=1000 ; i+=20) {
//   seed.push(i);
// }
// async.each(seed,function(offset , callback){
//    yelp.search({category_filter:"restaurants",ll:"40.768769, -73.993927",radius_filter : "10000" ,offset:String(offset)}, function(err,d){
//           first = d.businesses;
//           if(!first) return callback('no result');
//           console.log("got ",first.length, "restaurants")
//           if(err) return callback(err);
//           else {
//             async.each(first,function(doc,callback1){
//               Restaurant.findOne({id:doc.id},function(err,rest){
//                 if(rest) return callback1(null);
//                 Restaurant.create(doc,function(err,d){
//                   console.log(err,"ssss")
//                   if(err) callback1(err);
//                   else callback1(null);
//                 })
//               })
//             },function(err){callback()})
//           }
//         });
// },function(err){
//   console.log("done")
// })



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
     console.log("the restaurant is " ,user.history[rh].restaurant);
     if(!arr) {
        continue;
     }
     for(var c = 0 ;c <  arr.length ; c++) {
       var index = data.dic[arr[c].global];
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
  var mean = Math.max(s.percentile(50),0.0000000001);
  var stddev = Math.max(s.stddev(),0.0001);

   var preference = [];
   for(var i in sum) {
     preference.push((sum[i]-mean)/3/stddev);
   }

   return preference;
  
};



function getScore(rest,preference,comment_avg,avgUserPrice,radius,currentTime) {
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
  
  var rating_score = (rest.rating - 2) * base.rating /3;
  var max_cuisine_score = Number.NEGATIVE_INFINITY;
  var max_time_score = Number.NEGATIVE_INFINITY;
  var price_score;
  var cuisine_score;
  var time_score;
  var currentHour;
  if(currentTime) {
    currentHour = parseInt(moment(currentTime).format('HH'));
  } else {
    currentHour = parseInt(moment().format('HH'));
  }
  try {
     for(var iter in rest.categories) {
      // console.log(rest.categories[iter])
       if(typeof data.dic[getCateMap[rest.categories[iter].id]] === 'undefined') {
        console.log("undefine categories" + getCateMap[rest.categories[iter].id]);
          max_time_score =  Math.max(max_time_score, parseInt(getTimeMap['Others'][time_zone[currentHour]].slice(0,-1)));
          continue;
       }
       var global_category = getCateMap[rest.categories[iter].id];
       rest.categories[iter].global = global_category;
       max_cuisine_score = Math.max(max_cuisine_score, preference[data.dic[global_category]]);
       if(!getTimeMap[global_category]) {
         console.log(getTimeMap[global_category],rest.categories[iter],  global_category);
       } 
       max_time_score = Math.max(max_time_score, parseInt(getTimeMap[global_category][time_zone[currentHour]].slice(0,-1)));
       //console.log(getCateMap[rest.categories[iter][0].replace(/\s/g,"_")] , "----" , getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]][time_zone[currentHour]].slice(0,-1))
      //console.log(time_zone[currentHour])
     }
    if(!isFinite(max_time_score)) {
      max_time_score =  Math.max(max_time_score, parseInt(getTimeMap['Others'][time_zone[currentHour]].slice(0,-1)));
    }
     max_time_score *=  1.0 * base.time/100;
     // if(rest.good_for) {
     //   if(rest.good_for.replace(/\s+/,"").indexOf(time_zone[parseInt(moment().format('HH'))]) !== -1) {
     //     max_time_score +=1;
     //   }
     // }
     time_score = max_time_score;
     if(isFinite(max_cuisine_score)) {
       cuisine_score = ( max_cuisine_score + 0.5) * base.cuisine;
     } else {
       console.log("no cuisine score the rest categories is ", rest.categories,"the restaurant ID is " + rest.id)
       cuisine_score = 0;
     } 
  } catch(error) {
     console.log(error.stack);
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
  var distance_score = (Math.exp(1-parseInt(rest.location.distance)/radius))* base.distance/2.718
  var comment_score = (rest.stats.checkinsCount > comment_avg ? Math.log(rest.stats.checkinsCount) / Math.log(comment_avg) : rest.stats.checkinsCount/comment_avg) * base["comments"];
  price_score = parseInt(rest.price.tier) < avgUserPrice ? base.price : base.price/(1 + (parseInt(rest.price.tier) - avgUserPrice) * 2 );
  //console.log(rest.id, parseInt(rest.price.tier), avgUserPrice)
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

// function getScore(rest,preference,comment_avg,avgUserPrice,radius,currentTime) {
//   var average = {
//       rating:0,
//       comments:0,
//       distance:0,
//   }
//   var base = {
//     rating:30,
//     cuisine:30,
//     comments:10,
//     distance:20,
//     price:10,
//     time:30
//   }
  
//   if(!rest.open) {
//     return {
//       closed : true,
//       rating_score : 0,
//       cuisine_score : 0,
//       distance_score : 0,
//       comment_score : 0,
//       price_score : 0,
//       time_score : 0,
//       total_score: 0
//     }
//   }


//   var rating_score = (rest.rating - 2) * base.rating /3;
//   var max_cuisine_score = Number.NEGATIVE_INFINITY;
//   var max_time_score = Number.NEGATIVE_INFINITY;
//   var price_score;
//   var cuisine_score;
//   var time_score;
//   var currentHour;
//   if(currentTime) {
//     currentHour = parseInt(moment(currentTime).format('HH'));
//   } else {
//     currentHour = parseInt(moment().format('HH'));
//   }
//   try {
//      for(var iter in rest.categories) {
//       // console.log(rest.categories[iter])
//        if(typeof data.dic[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]] === 'undefined') {
//           max_time_score =  Math.max(max_time_score, parseInt(getTimeMap['Others'][time_zone[currentHour]].slice(0,-1)));
//           continue;
//        }
//        max_cuisine_score = Math.max(max_cuisine_score, preference[data.dic[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]]]);
//        if(!getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]]) {
//          console.log(getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]],rest.categories[iter],  getCateMap[rest.categories[iter][0].replace(/\s/g,"_")])
//        } 
//        max_time_score = Math.max(max_time_score, parseInt(getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]][time_zone[currentHour]].slice(0,-1)));
//        //console.log(getCateMap[rest.categories[iter][0].replace(/\s/g,"_")] , "----" , getTimeMap[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]][time_zone[currentHour]].slice(0,-1))
//       //console.log(time_zone[currentHour])
//      }
//     if(!isFinite(max_time_score)) {
//       max_time_score =  Math.max(max_time_score, parseInt(getTimeMap['Others'][time_zone[currentHour]].slice(0,-1)));
//     }
//      max_time_score *=  1.0 * base.time/100;
//      if(rest.good_for) {
//        if(rest.good_for.replace(/\s+/,"").indexOf(time_zone[parseInt(moment().format('HH'))]) !== -1) {
//          max_time_score +=1;
//        }
//      }
//      time_score = max_time_score;
//      if(isFinite(max_cuisine_score)) {
//        cuisine_score = ( max_cuisine_score + 0.5) * base.cuisine;
//      } else {
//        console.log("no cuisine score the rest categories is ", rest.categories,"the restaurant ID is " + rest.id)
//        cuisine_score = 0;
//      } 
//   } catch(error) {
//      console.log(error.stack);
//      return  {
//       rating_score : 0,
//       cuisine_score : 0,
//       distance_score : 0,
//       comment_score : 0,
//       price_score : 0,
//       time_score : 0,
//       total_score: 0
//      }
//   }
  
//   var price_socre;
//   var distance_score = (Math.exp(1-rest.distance/radius))* base.distance/2.718
//   var comment_score = (rest.review_count > comment_avg ? Math.log(rest.review_count) / Math.log(comment_avg) : rest.review_count/comment_avg) * base["comments"];
//   price_score = rest.price < avgUserPrice ? base.price : base.price/(1 + (rest.price - avgUserPrice) * 2 );
//   console.log(rest.id, rest.price, avgUserPrice)
//   var total_score =  rating_score + cuisine_score + distance_score + comment_score + price_score + time_score;
//   return {
//     rating_score : rating_score,
//     cuisine_score : cuisine_score,
//     distance_score : distance_score,
//     comment_score : comment_score,
//     price_score : price_score,
//     time_score : time_score,
//     total_score: total_score
//   };
// }

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
    if(!req.body.username) return res.send("username undefined!");
     User.findOne({username:req.body.username},function(err, user){
      var rest = req.body.restaurant;
      if(! rest) {
        return res.send('restaurant undefined');
      }
        if(user === null) {
           var user   = new User();
           user.username    = req.body.username;
          
        }
        // var temp = [];

        // for(var iter in rest.categories) {

        //   if(typeof data.dic[getCateMap[rest.categories[iter][0].replace(/\s/g,"_")]] === 'undefined'){
        //     continue;
        //   }
        //   temp.push(getCateMap[rest.categories[iter][0].replace(/\s/g,'_')]);
        // }
        // rest.categories = temp;
        Restaurant.findOneAndUpdate({id : rest.id}, rest,{upsert:true}, function(err, r){
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
        return res.send(err.stack)
      }
    }
   });
 });

router.post('/search', function(req,res){
    if(!req.body.username) return res.send("no username found in the request body");
    if(!req.body.latitude) return res.send("no latitude found in the request body");
    if(!req.body.longitude) return res.send("no longitude found in the request body");
    var currentTime = req.body.time;

    foursquare(req.body.latitude, req.body.longitude,req.body.radius, function(err,data){
      if(err) {
        console.log(err);
        return res.status(400).end();
      } else {
        console.log(data);
        if(!data) res.send(data);
        data = _.map(data,function(d){
          return d.venue;
        })
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
            console.log(user)
            for(var i =0 ; i < user.history.length ; i++) {
              var price = user.history[i].restaurant.price.tier || 0;
              totalUserPrice += parseInt(price);
            }
            console.log(totalUserPrice)
            var avgUserPrice = totalUserPrice === 0 ? 3.4 : totalUserPrice/user.history.length ;
            console.log("average price is " , avgUserPrice);
            var totalComments = 0;
            var open_restaurants = data.filter(function(restaurant){
              try{
                  if(!restaurant.hours) return false;
                  var photoItem = restaurant.photos.groups[0].items[0];
                  restaurant.food_image_url = [photoItem.prefix + photoItem.width + 'x' + photoItem.height + photoItem.suffix];
                  if(restaurant.hours.isOpen) {
                        totalComments += restaurant.stats.checkinsCount;
                  }
              } catch(e){
                    console.log(e.stack);
              }
              if(restaurant.hours) return restaurant.hours.isOpen;
            });
            open_restaurants.forEach(function(restaurant){
             restaurant.score = getScore(restaurant,preference,totalComments/open_restaurants.length,avgUserPrice,req.body.radius || 500,currentTime);
            });
            var sorted_results = _.sortBy(open_restaurants,function(rest){
                return 0-rest.score.total_score;
            });
            async.each(data,function(doc,callback){
                Restaurant.findOne({id : doc.id},function(err,restaurant){
                  if(err) return callback(err);
                  if(restaurant) return callback(null);
                  Restaurant.create(doc, function(err, newDoc){
                    if(err) return callback(err);
                    return callback(null);
                  })
                });
            },function(err){
              if(err) {
                console.log(err);
                res.send([]);
              } else {
                user.save(function (err) {
                  if(err) res.send(err);
                  else res.send(sorted_results);
                });
              }
            });
          } catch(error) {
            return res.send(error.stack)
          }
        });
      }
    });
}); 

/* GET home page. */
// router.post('/search', function(req, res) {
//   if(!req.body.username) return res.send("no username found in the request body");
//   var radius = req.body.radius || String(500);
//   var currentTime = req.body.time;
//   console.log("radius is :" + radius , "currentTime is :"  + req.body.time)
//   User.findOne({username:req.body.username}).populate('history.restaurants').exec(function(err,user){

//   if(user === null) {
//      console.log("no user is find in the databse, will create a new one");
//      var user   = new User();
//      user.username    = req.body.username;
//   }
//   var preference;
//   try{
//     preference = getPreference(user);
//     console.log("preference is " , preference);
//     var totalUserPrice = 0;
//     for(var i =0 ; i < user.history.length ; i++) {
//       var price = user.history[i].restaurant.price || 0;
//       totalUserPrice += parseInt(price);
//     }
//     console.log(totalUserPrice)
//     var avgUserPrice = totalUserPrice === 0 ? 3.4 : totalUserPrice/user.history.length ;
//     console.log("average price is " , avgUserPrice)
//   } catch(error) {
//     return res.send(error.stack)
//   }
//   var first;
//   var second;
//   async.parallel([
//      function(callback){
//         yelp.search({category_filter:"restaurants",sort:"2",ll:req.body.latitude+","+req.body.longitude,radius_filter : radius ,limit:'20',offset:'0'}, function(err,d){
//           first = d.businesses;
//           if(!first) return callback('no result');
//           console.log("got ",first.length, "restaurants")
//           if(err) return callback(err);
//           else return callback(null);
//         });
//       },
//       function(callback){
//         yelp.search({category_filter:"restaurants",sort:"2",ll:req.body.latitude+","+req.body.longitude,radius_filter : radius ,limit:'20',offset:'20'}, function(err,d){
//           second = d.businesses;
//           if(!second) return callback('no result');
//           console.log("got ",second.length, "restaurants")
//           if(err) return callback(err);
//           else return callback(null);
//         });
//       }
//     ],function(err){
//       if(err) return res.send(err);
//       var all_results = _.union(first,second);
//       try{
//         processResult(all_results,currentTime,function(err,rests,total_obj){
//            if(err) return res.send(err);
//            // rests.forEach(function(d){
              
//            // });

//            var open_restaurants = _.filter(rests,function(d) {
//               d.score = getScore(d,preference,total_obj.comments/all_results.length,total_obj.prices/all_results.length,avgUserPrice,radius,currentTime);
//               return !d.score.closed;
//            })
//            var sorted_results = _.sortBy(open_restaurants,function(rest){
//                return 0-rest.score.total_score;
//            });
//            user.save(function (err) {
//              if(err) res.send(err);
//              else res.send(sorted_results);
//            });
//          })
//       } catch(e) {
//         console.log(e.stack);
//         return res.send(e.stack)
//       } 
//     });
// });

//   //"40.636385,-74.017424"
// });

module.exports = router;
