# FaceAPI-.NETConfAr18

## Pre-requisitos

- Visual Studio 15 o superior
- Descargar [Postman](https://www.getpostman.com/apps)
- Tener lista una base de datos (en nuestro caso usamos SQL Server pero podes usar la que quieras)
  - SQL Server Management Studio
- Generar una [subscription key de Face API](https://azure.microsoft.com/en-us/try/cognitive-services/)
- Documentación sobre las [referencias de Face API](https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236)

## Antes de empezar

- Probar que la clave fue generada correctamente
  - Buscar imagen de la cara de una persona y copiar la URL de la imagen
  - Abrir Postman
  - Crear una POST request
  - URL: Deberías tenerla cuando se te generó la Subscription Key. 
    - Es del estilo: `https://[location].api.cognitive.microsoft.com/face/v1.0`
    - Agregarle al final de la ruta: `/detect?returnFaceId=true`
  - Headers:
```
      Content-Type: application/json
      Ocp-Apim-Subscription-Key: Subscription key generada
```
  - Body: `{
    "url": "http://example.com/1.jpg"
}` _Reemplazar con la URL copiada_

- Deberia retornar una respuesta del estilo
```json
    [    
           {
                "faceId": "1179755f-6c41-46ba-9a9a-cbcd2d0a70d2",
                "faceRectangle": {
                    "top": 54,
                    "left": 128,
                    "width": 99,
                    "height": 99
                }
            }
    ]
```

## Empecemos

1. Clonar la solución
2. Buildearla, en caso de falla:
    - Agregar las dependencias de nuget de Cognitive Services
      - Microsoft.ProjectOxford.Common
      - Microsoft.ProjectOxford.Face
3. Modificar el Web.config
    - Agregar la URL de Face API
    - Agregar la Key de la suscripción de Face API
4. Correr la aplicación y verificar que abre la página principal correctamente
5. Crear el cliente de Face API en el BaseController
    - Es una instancia de `FaceServiceClient`
  
### Implementar endpoint para analizar imágenes.

  #### _**Dentro de `HomeController`**_

  #### Implementar endpoint para analizar imágenes desde una URL
  - En `AnalizarCara` llamar al método `DetectAsync` del cliente de Face API con el path como parámetro
  - Devolver el resultado en formato Json

  #### Implementar endpoint para analizar imágenes desde un archivo local
  Realizar la lógica para la lectura y el envío de la data, en el metodo `AnalizarCaraLocal`
  - Obtener del HTTP Context la imagen enviada
  - Obtener el InputStream de la imagen
  - Llamar al método `DetectAsync` de FaceAPI con el stream como parámetro.
  - Retornar el resultado en formato Json 
  
  #### Implementar endpoint para analizar imágenes desde la cárama web
  Realizar la lógica para la lectura y el envío de la data, en el metodo `AnalizarCaraWebCam`
  - Se obtiene por parámetro el string en Base64 de la imagen.
  - Obtener el byteArray a partir de conversión en base 64 de la imagen 
  - Obtener un nuevo memory stream a partir del byteArray
  - Llamar al método `DetectAsync` de FaceAPI con el memory stream obtenido como parámetro.
  - Retornar el resultado en formato Json
  
  ##### Opcional

  - Generar la lista de atributos de la cara que queremos obtener del servicio
    - Es un `Enum` del tipo `FaceAttributeType` 

  - Llamar al mismo método anterior con la ruta y los atributos de la cara como parámetro
  <blockquote>
  <details>
    <summary> :no_entry: Solución :no_entry: </summary>       
    <p>
    Siendo faceAttributes:  
    </p>
  
  ```csharp
        private readonly IEnumerable<FaceAttributeType> faceAttributes =
          new FaceAttributeType[]
          {
              FaceAttributeType.Gender, FaceAttributeType.Age, 
              FaceAttributeType.HeadPose, FaceAttributeType.Smile, 
              FaceAttributeType.FacialHair, FaceAttributeType.Glasses, 
              FaceAttributeType.Emotion, FaceAttributeType.Hair, 
              FaceAttributeType.Makeup, FaceAttributeType.Occlusion, 
              FaceAttributeType.Accessories, FaceAttributeType.Blur, 
              FaceAttributeType.Exposure, FaceAttributeType.Noise
          };
  ```
      
  <details> 
    <summary>Para URLs</summary>  
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AnalizarCara(string path)
    {
        try
        {                
            return Json(await faceServiceClient.DetectAsync(path, returnFaceId: true, returnFaceLandmarks: false, returnFaceAttributes: faceAttributes));
        }
        catch(Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  </details>
  <details> 
    <summary>Para archivos locales</summary>      
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AnalizarCaraLocal()
    {
        try
        {
            var fileContent = System.Web.HttpContext.Current.Request.Files["IMG"];
            if (fileContent != null && fileContent.ContentLength > 0)
            { 
                using (var fileStream = fileContent.InputStream)
                {
                    return Json(await faceServiceClient.DetectAsync(fileStream, returnFaceId: true, returnFaceLandmarks: false, returnFaceAttributes: faceAttributes));
                }
            }
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  </details>
  <details> 
    <summary>Para cámara web</summary>      
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AnalizarCaraWebCam(string imagen)
    {
        try
        {
            var byteArray = Convert.FromBase64String(imagen);
            return Json(await faceServiceClient.DetectAsync(new MemoryStream(byteArray), returnFaceId: true, returnFaceLandmarks: false, returnFaceAttributes: faceAttributes));
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  </details>
  </details>
</blockquote>  

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

### Crear las tablas para almacenar a las personas

 - Tabla Empleado
   - Datos:
     - Legajo (Clave primaria, que no sea un Identity)
     - Nombre
     - Apellido
     - Puesto
     - Face Id (es un GUID o uniqueidentifier)
     
 - Tabla para almacenar las fotos de la persona
   - Datos:
     - Id (Primary Key, Identity)
     - FotoId (es un GUID o uniqueidentifier)
     - Data de la foto (varbinary max)
     - Legajo de la persona (Foreign Key a la tabla Empleado)     
  
### Dar de alta un repositorio para persistir las personas y las caras.
  - Crear los siguientes métodos en `RepositorioPersona.cs`: 
    - Crear un empleado: guardando su legajo, nombre, apellido, faceId (proveniente de la response de FaceAPI) y puesto en la empresa
    - Validar existencia del empleado por legajo
    - Obtener FaceId por legajo
    - Agregar imagen: guardar legajo, el byteArray de la imagen, y el PersistedFaceId que se obtendrá de FaceAPI
    - Obtener un listado de todas los empleados
    - Obtener empleado por FaceId
    - Obtener imagenes del empleado por legajo
  <blockquote>
  <details>
    <summary> :no_entry: Solución :no_entry: </summary>       
    
  <details> 
    <summary>Crear una persona</summary>
  
  ```csharp
    public async Task AgregarPersona(Empleado empleado)
    {
        await unitOfWork.ExecuteAsync(@"
            INSERT INTO empleados (Legajo, FaceId, Nombre, Apellido, Puesto)
            VALUES (@Legajo, @FaceId, @Nombre, @Apellido, @Puesto)",
            new
            {
                Legajo = empleado.Legajo,
                FaceId = empleado.FaceId,
                Nombre = empleado.Nombre,
                Apellido = empleado.Apellido,
                Puesto = empleado.Puesto
            });
    }
  ```
  </details>
  <details> 
    <summary>Validar existencia por legajo</summary>
  
  ```csharp
    public async Task<bool> ExistePersona(int legajo)
    {
        var exists = await unitOfWork.Connection.ExecuteScalarAsync<int>(
            @"SELECT CASE WHEN EXISTS
               (SELECT Legajo FROM empleados WHERE Legajo = @Legajo)
             THEN 1 ELSE 0 END",
            new
            {
                Legajo = legajo
            });

        return exists == 1;
    }
  ```
  </details>
  <details> 
    <summary>Obtener FaceId por legajo</summary>
  
  ```csharp
    public async Task<Guid> ObtenerFaceIdPorLegajo(int legajo)
    {
        return await unitOfWork.Connection.ExecuteScalarAsync<Guid>(@"
            SELECT FaceId FROM empleados WHERE Legajo = @Legajo",
             new
             {
                 Legajo = legajo
             });
    }
  ```
  </details>
  <details> 
    <summary>Agregar imagen</summary>
  
  ```csharp
    public async Task GuardarImagen(int legajo, byte[] data, Guid fotoId)
    {
        await unitOfWork.ExecuteAsync(@"
            INSERT INTO dbo.imgs 
            VALUES (@Data, @FotoId, @Legajo)",
            new
            {
                Data = data,
                Legajo = legajo,
                FotoId = fotoId
            });
    }
  ```
  </details>
  <details> 
    <summary>Obtener listado de todos los empleados</summary>
  
  ```csharp
    public async Task<IEnumerable<Empleado>> ObtenerListadoPersonas()
    {
        return await unitOfWork.Connection.QueryAsync<Empleado>(@"
            SELECT Legajo, FaceId, Nombre, Apellido, Puesto FROM empleados");            
    }
  ```
  </details>
  <details> 
    <summary>Obtener empleado por Face Id</summary>
  
  ```csharp
    public async Task<Empleado> ObtenerDatosPorFaceId(Guid faceId)
    {
        return (await unitOfWork.Connection.QueryAsync<Empleado>(@"
            SELECT Legajo, FaceId, Nombre, Apellido, Puesto FROM empleados WHERE FaceId = @FaceId",
            new
            {
                FaceId = faceId
            })).FirstOrDefault();
    }
  ```
  </details>
  <details> 
    <summary>Obtener imagenes del empleado por legajo</summary>
  
  ```csharp
    public async Task<IEnumerable<byte[]>> ObtenerImagenes(int legajo)
    {
        return await unitOfWork.Connection.QueryAsync<byte[]>(@"
            SELECT i.Data FROM dbo.imgs i 
                INNER JOIN dbo.empleados e ON i.Legajo = e.Legajo
		      WHERE i.Legajo = @Legajo",
            new
            {
                Legajo = legajo
            });
    }
  ```
  </details>
  </details>
</blockquote> 

### Implementar endpoint para crear/agregar una persona al grupo.
  - Implementar `AgregarPersonaAGrupo` en el Controller de Reconocimiento.
  - Verificar que el legajo ingresado no existe en nuestro repositorio (no puede haber dos personas con el mismo legajo). 
  - Invocar al método `CreatePersonInPersonGroupAsync`, con el id del grupo, el nombre + apellido de la persona y opcionalmente data sobre esa persona.
    - El metodo nos devuele un `CreatePersonResult` con un Id (ese es el Face Id)
    - Asignarselo al objeto Empleado
  - Agregar a esa persona a nuestro repositorio.
  <blockquote>
  <details>
    <summary> :no_entry: Solución :no_entry: </summary>       
      
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AgregarPersonaAGrupo(Empleado empleado)
    {
        try
        {
            var respuesta = await _repositorioPersona.ValidarDatos(empleado);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }

            var data = await faceServiceClient.CreatePersonInPersonGroupAsync(personGroupId: grupoId, name: empleado.Nombre + " " + empleado.Apellido, userData: empleado.Puesto);
            empleado.FaceId = data.PersonId;
            await _repositorioPersona.AgregarPersona(empleado);

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Error: Por favor intentelo mas tarde.");
        }
    }
  ```
  </details>
</blockquote>  

### Implementar endpoint para agregarle imágenes a una persona del grupo.
  - La lógica sería en `AgregarCaraPersona`, `AgregarCaraPersonaLocal` y `AgregarCaraDeWebCam`, para URLs, imágenes locales e imágenes de la cámara web respectivamente; en ReconocimientoController
  - Verificar si el legajo ingresado existe en nuestro repositorio, sino indicar que para agregar la imagen se debe crear la persona primero 
  - Validar que la foto que se quiere agregar tiene caras (por medio del `DetectAsync`)
  - Obtener el FaceId de la persona que se quiere agregar
  - Invocar el método `AddPersonFaceInPersonGroupAsync` que recibe personGroupId, imageUrl, personId (Face Id).    
    - Para imágenes desde archivos locales:
      - Obtener el byte array del input stream de la imagen
      - Se deberá enviar el imageStream, que puede obtenerse a partir de un new MemoryStream(byteArrayDeLaImagen)
    - Para imágenes desde la cámara web, se deberá recibir el string en base64 por parámetro de la imagen, convertirlo a un byteArray y enviarlo de la manera mencionada anteriormente
  - Guardar la imagen en nuestro repositorio local
  - Invocar el método `TrainPersonGroupAsync(grupoId)`, necesario para entrenar la red neuronal
  <blockquote>
  <details>
    <summary> :no_entry: Solución :no_entry: </summary>       
  
  <details> 
    <summary>Para URLs</summary>
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AgregarCaraPersona(int legajo, string path)
    {
        try
        {
            var respuesta = await _repositorioPersona.ValidarLegajo(legajo);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }

            //Ideal validar que haya caras detectadas y que no haya más de una
            respuesta = await faceServiceClient.ValidarFoto(path);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }

            var faceId = await _repositorioPersona.ObtenerFaceIdPorLegajo(legajo);
            var result = await faceServiceClient.AddPersonFaceInPersonGroupAsync(personGroupId: grupoId, imageUrl: path, personId: faceId);

            await _repositorioPersona.GuardarImagen(legajo, new WebClient().DownloadData(path), result.PersistedFaceId);
            await faceServiceClient.TrainPersonGroupAsync(grupoId);

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Error: Por favor intentelo mas tarde.");
        }
    }
  ```
  </details>
  <details> 
    <summary>Para archivos locales</summary>
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AgregarCaraPersonaLocal(int legajo)
    {
        try
        {               
            var respuesta = await _repositorioPersona.ValidarLegajo(legajo);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }
            
            var fileContent = System.Web.HttpContext.Current.Request.Files["IMG"];                   
            var byteArray = fileContent.InputStream.ObtenerByteArrayDeUnStream();

            respuesta = await faceServiceClient.ValidarFoto(byteArray);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }

            var faceId = await _repositorioPersona.ObtenerFaceIdPorLegajo(legajo);
            var fotoId = await faceServiceClient.AddPersonFaceInPersonGroupAsync(personGroupId: grupoId, imageStream: new MemoryStream(byteArray), personId: faceId);

            await _repositorioPersona.GuardarImagen(legajo, byteArray, fotoId.PersistedFaceId);
            await faceServiceClient.TrainPersonGroupAsync(grupoId);

            return new HttpStatusCodeResult(HttpStatusCode.OK);               
            
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Error: Por favor intentelo mas tarde.");
        }
    }
  ```
  </details>
  <details> 
    <summary>Para cámara web</summary>
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> AgregarCaraDeWebCam(int legajo, string imagen)
    {
        try
        {
            var respuesta = await _repositorioPersona.ValidarLegajo(legajo);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }

            var byteArray = Convert.FromBase64String(imagen);

            respuesta = await faceServiceClient.ValidarFoto(byteArray);
            if (respuesta != null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, respuesta);
            }
            
            var faceId = await _repositorioPersona.ObtenerFaceIdPorLegajo(legajo);
            var fotoId = await faceServiceClient.AddPersonFaceInPersonGroupAsync(personGroupId: grupoId, imageStream: new MemoryStream(byteArray), personId: faceId);
            
            await _repositorioPersona.GuardarImagen(legajo, byteArray, fotoId.PersistedFaceId);
            await faceServiceClient.TrainPersonGroupAsync(grupoId);

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "Error: Por favor intentelo mas tarde.");
        }
    }
  ```
  </details>
  </details>
  </blockquote>   

### Implementar endpoint para analizar una imagen y devolver información de los candidatos.
  - La lógica sería en `ReconocerCaras`, `ReconocerCarasLocal` y `ReconocerCarasWebCam`, para URLs, imágenes locales e imágenes de la cámara web respectivamente en ReconocimientoController.
  - Invocar a `DetectAsync` con la imagen en cuestión como hicimos antes.
  - Con los datos de la response (que es una lista Face[]) se deberá invocar a `IdentifyAsync`:
    - recibe: los faceIds a analizar, el id del grupo (nombre), la cantidad máxima de candidatos por persona, el grado de confiabilidad menor para identificar por persona, y el id de largeGroup (si se posee uno). Como algunos de estos parámetros son opcionales, al invocar el método hay que indicar cuál es el parámetro que se está enviando.
    
    Ej.: `IdentifyAsync(faceIds: x, personGroupId: y, maxNumOfCandidatesReturned: 1, confidenceThreshold: (float)0.65, largePersonGroupId: null);`
  - Luego, para cada persona identificada en la foto se deberá recorrer en la respuesta los datos que uno quiere guardar en su `Persona`.
  - Retornar los datos obtenidos como una lista de `Persona` en formato Json.
  - Esto deberá hacerse para los tres métodos `Reconocer...`. ¡Intentá hacerlo repitiendo la menor cantidad de código posible!
  <blockquote>
  <details>
    <summary> :no_entry: Solución :no_entry: </summary>       

  <details> 
    <summary>Para URLs</summary>
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> ReconocerCaras(string path)
    {
        try
        {
            var response = await faceServiceClient.DetectAsync(path, returnFaceId: true, returnFaceAttributes: new[] { FaceAttributeType.Gender });
            return Json(await CompararPersonasAsync(response));
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  </details>
  <details> 
    <summary>Para archivos locales</summary>

  ```csharp
    [HttpPost]
    public async Task<ActionResult> ReconocerCarasLocal()
    {
        try
        {
            var fileContent = System.Web.HttpContext.Current.Request.Files["IMG"];                
            var response = await faceServiceClient.DetectAsync(fileContent.InputStream, returnFaceId: true, returnFaceAttributes: new[] { FaceAttributeType.Gender });                       
            return Json(await CompararPersonasAsync(response));
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  </details>
  <details> 
    <summary>Para cámara web</summary>

  ```csharp
    [HttpPost]
    public async Task<ActionResult> ReconocerCarasWebCam(string imagen)
    {
        try
        {
            var byteArray = Convert.FromBase64String(imagen);
            var response = await faceServiceClient.DetectAsync(new MemoryStream(byteArray), returnFaceId: true, returnFaceAttributes: new[] { FaceAttributeType.Gender });
            return Json(await CompararPersonasAsync(response));
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  </details>
  <details> 
    <summary>El método CompararPersonasAsync</summary>

  ```csharp
    protected async Task<List<Persona>> CompararPersonasAsync(Face[] caras)
    {            
        var personasFoto = caras.Select(c => new Persona { Id = c.FaceId, Genero = c.FaceAttributes.Gender, Posicion = c.FaceRectangle }).ToList();

        if (personasFoto.Count > 0)
        {
            Datos candidato;
            var faceIds = personasFoto.Select(p => p.Id).ToArray();
            var data = await faceServiceClient.IdentifyAsync(faceIds: faceIds, personGroupId: grupoId, maxNumOfCandidatesReturned: 1, confidenceThreshold: (float)0.65, largePersonGroupId: null);

            for (int i = 0; i < data.Length; i++)
            {
                if (data[i].Candidates.Length > 0)
                {
                    candidato = await _repositorioPersona.ObtenerDatosPorFaceId(data[i].Candidates[0].PersonId);
                    personasFoto[i].Puesto = candidato.Puesto;
                    personasFoto[i].Nombre = candidato.Nombre;
                    personasFoto[i].Probabilidad = data[i].Candidates[0].Confidence;
                }
            }
        }

        return personasFoto;
    }
  ```
  </details>
  </details>
  </blockquote>

### Implementar endpoint para obtener todas las personas agregadas a un grupo.
  - Implementar un método en el repositorio que devuelva todas las personas que han sido agregadas.
  - Implementar el endpoint `ObtenerListadoPersonas` que invoque a este metodo y devuelva el listado para mostrar en formato Json, en el Controller de Reconocimiento.
  <blockquote>
  <details>
    <summary> :no_entry: Solución :no_entry: </summary>       
  
  ```csharp
    [HttpPost]
    public async Task<ActionResult> ObtenerListadoPersonas()
    {
        try
        {
            return Json(await _repositorioPersona.ObtenerListadoPersonas());
        }
        catch (Exception e)
        {
            _logger.Log(e);
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
        }
    }
  ```
  <p>Método para obtener el listado del repositorio</p>

  ```csharp
    public async Task<IEnumerable<Datos>> ObtenerListadoPersonas()
    {
        return await unitOfWork.Connection.QueryAsync<Datos>(@"
            SELECT FaceId AS Id, Nombre, Puesto FROM personas");            
    }
  ```
  </details>
  </details>
  </blockquote>
  
## ¡Experimenta con la solución! 
  - Podes agregar validadores.
  - Podes fijarte las respuestas a imágenes de varios tipos y ángulos. 
  - Podes desarrollar un método para que dentro del grupo encuentre personas parecidas.
  - Podes probar con subir una gran grupo de personas, como responde la confidencia de la aplicación.
  - Podes investigar sobre las funcionalidades sobre Computer Vision.
