using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using ILogger = WebApplication1.Interfaces.ILogger;

namespace WebApplication1.Controllers
{
    public abstract class BaseController : Controller
    {        
        protected readonly IRepositorioPersona _repositorioPersona;
        protected readonly ILogger _logger;

        public BaseController(IRepositorioPersona repositorioPersona, ILogger logger)
        {
            _repositorioPersona = repositorioPersona;
            _logger = logger;
        }

        protected List<Persona> ReconocerCarasParaCamara(Stream imageStream)
        {
            throw new NotImplementedException();
        }

        protected List<Persona> CompararPersonas(Face[] caras)
        {
            throw new NotImplementedException();
        }
    }
}