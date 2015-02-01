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
}

var getCateMap = function(path) {
    var contents = fs.readFileSync(path,'utf-8');
    var lines = contents.split('\r\n');
    var map = {};
    for(var i =0 ; i<lines.length ;i++) {
        var split = lines[i].split(':');
        if(split.length <=1) continue;
        map[0] = split[1];
    }
    return map;
}

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
}


module.exports.getCorrelation = getCorrelation;
module.exports.getPrices = getPrices;
module.exports.getCateMap = getCateMap;
