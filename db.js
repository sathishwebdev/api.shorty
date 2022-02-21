const dotenv = require('dotenv'),mongoose = require('mongoose')

dotenv.config()

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

let db = mongoose.connection;

db.on("connected", ()=>{
    console.log("Got the DB!")
})

db.on('error',()=>{
    console.log("Something wrong with DB connection")
});

module.exports = mongoose