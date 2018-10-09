using Microsoft.ProjectOxford.Face;
using Microsoft.ProjectOxford.Face.Contract;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using ILogger = WebApplication1.Interfaces.ILogger;

namespace WebApplication1.Controllers
{
    public abstract class BaseController : Controller
    {
        protected const string grupoId = "";
        protected readonly IRepositorioPersona _repositorioPersona;
        protected readonly ILogger _logger;
        protected readonly IFaceServiceClient faceServiceClient;
        protected readonly IEnumerable<FaceAttributeType> faceAttributes = new FaceAttributeType[]
        {
            FaceAttributeType.Gender, FaceAttributeType.Age,
            FaceAttributeType.HeadPose, FaceAttributeType.Smile,
            FaceAttributeType.FacialHair, FaceAttributeType.Glasses,
            FaceAttributeType.Emotion, FaceAttributeType.Hair,
            FaceAttributeType.Makeup, FaceAttributeType.Occlusion,
            FaceAttributeType.Accessories, FaceAttributeType.Blur,
            FaceAttributeType.Exposure, FaceAttributeType.Noise
        };

        public BaseController(IRepositorioPersona repositorioPersona, ILogger logger)
        {
            _repositorioPersona = repositorioPersona;
            _logger = logger;
            faceServiceClient = new FaceServiceClient(ConfigurationManager.AppSettings["FaceApiSubscriptionKey"], ConfigurationManager.AppSettings["FaceApiEndpoint"]);
        }

        protected List<Persona> ReconocerCarasParaCamara(Stream imageStream)
        {
            throw new NotImplementedException();
        }

        protected async Task<List<Persona>> CompararPersonasAsync(Face[] caras)
        {
            var personasFoto = caras.Select(c => new Persona { Id = c.FaceId, Genero = c.FaceAttributes.Gender, Posicion = c.FaceRectangle }).ToList();

            if (personasFoto.Count > 0)
            {
                Empleado candidato;
                var faceIds = personasFoto.Select(p => p.Id).ToArray();
                var data = await faceServiceClient.IdentifyAsync(faceIds: faceIds, personGroupId: grupoId, maxNumOfCandidatesReturned: 1, confidenceThreshold: (float)0.65, largePersonGroupId: null);

                for (int i = 0; i < data.Length; i++)
                {
                    if (data[i].Candidates.Length > 0)
                    {
                        candidato = await _repositorioPersona.ObtenerDatosPorFaceId(data[i].Candidates[0].PersonId);
                        personasFoto[i].Puesto = candidato.Puesto;
                        personasFoto[i].Nombre = candidato.Nombre + " " + candidato.Apellido;
                        personasFoto[i].Probabilidad = data[i].Candidates[0].Confidence;
                    }
                }
            }

            return personasFoto;
        }
    }
}