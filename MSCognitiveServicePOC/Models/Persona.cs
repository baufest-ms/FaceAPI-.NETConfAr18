using System;

namespace WebApplication1.Models
{
    public class Persona
    {
        public string Nombre { get; set; }
        public string Puesto { get; set; }
        public Guid Id { get; set; }
        public double? Probabilidad { get; set; }        
        public string Genero { get; set; }
        public FaceRectangle Posicion { get; set; }
    }
}