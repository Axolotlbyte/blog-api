var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema ({
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
})

UserSchema
.virtual('url')
.get(function() {
    return '/User/' + this._id;
})

module.exports = mongoose.model('User', UserSchema)