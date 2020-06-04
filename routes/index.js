const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usuariosControllers = require('../controllers/usuariosControllers');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');
const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const grupocontrollerFE = require('../controllers/frontend/grupoControllerFE');
const comentariosControllerFe = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');


module.exports = function() {
  

// AREA PUBLICA DE LA PAGINA

    router.get('/', homeController.home);

    // MUESTRA UN MEETIN
    router.get('/meeti/:slug',
      meetiControllerFE.mostrarMeeti
    );

    // confirma la asistencia al meeti
    router.post('/confirmar-asistencia/:slug',
      meetiControllerFE.confirmarAsistencia
    );

    // muestra asistentes al meeti
      router.get('/asistentes/:slug',
      meetiControllerFE.mostrarAsistentes
    );

    // comentarios en el meeti
    router.post('/meeti/:id',
      comentariosControllerFe.agregarComentario
    );

    /** Elimina comentarios en el meeti */
    router.post('/eliminar-comentario',
        comentariosControllerFe.eliminarComentario
    );

    // muestra perfiles en el frond end
    router.get('/usuarios/:id',
      usuariosControllerFE.mostrarUsuarios
    );

    // muestra grupos en el frond end
    router.get('/grupos/:id',
      grupocontrollerFE.mostrarGrupo
    );

    // Muestra meeti's por categoria
    router.get('/categoria/:categoria',
        meetiControllerFE.mostrarCategoria
    );
    
    // añade la busqueda
    router.get('/busqueda',
      busquedaControllerFE.resultadosBusqueda
    );


    // Crear y confirmar cuentas
    router.get('/crear-cuenta', usuariosControllers.FormCrearCuenta);
    router.post('/crear-cuenta', usuariosControllers.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosControllers.confirmarCuenta);

    // iniciar sesion
  router.get('/iniciar-sesion', usuariosControllers.formIniciarSesion);
  router.post('/iniciar-sesion', authController.autenticarUsuario);

  // cerrar sesion 
  router.get('/cerrar-sesion', 
  authController.usuarioAutenticado,
  authController.cerrarSesion
  );

  // AREA PRIVADA DE LA PAGINA//

  // panel de administracion 
    router.get('/administracion', 
      authController.usuarioAutenticado,
      adminController.panelAdministracion
    );

    // nuevos grupos
    router.get('/nuevo-grupo',
      authController.usuarioAutenticado,
      gruposController.formNuevoGrupo
    );
    router.post('/nuevo-grupo',
      authController.usuarioAutenticado,
      gruposController.subirImagen,
      gruposController.crearGrupo
  );

  // editar grupos
    router.get('/editar-grupo/:grupoId',
      authController.usuarioAutenticado,
      gruposController.formEditarGrupo
    );
    router.post('/editar-grupo/:grupoId',
      authController.usuarioAutenticado,
      gruposController.EditarGrupo
    );

    // editar la imagen del grupo 
    router.get('/imagen-grupo/:grupoId',
      authController.usuarioAutenticado,
      gruposController.FormEditarImagen
    );
    router.post('/imagen-grupo/:grupoId',
      authController.usuarioAutenticado,
      gruposController.subirImagen,
      gruposController.editarImagen
    );
 
    router.get('/eliminar-grupo/:grupoId', 
      authController.usuarioAutenticado,
      gruposController.formEliminarGrupo
    );
  router.post('/eliminar-grupo/:grupoId', 
      authController.usuarioAutenticado,
      gruposController.EliminarGrupo
    );

    // nuevo meetin
    router.get('/nuevo-meeti', 
      authController.usuarioAutenticado,
      meetiController.formNuevoMeeti
    );
    router.post('/nuevo-meeti',
      authController.usuarioAutenticado,
      meetiController.sanitizarMeeti,
      meetiController.crearMeeti
    );

    // editar meeti
    router.get('/editar-meeti/:id',
    authController.usuarioAutenticado,
    meetiController.FormeditarMeeti
    );
    router.post('/editar-meeti/:id',
    authController.usuarioAutenticado,
    meetiController.editarMeeti
    );

    // eliminar meeti
    router.get('/eliminar-meeti/:id',
      authController.usuarioAutenticado,
      meetiController.FormEliminarMeeti
    );
    router.post('/eliminar-meeti/:id',
      authController.usuarioAutenticado,
      meetiController.EliminarMeeti
    );

    // editar informacion de perfil 
    router.get('/editar-perfil/',
      authController.usuarioAutenticado,
      usuariosControllers.FormEditarPerfil
  );
    router.post('/editar-perfil/',
      authController.usuarioAutenticado,
      usuariosControllers.EditarPerfil
  );
  // modificar password
  router.get('/cambiar-password',
  authController.usuarioAutenticado,
  usuariosControllers.FormcambiarPassword
);
router.post('/cambiar-password',
authController.usuarioAutenticado,
usuariosControllers.cambiarPassword
);
  
// imagen de perfil
router.get('/imagen-perfil',
  authController.usuarioAutenticado,
  usuariosControllers.FormSubirImagenPerfil
);
router.post('/imagen-perfil',
  authController.usuarioAutenticado,
  usuariosControllers.subirImagen,
  usuariosControllers.guardarImagenPerfil
);


    return router;
}
