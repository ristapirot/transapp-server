var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    name: String,
    fullName: String,
    company: String,
    phone: String,
    skypeName: String,
    email: String,
    password: String,
    favoriteCountries: Array,
    admin: Boolean
}));