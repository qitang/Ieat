var fs = require('fs');
var getCorrelation = function(path) {
    var contents = fs.readFileSync(path,'utf-8');
    var lines = contents.split('\n');
    var map = [];
    var dic = {};
    for(var i =0 ; i<lines.length ;i++) {
    	var split = lines[i].split(',');
    	if(split.length <=1) continue;
    	dic[split.splice(0,1)] = i;
    	map.push(split);
    }
    return {
    	map:map,
    	dic:dic
    }
};

getTimeMap = function(path) {
    var map = {};
    var contents = fs.readFileSync(path,'utf-8');
    var lines = contents.split('\n');
    var zone = lines[0].split(',');
    for(var i = 1; i < 73 ; i++) {
        var t ={};
        var scores = lines[i].split(',');
        for(var j =1 ; j < 7 ; j++) {
            t[zone[j]] = scores[j];
        }
        map[scores[0]] = t;
    }
    return map;
};

var getCateMap = function(path) {
    var contents = fs.readFileSync(path,'utf-8');
    var lines = contents.split('\r\n');
    var map = {};
    for(var i =0 ; i<lines.length ;i++) {
        var split = lines[i].split(':');
        if(split.length <=1) continue;
        map[split[0]] = split[1];
    }
    return map;
};

var getPrices = function(path) {
	var contents = fs.readFileSync(path,'utf-8');
    var lines = contents.match(/[^\r\n]+/g);
    var prices = {};
    for(var i =0 ; i <lines.length ; i++) {
    	var split = lines[i].split(':');
    	if(split[1] === "$") {
    		prices[split[0]] = 1;
    	} else if(split[1] === "$$"){
    		prices[split[0]] = 2;
    	} else if(split[1] === "$$$") {
    		prices[split[0]] = 3;
    	} else if(split[1] === "$$$$"){
    		prices[split[0]] = 4;
    	} else prices[split[0]] = 0;
    }
    return prices;
};



module.exports.getCorrelation = getCorrelation;
module.exports.getPrices = getPrices;
module.exports.getCateMap = getCateMap;
module.exports.getTimeMap = getTimeMap;
module.exports.time_zone = ['latenight','latenight','latenight','latenight','latenight','breakfast','breakfast','breakfast','breakfast','breakfast','breakfast','lunch','lunch','lunch','lunch','dessert','dessert','dinner','dinner','dinner','dinner','dinner','latenight','latenight']
