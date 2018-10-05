using System.Net;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using ILogger = WebApplication1.Interfaces.ILogger;

namespace WebApplication1.Controllers
{
    public class HomeController : BaseController
    {
        public HomeController(IRepositorioPersona repositorioPersona, ILogger logger)
            :base(repositorioPersona, logger)
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
        public ActionResult AnalizarCara(string path)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult AnalizarCaraLocal()
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult AnalizarCaraWebCam(string imagen)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }
    }
}