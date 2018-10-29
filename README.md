# FaceAPI-.NETConfAr18

## Pre-requisitos

- Visual Studio 15 o superior
- Descargar [Postman](https://www.getpostman.com/apps)
- Tener lista una base de datos (en nuestro caso usamos SQL Server pero podes usar la que quieras)
  - SQL Server Management Studio
- Generar una [subscription key de Face API](https://azure.microsoft.com/en-us/try/cognitive-services/)
- Documentación sobre las [referencias de Face API](https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236)


### Crear el grupo
  Desde Postman generar el grupo necesario, dentro del cual estarán las caras:
   - URL (La misma que usamos antes): `https://[location].api.cognitive.microsoft.com/face/v1.0/persongroups/{personGroupId}` 
   - Método `PUT`
   - Headers:
```
      Content-Type: application/json
      Ocp-Apim-Subscription-Key: Subscription key generada
```
  - Body: 
  ```
{
      "name" : "ElNombreDelGrupo",
	  "userData" : "descripción del grupo" //opcional
}
```


## Empecemos

1. Correr el script 'FaceApiScript.sql'
2. Clonar la solución
3. Modificar el Web.config
    - Agregar la URL de Face API
    - Agregar la Key de la suscripción de Face API
    - Agregar la connection string de la BD con catálogo inicial 'Face_Api'
4. Agregar el nombre del grupo en la variable 'grupoId' del BaseController 
5. Correr la aplicación
