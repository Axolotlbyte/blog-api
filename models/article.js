var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var ArticleSchema = new Schema(
    {
        user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        title: {type: String, required: true, minLength: 3, maxLength: 100},
        content: {type: String, required: true, minLength: 3, maxLength: 1000},
        date: {type: Date, default: Date.now},
        comment: [{type: Schema.Types.ObjectId, ref: 'Comment'}] 
    }
)

ArticleSchema
.virtual('url')
.get(function() {
    return '/Article/' + this._id;
})

ArticleSchema
.virtual('date_formatted')
.get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED)
})

module.exports = mongoose.model('Article', ArticleSchema)