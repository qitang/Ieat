var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
// var moment = require('moment');
var moment = require('moment-timezone');
//mongoose.connect('mongodb://localhost/eatnow');
mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/eatnow');
//mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/Ieat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var User,Restaurant;
var Schema = mongoose.Schema;

// var restaurantSchema = new Schema({
//   id:String,
//   price:Number,
//   food_image_url:[String],
//   good_for: String,
//   open:Boolean,
//   open_hours:[{
//     day : String,
//     hours : String
//   }],
//   categories:[String],
//   is_claimed:Boolean,
//   is_closed :Boolean,
//   name:String,
//   image_url:String,
//   mobile_url : String,
//   phone : String,
//   display_phone:String,
//   review_count: Number,
//   rating: String,
//   snippet_text: String,
//   menu_provier:String,
//   menu_date_updated:String,
//   location :{
//     city : String,
//     display_address : [String],
//     geo_accuracy : Number,
//     postal_code : String,
//     country_code : String,
//     address : [String],
//     state_code : String,
//     coordinate : {
//       latitude : Number,
//       longitude : Number
//     }
//   }
// });

var restaurantSchema = new Schema({
  url: String,
  vendorUrl : String,
  price:{
    tier : Number,
    message : String,
    currency : String
  },
  rating : Number,
  contact : {
    phone : String,
    formattedPhone : String,
    twitter : String,
    facebook :String
  },
  id:String,
  location:  {
          address: String,
          crossStreet: String,
          lat: Number,
          lng: Number,
          postalCode: String,
          cc: String,
          city: String,
          state: String,
          country: String,
  },
  food_image_url:[String],
  categories:[{
    id : String,
    name : String,
    global : String,
    shortName : String
  }],
  name:String,
  stats : {
    checkinsCount : String,
    usersCount : String,
    tipCount : String
  }
});

var historySchema = new Schema({
  restaurant : { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  like:Number,
  location :{
    latitude : Number,
    longitude : Number,
    distance : Number
  },
  date : {type: Date, default: Date.now},
  utc_offset :  String 
});

var userSchema = new Schema({
   username : String,
   password: String,
   age:Number,
   sex:String,
   address:String,
   title:String,
   ave_price: Number,
   all_history:[{ type: Schema.Types.ObjectId, ref: 'History' },]
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


restaurantSchema.methods.isOpen = function(now) {
  if(!this.open_hours || this.open_hours.length === 0) return true;
  var now;
  if(now) {
    now = moment(now);
  } else {
   now = moment();
  }
  var today = now.format('ddd HH:mm').split(' ')[0];
  var todayHours = now.format('ddd HH:mm').split(' ')[1];
  for(var i =0 ; i< this.open_hours.length ; i++) {
    if( this.open_hours[i].day === today) {
      try {
        if(/Closed/i.test(this.open_hours[i].hours)) return false;
        var hours = this.open_hours[i].hours.replace(/\n|\s/g,'').split('-');
        if(hours.length < 2) return false;
        var target = moment(todayHours, 'hmma');
        var left = moment(hours[0] , 'hmma');
        var right = moment(hours[1] , 'hmma');
        if(now.isBefore(left,'minute')) return false;
        //if open hours to am, means untill tomorrow
        if(hours[1].indexOf('am') !== -1) return true;
        if(now.isAfter(right, 'minute')) return false;
        return true;

      } catch(error) {
        console.log(error.message)
        return false;
      }
    }
  }
    return false;
};

User = mongoose.model('User', userSchema);
Restaurant = mongoose.model('Restaurant',restaurantSchema);
History = mongoose.model('History',historySchema);

module.exports = {"User": User, "Restaurant": Restaurant, "History" : History};

