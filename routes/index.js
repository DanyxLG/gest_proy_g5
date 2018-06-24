var express = require('express');
var router = express.Router();
var User = require('../models/users');

router.get('/',ensureAuthenticated,function(req,res){
    //User.find().where({esadmin:false}).exec((error, usuarios)=>{
	  User.find().count().exec(function(error,usuarios){
        if(error)
            res.render('500',{error:error})
		else 
		console.log('funciona')   
            res.render('index', {usuario:usuarios})
    })
})

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;