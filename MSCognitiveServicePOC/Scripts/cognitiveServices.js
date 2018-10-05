$(document).on('click', '.dropdown-menu', function (e) {
    e.stopPropagation();
});

function obtenerYAnalizarImagen(urlDeAnalisis) {
    screenCleanUp();

    var pathInput = $("#txtBoxPath").val();

    if (pathInput === "" || pathInput.startsWith("data:image")) {
        alert('Ingrese una Url valida');
        return;
    }

    procesarImagen(urlDeAnalisis, pathInput);
};

function cargarYAnalizarImagenLocal(urlUpload, droppedFile) {
    var data = new FormData();
    var file;
    if (droppedFile) {
        file = droppedFile;
    }
    else {
        file = $("#fileImpt")[0].files[0];
    }

    data.append("IMG", file);
    
    $(".loadingModal").fadeIn(50,function () {
        $.ajax({
            url: urlUpload,
            type: "Post",
            data: data,
            cache: false,
            async: false,
            contentType: false,  
            processData: false
        })

        .done(function (data) {
            $('.loadingModal').hide();
            screenCleanUp();
            cargarImagen(file, data, mostrarImagenLocal);        
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            $('.loadingModal').hide();
            alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
        });
    });
}

function analizarImagenCamara(urlDeAnalisis, bool) {
    var data = new FormData();

    $(".loadingModal").fadeIn(50, function () {
        $.ajax({
            url: urlDeAnalisis,
            type: "POST",
            data: data,
            cache: false,
            async: false,
            contentType: false, 
            processData: false
        })

        .done(function (data) {
            $('.loadingModal').hide();
            screenCleanUp();
            if (bool) {
                cargarImagen(data.streamImagen, data, mostrarImagenDeCamara, bool);
            } else {
                cargarImagen(data.streamImagen, JSON.parse(data.analisisResponse), mostrarImagenDeCamara);
            }            
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            $('.loadingModal').hide();
            alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
        });
    });
}

function analizarImagenWebCam(file) {
    var data = new FormData();
    data.append("imagen", file);

    $(".loadingModal").fadeIn(50, function () {
        $.ajax({
            url: '/Home/AnalizarCaraWebCam',
            type: "POST",
            data: data,
            cache: false,
            async: false,
            contentType: false,
            processData: false
        })

        .done(function (data) {
            $('.loadingModal').hide();
            cargarImagen(file, data, mostrarImagenDeCamara);
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            $('.loadingModal').hide();
            alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
        });
    });
}

function screenCleanUp() {
    $("#imgDiv").fadeOut();
    var imageSectionNode = document.getElementById("imgSection");
    while (imageSectionNode.firstChild) {
        imageSectionNode.removeChild(imageSectionNode.firstChild);
    }

    var imageInfoNode = document.getElementById("imgInfo");
    while (imageInfoNode.firstChild) {
        imageInfoNode.removeChild(imageInfoNode.firstChild);
    }
    var canvas = $("canvas");
    if (canvas.length > 0)
    {
        for (i = 0; i < canvas.length; ++i) {
            var list = document.getElementById("canvas") || document.getElementById("canvas" + i);
            list.parentNode.removeChild(list);
        };
    }
}

function tabClick() {
    screenCleanUp();
    $("#txtBoxPath").val("");
    $("#fileImpt").val("");
}

function procesarImagen(urlDeAnalisis, urlImagen) {
    var data = new FormData();
    data.append("path", urlImagen);
    
    $(".loadingModal").fadeIn(50,function () {
        $.ajax({
            url: urlDeAnalisis,
            async: false,
            type: "POST",
            data: data,
            cache: false,
            contentType: false,
            processData: false

        })

        .done(function (data) {
            $(".loadingModal").hide();
            cargarImagen(urlImagen, data, mostrarImagenDeUrl);
        })

        .fail(function (jqXHR, textStatus, errorThrown) {
            $('.loadingModal').hide();
            alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
        });
    });
};

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function hideCanvas(div) {
    $('#canvas' + div.id.slice(3)).hide();
};
function showCanvas(div) {
    $('#canvas' + div.id.slice(3)).show();
};

function rectangulosPalabras(data,x,y) {
    y = y + window.scrollY;
    $.each(data.Rectangulos, function(i,element){
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas' + i);
        canvas.setAttribute('name', 'canvasRect');
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.zIndex = 100;
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        var context = canvas.getContext('2d');
        context.strokeStyle = '#39ff14';
        context.lineWidth = 2;
        ejeX = x + ((element.Left * $(".imagen")[0].clientWidth) / $(".imagen")[0].naturalWidth);
        ejeY = y + ((element.Top * $(".imagen")[0].clientHeight) / $(".imagen")[0].naturalHeight);
        ancho = (element.Width * $(".imagen")[0].clientWidth) / $(".imagen")[0].naturalWidth;
        alto = (element.Height * $(".imagen")[0].clientHeight) / $(".imagen")[0].naturalHeight;
        context.strokeRect(ejeX, ejeY, ancho, alto);
    });
    $('canvas[name="canvasRect"]').hide();
}

