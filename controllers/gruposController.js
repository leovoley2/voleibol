const Categorias = require('../models/categorias');
const Grupos = require('../models/Grupos');
const claudinary = require('cloudinary');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid/v4');


claudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const configuracionMulter = {
    limits : { fileSize : 800000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {

            next(null, __dirname+'/../public/uploads/grupos/');
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
exports.subirImagen = async (req, res) => {

 const result = await claudinary.v2.uploader.upload(req.file.path);
 /* new Photo({
    imagen:
  })*/
}



exports.formNuevoGrupo =  async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina : 'Crear nuevo grupo',
        categorias
    })
}

// almacena los grupos en la base de datos

exports.crearGrupo = async (req, res) => {
    // sanitizar
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');
    const grupo = req.body;

    // almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;

    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();
    
    try {
        // almacenar en la BD
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(  Grupos.findByPk(req.params.grupoId ));
    consultas.push(Categorias.findAll());

    // promise con await
   const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo',{
        nombrePagina : `Editar Grupo : ${grupo.nombre}`,
        grupo,
        categorias
    })

}
// Guardar los cambios en la base de datos
exports.EditarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    // si no existe ese grupo o no es el dueño
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // todo bien, leer los valores
    const { nombre, descripcion, categoriaId, url } = req.body;
    
    // asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    // guardamos en la BD
    await grupo.save();
    req.flash('exito', 'Cambios guardados con exito');
    res.redirect('/administracion');

}

//  muestra el formulario para Editar imagen
exports.FormEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

        res.render('imagen-grupo', {
            nombrePagina : `Editar Imagen Grupo : ${grupo.nombre}`,
            grupo
        })
}

// modificar la imagen de la BD y eliminar la anterior

exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

   // el grupo existe y es valido
    if(!grupo) {
        req.flash('error', 'Operacion NO Valida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    // verificar que el archivo sea nuevo 
    /*if(req.file) {
        console.log(req.file.filename);
    }

    // revisar  que exista un archivo anterior
    if(grupo.imagen) {
        console.log(grupo.imagen);
    }*/

    // si hay imagen nueva y anterior, significa que  vamos a borrar la anterior
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // eliminar archivos con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error)
            }
            return;
        })
    }

    // si hay una imagen nueva, la guardamos 
    if(req.file){
        grupo.imagen = req.file.filename;
    }

    // guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');

}

// Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // todo bien, ejecutar la vista
    res.render('eliminar-grupo', {
        nombrePagina : `Eliminar Grupo : ${grupo.nombre}`
    })
}

// eliminar el grupo y imagen
exports.EliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

     if(!grupo) {
         req.flash('error', 'Operacion NO Valida');
         res.redirect('/administracion');
         return next();
     }

    // si hay una imagen, eliminarla
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // eliminar archivos con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error)
            }
            return;
        });
    }

    // eliminar grupos
    await Grupos.destroy({
        where : {
            id : req.params.grupoId
        }
    })

    // redireccionar al usuario
    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}