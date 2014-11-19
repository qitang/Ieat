var fs = require('fs');
var getCorrelation = function(path) {
    var contents = fs.readFileSync(path,'utf-8');
    var lines = contents.split('\n');
    var map = {};
    for(var i =0 ; i<lines.length ;i++) {
    	var split = lines[i].split(',');
    	if(split.length <=1) continue;
    	map[split.splice(0,1)] = split;
    }
    return map;
}
module.exports = getCorrelation;