function cargarImagen(source, data, funcionCarga, bool) {
    var dataCaras;
    if (bool) {
        dataCaras = data.infoCaras;
        data = JSON.parse(data.analisisResponse);        
    }

    var img = new Image();

    img.classList.add("imagen");

    img.onload = function () {
        ajustarDropZone();        

        $("#imgDiv").fadeIn("slow", function () {
            $("#imgInfo").css("height", $(".imagen")[0].clientHeight);
            $("#imgInfo").html(syntaxHighlight(JSON.stringify(data, undefined, 4)));
            $("#imgInfo").scrollLeft(40);            
        });
        var foto = img.getBoundingClientRect();
        var faces = [];
        var genders = [];
        if (dataCaras != null) {
            var nombres = [];            
            for (i = 0; i < dataCaras.length; ++i) {
                faces.push(dataCaras[i].Posicion);
                genders.push(dataCaras[i].Genero);
                nombres.push(dataCaras[i].Nombre);
            };
            dibujarRectangulosReco(foto.x, foto.y, img.clientHeight, img.clientWidth, genders, faces, nombres);            
        } else if (data[0]) {
            for (i = 0; i < data.length; ++i) {
                faces.push(data[i].FaceRectangle);
                genders.push(data[i].FaceAttributes.Gender);
            };
            console.log(faces);
            dibujarRectangulos(foto.x, foto.y, img.clientHeight, img.clientWidth, genders, faces);
        } else if (data.faces != null) {
            for (i = 0; i < data.faces.length; ++i) {
                data.faces[i].faceRectangle.Height = data.faces[i].faceRectangle.height;
                delete data.faces[i].faceRectangle.height;
                data.faces[i].faceRectangle.Width = data.faces[i].faceRectangle.width;
                delete data.faces[i].faceRectangle.width;
                data.faces[i].faceRectangle.Top = data.faces[i].faceRectangle.top;
                delete data.faces[i].faceRectangle.top;
                data.faces[i].faceRectangle.Left = data.faces[i].faceRectangle.left;
                delete data.faces[i].faceRectangle.left;
            
                faces.push(data.faces[i].faceRectangle);
                genders.push(data.faces[i].gender);
            };
            dibujarRectangulos(foto.x, foto.y, img.clientHeight, img.clientWidth, genders, faces);
        }
    }
    
    funcionCarga(img, source);
   
    var section = $("#imgSection")[0];
    section.appendChild(img);
}

function onImageDrop(urlUpload, event) {
    if (event.dataTransfer && event.dataTransfer.files.length) {
        event.preventDefault();
        event.stopPropagation();
        $.each(event.dataTransfer.files, function (i, file) {
            cargarYAnalizarImagenLocal(urlUpload, file);                        
        });
    }
}

function prepararParaDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    $(".dropZone").css("height", "300px");
    $("#dzLabel").css("line-height", "300px");
    var canvas = $("canvas");
    if (canvas.length > 0) {
        $.each(canvas, function(index, value){
            value.style.top = "200px";
        });
    }
}

function ajustarDropZone() {
    $(".dropZone").css("height", "100px");
    $("#dzLabel").css("line-height", "100px");
    var canvas = $("canvas");
    if (canvas.length > 0) {
        $.each(canvas, function (index, value) {
            value.style.top = "0px";
        });
    }
}

function dibujarRectangulos(x, y, altoFoto, anchoFoto, gender, faces) {
    y= y + window.scrollY;
    for (i = 0; i < faces.length; ++i)
    {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.zIndex = 100;
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        var context = canvas.getContext('2d');
        if (gender[i].length === 4)
        {
            context.strokeStyle = 'blue';
        } else
        {
            context.strokeStyle = 'red';
        }
        ejeX = x + ((faces[i].Left * $(".imagen")[0].clientWidth) / $(".imagen")[0].naturalWidth);
        ejeY = y + ((faces[i].Top * $(".imagen")[0].clientHeight) / $(".imagen")[0].naturalHeight);
        ancho = (faces[i].Width * $(".imagen")[0].clientWidth) / $(".imagen")[0].naturalWidth;
        context.strokeRect(ejeX, ejeY, ancho, ancho);
    };
}

function mostrarImagenDeUrl(imgDom, source) {
    imgDom.src = source;
}

function mostrarImagenLocal(imgDom, source) {
    var reader = new FileReader();
    reader.onloadend = function () {
        imgDom.src = reader.result;
    }
    reader.readAsDataURL(source);
}

function mostrarImagenDeCamara(imgDom, source) {
    imgDom.src = "data:image/png;base64," + source;
}

$("#txtBoxPath").keyup(function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        $("#botonUrl").click();
    }
});