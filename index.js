var express = require('express'),cors = require('cors')
require('./db')
const PORT = process.env.PORT ,app = express()

app.use(express.json())
app.use(cors())
app.use(require("./helpers/errorHandler"))
app.use(require("./helpers/jwt")());


app.use('/api/shorty',require('./routes/shorty.routes'))
app.use("/api/users", require("./routes/user.routes"));


app.get('/', (req, res)=>res.send("SHORTLY"))
app.listen(PORT, ()=>{console.log("Server started " + PORT)})