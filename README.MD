# API

method | route | url parameters | payload | return value | notes
-- | -- | -- | --
__GET__ | /search | username,latitude,longitude,time,radius | | list of sorted restaurants | time is optional if not given,time would be server local time, please use something like `encodeURI(new Date())` as the string parameter . Radius is also optional, if not given, will call foursquare API without radius paramter and will use radius = 500 when compute the distance score
__GET__ | /user/:name | | | return a user object with his history and preference | history will contain actual restaurant object instead of restaurant id
__PUT__ | /restaurant/:id | | img_url(array of image urls) | return the updated restaurant| duplicated urls won't be inserted. 
__POST__ | /select | | username,restaurantId,like,date,rating,location| status 200 OK |  like should be 1 or 0, rating is a number, location should be the same as what in the restaurant object, date should be a Date object



