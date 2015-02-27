var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
// var moment = require('moment');
var moment = require('moment-timezone');
//mongoose.connect('mongodb://localhost/wikistack');
mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/Ieat');
//mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/Ieat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var User,Restaurant;
var Schema = mongoose.Schema;

var restaurantSchema = new Schema({
  id:String,
  price:Number,
  food_image_url:[String],
  good_for: String,
  open:Boolean,
  open_hours:[{
    day : String,
    hours : String
  }],
  categories:[String],
  is_claimed:Boolean,
  is_closed :Boolean,
  name:String,
  image_url:String,
  mobile_url : String,
  phone : String,
  display_phone:String,
  review_count: Number,
  rating: String,
  snippet_text: String,
  menu_provier:String,
  menu_date_updated:String,
  location :{
    city : String,
    display_address : [String],
    geo_accuracy : Number,
    postal_code : String,
    country_code : String,
    address : [String],
    state_code : String,
    coordinate : {
      latitude : Number,
      longitude : Number
    }
  }
});

var userSchema = new Schema({
   username : String,
   password: String,
   age:Number,
   sex:String,
   address:String,
   title:String,
   ave_price: Number,
   history:[{
    restaurant : { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    like:Number
   }]
});

//methods =====
//generating a password hash

userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


//checking if password is valid
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
};


restaurantSchema.methods.isOpen = function() {
  if(!this.open_hours || this.length ===0) return true;
  var now = moment().tz("America/New_York");
  var day = now.format("YYYY-MM-DD");
  var today = now.format('ddd HH:mm').split(' ')[0];
  for(var i =0 ; i< this.open_hours.length ; i++) {
    if( this.open_hours[i].day === today) {
      var hours = this.open_hours[i].hours.replace(/\n|\s/g,'').split('-');
      if(hours.length < 2) return false;
      var left = moment.tz(day + " " + hours[0] , 'YYYY-MM-DD hmma','America/New_York');
      var right = moment.tz(day + " " + hours[1] , 'YYYY-MM-DD hmma','America/New_York');
      if(now.isBefore(left,'minute')) return false;
      //if open hours to am, means untill tomorrow
      if(hours[1].indexOf('am') !== -1) return true;
      if(now.isAfter(right, 'minute')) return false;
      return true;
    }
  }
  return true;
};

User = mongoose.model('User', userSchema);
Restaurant = mongoose.model('Restaurant',restaurantSchema);

module.exports = {"User": User, "Restaurant": Restaurant};

