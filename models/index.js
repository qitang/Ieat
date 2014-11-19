
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ieat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
var  User;
var Schema = mongoose.Schema;
 
var userSchema = new Schema({
  name: String,
  // history: [{
  // 	yelpID:String,
  // 	category: String,
  // 	//distance: Double,
  // 	date:Date.now,
  // 	//rating:Double,
  // 	review_count: Number
  // }],
  bucket: Object
});
 
User = mongoose.model('User', userSchema);
 
module.exports = {"User": User};