const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

const multer = require('multer');
const cloudinary = require ('../handlers/cloudinary');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits : { fileSize : 1024 * 1024 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }), 
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //el formato es valido
            next(null, true);
        } else {
            // el formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

// cloudinary
app.use('/upload-images',upload.array('image'), async (req, res) =>{

    const uploader = async (path) => await cloudinary.uploads(path,'Images')

    if (req.method === 'POST') {
        const urls = []

        const files = req.files

        for(const file of files){
            const  {path} = file

            const newPath = await uploader(path)

            urls.push(newPath)

            fs.unlinkSync(path)
        }
    }
})
// fin de clounary
exports.formNuevoGrupo =  async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina : 'Crear nuevo grupo',
        categorias
    })
}

exports.FormCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina : 'Crea tu cuenta'
    })
}

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'El password confirmado no puede ir vacio' ).notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    // Leer los errores de express
    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        // Url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url, 
            subject : 'Confirma tu cuenta de Meeti',
            archivo : 'confirmar-cuenta'
        });

        //Flash Message y redireccionar
        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        console.log(error);
        // extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        // extraer unicamente el msg de los errores
        const errExp = erroresExpress.map(err => err.msg);

        //unirlos
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}


// confirma la suscripcion del usuario
exports.confirmarCuenta = async (req, res, next) => {
    // verificar que el usuario existe

    const usuario = await Usuarios.findOne({ where : { email: req.params.correo }});
    // sino existe vamos a redireccionar 
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    // si existe confirmar suscripcion y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha creado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');

}

// Formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
       nombrePagina : 'Iniciar Sesión'
    })
}

// Muestra el formulario de perfil
exports.FormEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina : 'Editar Perfil',
        usuario
    })
}

//  almacena en la base de datos los cambios del perfil

exports.EditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk( req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');

    // leer los datos del FORM
    const {nombre, descripcion, email} = req.body;

    // asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    // guardar en la BD
    await usuario.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');
}

// muestra el formulario para cambiar el password

exports.FormcambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina : 'Cambiar Password'
    })
    
}

// revisa si el passwor anterior es el correcto  y lo modifica por uno nuevo

exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // verificar que el password anterior sea el correcto
        if(!usuario.validarPassword(req.body.anterior)) {
            req.flash('error', 'El password actual es incorrecto');
            res.redirect('/administracion');
            return next()
        }
        
    // si el password es correcto, hashear el nuevo
        const hash = usuario.hashPassword(req.body.nuevo);
    // asignar el password al usuario
    usuario.password = hash;
    // guardar en la BD 
    await usuario.save();
    // redireccionar
    req.logout();
    req.flash('exito', 'Password Modificado Correctamente, vuelve iniciar sesión');
    res.redirect('/iniciar-sesion');
}

// muestra el formulario para subir una imagen de perfil

exports.FormSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // mostrar la vista
    res.render('imagen-perfil', {
        nombrePagina : 'Subir Imagen Perfil',
        usuario
    });
}

// guarda la imagen, elimina la anterior (si aplica) y guarda el registro en la BD

exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //si hay una imagen anterior, eliminarla.
    if(req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        // eliminar archivos con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error)
            }
            return;
        })
    }

    // almacena la nueva imagen
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    // almacenar en la BD
    await usuario.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}


