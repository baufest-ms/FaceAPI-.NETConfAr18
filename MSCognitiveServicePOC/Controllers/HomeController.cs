using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using ILogger = WebApplication1.Interfaces.ILogger;

namespace WebApplication1.Controllers
{
    public class HomeController : BaseController
    {
        public HomeController(IRepositorioPersona repositorioPersona, ILogger logger)
            : base(repositorioPersona, logger)
        {
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult FaceApi()
        {
            return View();
        }

        public ActionResult Reconocimiento()
        {
            return View();
        }

        public ActionResult Listado()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> AnalizarCara(string path)
        {
            try
            {
                return Json(await faceServiceClient.DetectAsync(path, returnFaceId: true, returnFaceLandmarks: false, returnFaceAttributes: faceAttributes));
            }
            catch (Exception e)
            {
                _logger.Log(e);
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, e.Message);
            }
        }

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
    }
}