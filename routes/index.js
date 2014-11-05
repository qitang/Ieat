var express = require('express');
var router = express.Router();
var yelp = require("yelp").createClient({
  consumer_key: "ph_JGhSGyT5lSZNSK5LBXw", 
  consumer_secret: "O2MR0dFNJSHGst_Cq9fAPuozNR8",
  token: "ael3LhQAnLwKxQWDc3BjqOwgYz1SWyyV",
  token_secret: "OEdg-WFJpQRSzplKEtT1RH-3UP4"
});

/* GET home page. */
router.get('/', function(req, res) {
  yelp.search({term: "restaurant",sort:"1",ll:"40.636385,-74.017424",radius_filter :"500",limit:"1",offset:"1"}, function(error, data) {
  	res.send(data)
  //console.log(error);,
  //console.log(data);
});
});

module.exports = router;
