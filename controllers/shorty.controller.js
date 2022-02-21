const Shorty = require('../model/shortyModel')
const User = require("../model/userModel")
const mongoose = require("mongoose")

// ADD NEW LONG URL

exports.addURL = async (req, res) =>{
    try{
        let DATA_TO_ADD = req.body
       
        
        let shorty = new Shorty({
            longUrl : DATA_TO_ADD.longUrl, 
            name : DATA_TO_ADD.name
        })

        shorty.by = DATA_TO_ADD.by
        shorty = await shorty.save()

        // let userLinks =  await Shorty.find({by: DATA_TO_ADD.userId})

        // if(userLinks){ let user = await User.findById(DATA_TO_ADD.userId)
        // user.links = [...userLinks]
        // user.linkCount = userLinks.length
        // await user.save()}
        

        if(!shorty) res.status(400).send({result: false, error: {message: "throwing error"}, message: "Error to Add Link"})
        res.send({result: true, error: null, message:"Successfully Added", shortUrl : shorty.shortUrl})
    }catch(err){
        console.log(err)
        return res.status(400).send({result: false, message: err.message, error: err})
    }
}

// DELETE ADDED URL

exports.deleteURL = async (req, res) =>{
    try{
        const SELECTED_URL_DATA = req.body.urls
        
        await SELECTED_URL_DATA.map(async (url)=>{
            await Shorty.findByIdAndRemove(url._id)
        })
        res.send({result: true, message: "DELETED SUCCESSFULLY!"})
    }catch(err){
        res.status(400).send({result: false, error:{message:"error when deleting the data"}, message:"Error to delete url"})
    }
}

// EDIT ADDED URL 

exports.editURL = async(req, res)=>{
    try{
        const EDIT_URL_ID = req.params.Id
        const DATA_TO_UPDATE = req.body

        if(!mongoose.isValidObjectId(EDIT_URL_ID)){
            return res.status(400).send({result: false, error:{message:"Invalid id"}, message:"Nothing Found to edit!"})
        }

        const shorty = Shorty.findByIdAndUpdate(EDIT_URL_ID, {
            longUrl : DATA_TO_UPDATE.url,
            name : DATA_TO_UPDATE.name
        })

        !shorty? res.status(400).send({result: false, error:{message:"error occur while edit the data"}, message:"Error - didn't edit yet!"})
        :
        res.send({result: true, error: null, message:"Successfully Edited!"})

    }catch(err){
        return res.status(400).send({result: false, error:{message:"error occur before start edit the data"}, message:"Error - didn't edit yet!"})
    }
}

// GET URL DATA 

exports.getURLDetails = async (req, res) =>{
    try{
        const URL_ID = req.params.urlId
       
        if(!mongoose.isValidObjectId(URL_ID)){
            return res.status(400).send({result: false, error:{message:"Invalid id"}, message:"Nothing to show!"})
        }

        const DATA_OF_URL = await Shorty.findById(URL_ID)

        !DATA_OF_URL ? res.status(400).send({result: false, error:{message:"error occur while fetch the data"}, message:"Error - didn't get anything!"})
        :
        res.send({result: true, error: null, message:"Successfull!", data: DATA_OF_URL})

    }catch(err){
        return res.status(400).send({result: false, error:{message:"error occurs before fetch the data"}, message:"Error - didn't get details!"})
    }
}

// GET URL LIST

exports.getUrlList = async (req, res)=>{
    try {
        let userId = req.query.user

        const LIST_OF_URL = await Shorty.find({user : userId})

        !LIST_OF_URL ? res.send({result: false, error:{message: "no data can be found"}, message: "Nothing to show!", data: null})
        :
        res.send({result: true, error:null, message:"Successfull!", data: LIST_OF_URL})
    }catch(err){
        return res.status(400).send({result: false, error:{message:"error occurs before fetch the data"}, message:"Error - didn't get details!"})
    }
}

// REDIRECT LINK

exports.redirectUrl = async(req, res)=>{
    let ShortyId = req.params.shortyId
    
    try{
        let filter = {
        shortUrl : ShortyId
    }
    
    let getUrlData =  await Shorty.findOne(filter)
    getUrlData.viewCount++
    await getUrlData.save()

   let REDIRECT_LINK = await Shorty.findOne(filter)

   !REDIRECT_LINK ? res.send({result: false, error:{message: "Inavlid url"}, message: "May be Invalid Url", data: null})
        :
        res.send({result: true, error:null, message:"Successfull!", data: REDIRECT_LINK, url : REDIRECT_LINK.longUrl})

}catch(err){
    return res.status(400).send({result: false, error:{message:"error occurs before redirect to Url"}, message:"Error - can't Redirect_"})
}
}