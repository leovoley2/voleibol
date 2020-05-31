const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER, 
        primaryKey: true,
        autoIncrement: true
    },
    nombre : Sequelize.STRING(60),
    imagen : Sequelize.STRING(60),
    descripcion : Sequelize.TEXT,
    email: {
        type: Sequelize.STRING(30),
        allowNull: { args: false, msg: "El email es obligatorio" },
        validate: {
            isEmail: { args: true, msg: "Favor ingresar un email valido" },
            isUnique: function(value, next) {
                var self = this;
                Usuarios.findOne({
                    where: {email: value},
                    attributes: ['id']
                })
                    .then(function(usuario) {

                        if (usuario){
                            return next('El email ya existe');
                        }
                        return next();    
                    })
                    .catch(function (err){
                        return next(err);
                    });
                }
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate : {
            notEmpty : {
                msg : 'El password no puede ir vacio'
            }
        }
    }, 
    activo : {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword : Sequelize.STRING, 
    expiraToken : Sequelize.DATE
}, {
    hooks: {
        beforeCreate(usuario) { 
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});

// Método para comparar los password
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}
Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null );
}

module.exports = Usuarios;