using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Models;

namespace WebApplication1.Interfaces
{
    public interface IRepositorioPersona
    {
        Task AgregarPersona(Empleado empleado);
        Task<bool> ExistePersona(int legajo);
        Task<Guid> ObtenerFaceIdPorLegajo(int legajo);
        Task GuardarImagen(int legajo, byte[] data, Guid fotoId);
        Task<IEnumerable<Empleado>> ObtenerListadoPersonas();
        Task<Empleado> ObtenerDatosPorFaceId(Guid faceId);
        Task<IEnumerable<byte[]>> ObtenerImagenes(int legajo);
    }
}
