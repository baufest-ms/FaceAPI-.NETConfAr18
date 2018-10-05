using NLog;
using ILogger = WebApplication1.Interfaces.ILogger;
using System;
using System.Text;

namespace WebApplication1.App_Start
{
    public class NLogger : ILogger 
    {
        private readonly Logger _logger;
        
        public NLogger()
        {
            _logger = LogManager.GetCurrentClassLogger();
        }
        
        public void Log(LogLevel tipoLog, string mensaje)
        {
            _logger.Log(tipoLog, mensaje);
        } 

        public void Log(Exception ex)
        {
            var excepcion = ex;
            var builder = new StringBuilder();

            do
            {
                builder.Append($"{excepcion.Message}:{excepcion.StackTrace}\r");
                excepcion = excepcion.InnerException;
            } while (excepcion != null);

            Log(LogLevel.Error, builder.ToString());
        }
    }
}