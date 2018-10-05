using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace WebApplication1.Utilities
{
    public static class StreamHelper
    {
        public static ByteArrayContent CrearByteArrayContent(this Stream stream)
        {
            var byteData = ObtenerByteArrayDeUnStream(stream);
            var content = new ByteArrayContent(byteData);

            return content;
        }

        public static byte[] ObtenerByteArrayDeUnStream(this Stream stream)
        {
            var binaryReader = new BinaryReader(stream);
            var byteData = binaryReader.ReadBytes((int)stream.Length);
            stream.Position = 0;
            return byteData;
        }
    }
}