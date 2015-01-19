var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
mongoose.connect('mongodb://localhost/wikistack');
//mongoose.connect('mongodb://heroku_app31997271:7fhar9roop1b3b6pofksour5qi@ds053310.mongolab.com:53310/heroku_app31997271/Ieat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var User,Restaurant;
var Schema = mongoose.Schema;

var restaurantSchema = new Schema({
  id:String,
  price:Number,
  food_image_url:String
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


User = mongoose.model('User', userSchema);
Restaurant = mongoose.model('Restaurant',restaurantSchema);

module.exports = {"User": User, "Restaurant": Restaurant};

