using System.Net;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models;
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
        public ActionResult ReconocerCaras(string path)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult ReconocerCarasLocal()
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult ReconocerCarasWebCam(string imagen)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult AgregarPersonaAGrupo(Empleado empleado)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult AgregarCaraPersona(int legajo, string path)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult AgregarCaraPersonaLocal(int legajo)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult AgregarCaraDeWebCam(int legajo, string imagen)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult ObtenerImagenesPorNombre(int legajo)
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }

        [HttpPost]
        public ActionResult ObtenerListadoPersonas()
        {
            return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        }
    }
}