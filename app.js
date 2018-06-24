path = require('path');
cookieParser = require('cookie-parser');
bodyParser = require('body-parser');
exphbs = require('express-handlebars');
expressValidator = require('express-validator');
flash = require('connect-flash');
session = require('express-session');
passport = require('passport');
LocalStrategy = require('passport-local').Strategy;
mongoose = require('mongoose');
express = require('express');
servidor = express()

puerto=3000;
http = require('http').Server(servidor)
port = process.env.PORT || puerto

//estatico
//mongoose.connect('mongodb://127.0.0.1:27017/prueba',{ app: { reconnectTries: Number.MAX_VALUE } });
//base de datos en la web
mongoose.connect('mongodb://danyxlg:123456@ds133550.mlab.com:33550/prueba',{ app: { reconnectTries: Number.MAX_VALUE } });

//
routes = require('./routes/index');
users = require('./routes/users');

// View Engine
servidor.set('views', path.join(__dirname, 'views'));
servidor.engine('handlebars', exphbs({defaultLayout:'estatico'}));
servidor.set('view engine', 'handlebars');

// BodyParser Middleware
servidor.use(bodyParser.json());
servidor.use(bodyParser.urlencoded({ extended: false }));
servidor.use(cookieParser());

// Set Static Folder
servidor.use(express.static(path.join(__dirname, 'public')));
servidor.use(express.static(path.join(__dirname, 'node_modules')));

// Express Session
servidor.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
servidor.use(passport.initialize());
servidor.use(passport.session());

// Express Validator
servidor.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
}));

// Connect Flash
servidor.use(flash());

// Global Vars
/*servidor.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
    //mensajes de erro aun no implementado
});*/

servidor.use('/', routes);
servidor.use('/users', users);

//Controlamos el error de página no encontrada
servidor.use((req, res) => { res.status('404'); res.render('400') });

//Controlamos el error de fallos en el servidor
servidor.use((err, req, res, next) => { res.status(500); res.render('500', { error: err }) });

//Inicializamos el servidor
http.listen(port);
