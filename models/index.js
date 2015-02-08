var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
 //mongoose.connect('mongodb://localhost/wikistack');
// mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/Ieat');
mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/Ieat');
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
  }]
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
    id:String,
    categories: [String],
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
  if(!this.open_hours) return false;
  var now = moment();
  var today = now.format('ddd HH:mm').split(' ')[0];
  for(var i =0 ; i< this.open_hours.length ; i++) {
    if( this.open_hours[i].day === today) {
      var hours = this.open_hours[i].hours.replace(/\n|\s/g,'').split('-');
      var left = moment(hours[0] , 'hmma');
      //if open hours to am, means untill tomorrow
      if(hours[1].indexOf('am') !== -1) return true;
      var right = moment(hours[1] , 'hmma');
      if(now.isBefore(left,'minute')) return false;
      if(now.isAfter(right, 'minute')) return false;
      return true;
    }
  }
  return false;
};

User = mongoose.model('User', userSchema);
Restaurant = mongoose.model('Restaurant',restaurantSchema);

module.exports = {"User": User, "Restaurant": Restaurant};

