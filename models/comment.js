var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
    {
        user: {type: String, required: true, minLength: 3, maxLength: 30},
        text: {type: String, required: true, minLength: 3, maxLength: 300},
        article: {type: Schema.Types.ObjectId, ref: 'Article', required: true}
    }
)

CommentSchema
.virtual('url')
.get(function() {
    return '/Comment/' + this._id;
})

module.exports = mongoose.model('Comment', CommentSchema)