using NLog;
using System;

namespace WebApplication1.Interfaces
{
    public interface ILogger
    {
        void Log(LogLevel tipoLog, string mensaje);
        void Log(Exception ex);
    }
}