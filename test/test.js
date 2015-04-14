var request = require('superagent');
var expect = require('expect.js');
var app = require("../app.js");


describe('search', function(){
  describe('prices', function(){
  	before(function(done) {
  	  app.set('port', process.env.PORT || 3000);
  	  var server = app.listen(app.get('port'), function() {
  	    console.log('Express server listening on port ' + server.address().port);
  	    done()
  	  });
  	});
  	
    it('all restaurant should have price', function(done){
      request.get("localhost:3000/search?username=loop&latitude=40.632904&longitude=-73.987921").end(function(err, res){
      	res.body.forEach(function(restaurant){
      		expect(restaurant).to.have.property('price');
      	});
      	done();
      });
    });

    it("number of results should be the same as foursquare api", function(done){
    	request.get("https://api.foursquare.com/v2/venues/explore?ll=40.632904,-73.987921&client_id=ORSKR0AIZN0RB03PAPWN1LUVE3NMAOW44DE4BELTI0HLH2WK&client_secret=CHHO2A1PUGSOVWRW3YPCBKPP04NACBTDXVHM0W45XAMVT0AW&v=20140806&query=food&venuePhotos=1&openNow=1").end(function(err, fsResults){
    		request.get("localhost:3000/search?username=loop&latitude=40.632904&longitude=-73.987921").end(function(err, res){
    			expect(res.body.length).to.equal(fsResults.body.response.groups[0].items.length);
    			done();
    		})
    	})
    })
    // for(var i = 0 ;i <100 ;i++) {
    // 	it("foursquare api", function(done){
    // 		request.get("https://api.foursquare.com/v2/venues/explore?ll=40.632904,-73.987921&client_id=ORSKR0AIZN0RB03PAPWN1LUVE3NMAOW44DE4BELTI0HLH2WK&client_secret=CHHO2A1PUGSOVWRW3YPCBKPP04NACBTDXVHM0W45XAMVT0AW&v=20140806&query=food&venuePhotos=1&openNow=1").end(function(err, fsResults){
    // 			// request.get("localhost:3000/search?username=loop&latitude=40.632904&longitude=-73.987921").end(function(err, res){
    // 			// 	expect(res.body.length).to.equal(fsResults.body.response.groups[0].items.length);
    // 			// 	done();
    // 			// })
    // 		    fsResults.body.response.groups[0].items.forEach(function(item){
    // 		    	expect(item.venue).to.have.property('price');
    // 		    	//expect(item.venue).to.have.property('url');
    // 		    })
    // 		    done();
    // 		})
    // 	})
    // }
  })
})