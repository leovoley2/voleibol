const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/Usuarios');

passport.use(new LocalStrategy({
    usernameField : 'email',
    passwordField:  'password'
},
    async(email, password, next) =>{
    // codigo se ejecuta al llenar el formulario

        const usuario = await Usuario.findOne({ 
                                            where : { email, activo : 1 }});


    //  revisar si existe o no
        if(!usuario) return next(null, false, {
            message: 'Usuario no existe'
        });
        // el usuario existe comparar su password
        const verificarPass = usuario.validarPassword(password);

        // si el password es incorrecto
        if(!verificarPass) return next(null, false, {
            message: 'Password Incorrecto'
        });
        // todo bien
        return next(null, usuario);
    }

))

passport.serializeUser(function(usuario, cb){
    cb(null, usuario);
});
passport.deserializeUser(function(usuario, cb){
    cb(null, usuario);
});

module.exports = passport;
