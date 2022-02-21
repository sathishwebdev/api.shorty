const mongoose = require('mongoose')
const ShortId = require('../helpers/converter')

const shortySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    longUrl : {
        type: String,
        required: true
    },
    shortUrl:{
        type: String,
        required: true,
        unique: true,
        default: ShortId
    },
    viewCount : {
        type: Number,
        required: true,
        default : 0
    },
    by:{
        type: String,
        required: true,
        default : 'uncategorised'
    }

},
{timestamps: true})

const shortyModel = mongoose.model("Shorty", shortySchema)

module.exports = shortyModel