# Sistema de incorporación
## ENDPOINTS

  ---------------------------------------------------------------------------------------
  Método       Ruta                                       Descripción
  ------------ ------------------------------------------ -------------------------------
  **POST**     `/auth/login`                              Iniciar sesión

  **POST**     `/auth/register`                           Registrar usuario

  **POST**     `/auth/verify`                             Verificar token

  **POST**     `/auth/change-password`                    Cambiar contraseña

  **POST**     `/auth/logout`                             Cerrar sesión

  **GET**      `/collaborators`                           Listar colaboradores

  **GET**      `/collaborators/:id`                       Obtener colaborador

  **POST**     `/collaborators`                           Crear colaborador

  **PUT**      `/collaborators/:id`                       Actualizar colaborador

  **DELETE**   `/collaborators/:id`                       Eliminar colaborador

  **POST**     `/collaborators/:id/complete-onboarding`   Completar onboarding

  **GET**      `/calendar`                                Listar eventos

  **POST**     `/calendar`                                Crear evento

  **GET**      `/calendar/upcoming`                       Eventos próximos

  **GET**      `/alerts/upcoming`                         Alertas próximas

  **POST**     `/alerts/test`                             Enviar alerta de prueba

  **GET**      `/health`                                  Estado del sistema

  **GET**      `/debug/users`                             Debug usuarios
  ---------------------------------------------------------------------------------------

# # # Frontend
React 18
React Router 6
Bootstrap 5 + React-Bootstrap
Git (control de versiones)
MySQL Workbench / CLI
