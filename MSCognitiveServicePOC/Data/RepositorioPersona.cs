using System.Configuration;
using WebApplication1.Interfaces;

namespace WebApplication1.Data
{
    public class RepositorioPersona : IRepositorioPersona
    {
        private readonly UnitOfWork unitOfWork;

        public RepositorioPersona()
        {
            unitOfWork = new UnitOfWork(ConfigurationManager.ConnectionStrings["default"].ConnectionString);
        }
    }
}