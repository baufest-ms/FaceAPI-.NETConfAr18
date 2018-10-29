using Microsoft.ProjectOxford.Face;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using WebApplication1.Utilities;
using ILogger = WebApplication1.Interfaces.ILogger;

namespace WebApplication1.Controllers
{
    public class ReconocimientoController : BaseController
    {
        public ReconocimientoController(IRepositorioPersona repositorioPersona, ILogger logger)
            : base(repositorioPersona, logger)
        {
        }

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

        [HttpPost]
        public async Task<ActionResult> AgregarPersonaAGrupo(Empleado empleado)
        {
            try
            {
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

        [HttpPost]
        public async Task<ActionResult> AgregarCaraPersona(int legajo, string path)
        {
            try
            {
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

        [HttpPost]
        public async Task<ActionResult> AgregarCaraPersonaLocal(int legajo)
        {
            try
            {
                var fileContent = System.Web.HttpContext.Current.Request.Files["IMG"];
                var byteArray = fileContent.InputStream.ObtenerByteArrayDeUnStream();

                var faceId = await _repositorioPersona.ObtenerFaceIdPorLegajo(legajo);
                var fotoId = await faceServiceClient.AddPersonFaceInPersonGroupAsync(grupoId, faceId, new MemoryStream(byteArray));

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

        [HttpPost]
        public async Task<ActionResult> AgregarCaraDeWebCam(int legajo, string imagen)
        {
            try
            {
                var byteArray = Convert.FromBase64String(imagen);

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

        [HttpPost]
        public async Task<ActionResult> ObtenerImagenesPorLegajo(int legajo)
        {
            try
            {
                var result = await _repositorioPersona.ObtenerImagenes(legajo);
                if (result.Count() > 0)
                {
                    return new JsonResult()
                    {
                        ContentEncoding = Encoding.Default,
                        ContentType = "application/json",
                        Data = result.Select(d => Convert.ToBase64String(d)),
                        MaxJsonLength = int.MaxValue
                    };
                }

                return new HttpStatusCodeResult(HttpStatusCode.NotFound, "No se encontraron imagenes.");
            }
            catch (Exception e)
            {
                _logger.Log(e);
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
            }
        }

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
    }
}