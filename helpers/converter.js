const ShortId = () =>{
    var shortId = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( let i = 0; i < 5; i++ ) {
      shortId += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return shortId
}

module.exports = ShortId