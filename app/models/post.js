var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Post', new Schema({
    loadingCountry: String,
    loadingCity: String,
    unloadingCountry: String,
    unloadingCity: String,
    price: Number,
    loadingDate: Date,
    weight: Number,
    phone: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}));