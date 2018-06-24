var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var User = require('../models/users');

function cadenaAleatoria() {
    longitud = 16
    caracteres = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    cadena = ""
    max = caracteres.length - 1
    for (var i = 0; i < longitud; i++) { cadena += caracteres[Math.floor(Math.random() * (max + 1))]; }
    return cadena;
}

var smtpTransport = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: { user: 'dxavi1212@gmail.com', pass: 'wakfu05231' }
});

router.get('/register', function(req, res){
	res.render('register');
});
router.get('/confirma', function(req, res){
    res.render('confirma');
});

router.get('/login', function(req, res){
	res.render('login');
});
////registro
router.post('/registrarse',(req,res)=>{
	if(req.body.password!=req.body.reppass)
        res.send('Error 2')
    else{ 
        User.findOne({$or:[{'username': req.body.username},{'email':req.body.correo}]},
		'username correo ', (err, resultado)=> {
			if (err)
                res.send('Error 1')
            else{
                if(resultado!=null)
				    res.send('Error 3')
                else{
                    var newUser = new User({
                        nombre:req.body.nombre,
                        ape:req.body.ape,
                        username:req.body.username,
                        correo:req.body.correo,
                        password:req.body.password,
                        token:cadenaAleatoria(),
                        confirmado:false,
                        esadmin:false
                    });
                    User.createUser(newUser, (err, user)=>{
                        if(err)
                            res.send('Error 1')
                        else{
                            var mailOptions = {
                                from: 'dxavi1212@gmail.com',to: user.correo,
                                subject: 'Codigo de confirmación de su cuenta',
                                //text: 'Para terminar de crear su cuenta ingrese este token : ' + user.token
                                html:'<h3>Codigo de confirmacion para su cuenta</h3>'+
                                '<h4>presione en el siguiente enlace he ingrese el siguiente codigo</h4>'+
                                '<h2>Codigo: '+user.token+'</h2>'+
                                '<a href="http://localhost:3000/users/confirma">Clic aqui!</a>'
                            }
                            smtpTransport.sendMail(mailOptions, (err, resp)=> {
                                if (err)
                                    res.send('error ')
                                else
                                    res.redirect('/users/login')                             
                            });
                        }
                    });
                }
            }			
		});		
	}
});
///confirmar
router.post('/confirmar',(req,res)=>{
    User.findOne().where({correo:req.body.correo}).exec((err,resp)=>{
		console.log(req.body.correo)
        if(err)
            res.send('Error 1')       
        else{
            if (resp){
                if(resp.confirmado)
                    res.send('Error 5');
                else{
                    if(resp.token==req.body.token){
                        User.findOneAndUpdate({username: resp.username }, { confirmado: true, token: cadenaAleatoria()},(err)=>{
                            if (err)
                                res.send('Error 1')
                            else
                                res.redirect('/users/login')
                        });              
                    }else
                        res.send('Error 3');
                }
            }else
                res.send('Error 2');
        }
    });
});
//
passport.use(new LocalStrategy(
	function(username, password, done) {
	 User.getUserByUsername(username, function(err, user){
		 if(err) throw err;
		 if(!user){
			 return done(null, false, {message: 'Unknown User'});
		 }
  
		 User.comparePassword(password, user.password, function(err, isMatch){
			 if(err) throw err;
			 if(isMatch){
				 return done(null, user);
			 } else {
				 return done(null, false, {message: 'Invalid password'});
			 }
		 });
	 });
}));
  
passport.serializeUser(function(user, done) {
	done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
	  done(err, user);
	});
});
//
router.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
	  res.redirect('/');
});
  
router.get('/logout', function(req, res){
	  req.logout();
      console.log('salistes')  
	  req.flash('success_msg', 'You are logged out');
  
	  res.redirect('/users/login');
});

module.exports = router;