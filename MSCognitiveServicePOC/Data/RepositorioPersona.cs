using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Interfaces;
using WebApplication1.Models;

namespace WebApplication1.Data
{
    public class RepositorioPersona : IRepositorioPersona
    {
        private readonly UnitOfWork unitOfWork;

        public RepositorioPersona()
        {
            unitOfWork = new UnitOfWork(ConfigurationManager.ConnectionStrings["default"].ConnectionString);
        }

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

        public async Task<Guid> ObtenerFaceIdPorLegajo(int legajo)
        {
            return await unitOfWork.Connection.ExecuteScalarAsync<Guid>(@"
                SELECT FaceId FROM empleados WHERE Legajo = @Legajo",
                 new
                 {
                     Legajo = legajo
                 });
        }

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

        public async Task<IEnumerable<Empleado>> ObtenerListadoPersonas()
        {
            return await unitOfWork.Connection.QueryAsync<Empleado>(@"
                SELECT Legajo, FaceId, Nombre, Apellido, Puesto FROM empleados");
        }

        public async Task<Empleado> ObtenerDatosPorFaceId(Guid faceId)
        {
            return (await unitOfWork.Connection.QueryAsync<Empleado>(@"
                SELECT Legajo, FaceId, Nombre, Apellido, Puesto FROM empleados WHERE FaceId = @FaceId",
                new
                {
                    FaceId = faceId
                })).FirstOrDefault();
        }

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
    }
}