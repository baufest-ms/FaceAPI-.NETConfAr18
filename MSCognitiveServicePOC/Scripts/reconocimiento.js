function tabClickReco() {
    screenCleanUpReco();
    document.getElementById('errorCrear').style.display = "none";
    document.getElementById('errorAgregar').style.display = "none";
    $("#txtBoxPath").val("");
    $("#fileImpt").val("");
}

function screenCleanUpReco() {
    $("#imgDiv").fadeOut();
    var imageSectionNode = document.getElementById("imgSection");
    while (imageSectionNode.firstChild) {
        imageSectionNode.removeChild(imageSectionNode.firstChild);
    }

    if ($("#imgInfo").hasClass("tabulator")) {
        $("#imgInfo").tabulator("destroy");
    }
    var imageInfoNode = document.getElementById("imgInfo");
    while (imageInfoNode.firstChild) {
        imageInfoNode.removeChild(imageInfoNode.firstChild);
    }


    var canvas = $("canvas");
    if (canvas.length > 0) {
        for (i = 0; i < canvas.length; ++i) {
            var list = document.getElementById("canvas");
            list.parentNode.removeChild(list);
        };
    }
}

function obtenerYReconocer(urlDeAnalisis, agregar) {
    screenCleanUpReco();
    var pathInput = $(agregar ? "#txtBoxPathAgregar" : "#txtBoxPath").val();

    if (pathInput === "" || pathInput.startsWith("data:image")) {
        alert('Ingrese una Url valida');
        return;
    }

    if (agregar) {
        var legajo = document.getElementById('legajoEncontrar').value;
        agregarCara(urlDeAnalisis, pathInput, legajo);
    }
    else {
        procesarReco(urlDeAnalisis, pathInput);
    }
};

function procesarReco(urlDeAnalisis, urlImagen) {
    $(".loadingModal").fadeIn(50, function () {
        $.ajax({
            url: urlDeAnalisis + "?path=" + urlImagen,
            async: false,
            type: "POST",
        })

            .done(function (data) {
                $(".loadingModal").hide();
                cargarImagenReco(urlImagen, data, mostrarImagenDeUrl);
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModal').hide();
                alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
            });
    });
};

function ajustarDropZoneReco() {
    $(".dropZone").css("height", "100px");
    $("#dzLabel").css("line-height", "100px");
    $("#dzLabelB").css("line-height", "100px");
}

function cargarImagenReco(source, data, funcionCarga) {
    var img = new Image();

    img.classList.add("imagen");

    img.onload = function () {
        ajustarDropZoneReco();
        var result = data.filter((x) => { return x.Nombre !== null; });

        $("#imgDiv").fadeIn("slow", function () {
            $("#imgInfo").html(generarTabla(result));
        });
        var foto = img.getBoundingClientRect();
        var faces = [];
        var genders = [];
        var nombres = [];
        if (data[0]) {
            for (i = 0; i < data.length; ++i) {
                faces.push(data[i].Posicion);
                genders.push(data[i].Genero);
                nombres.push(data[i].Nombre);
            };
            dibujarRectangulosReco(foto.x, foto.y, img.clientHeight, img.clientWidth, genders, faces, nombres);
        }
    }

    funcionCarga(img, source);
    var section = $("#imgSection")[0];
    section.appendChild(img);
}

function generarTabla(json) {
    if ($("#imgInfo").hasClass("tabulator")) {
        $("#imgInfo").tabulator("destroy");
    }
    $("#imgInfo").tabulator({
        height: 38 + (39 * json.length),
        layout: "fitColumns",
        columns: [
            { title: "Nombre", field: "Nombre" },
            { title: "Puesto", field: "Puesto" },
            { title: "Probabilidad", field: "Probabilidad" }
        ]
    });
    $("#imgInfo").css("padding", "inherit");
    $("#imgInfo").tabulator("setData", json);
}

function dibujarRectangulosReco(x, y, altoFoto, anchoFoto, gender, faces, nombres) {
    y = y + window.scrollY;
    for (i = 0; i < faces.length; ++i) {
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

        if (nombres[i] === null) {
            context.strokeStyle = 'gray';
        }
        else {
            context.strokeStyle = gender[i].length === 4 ? 'blue' : 'red';
        }

        context.lineWidth = 3;
        ejeX = x + ((faces[i].Left * $(".imagen")[0].clientWidth) / $(".imagen")[0].naturalWidth);
        ejeY = y + ((faces[i].Top * $(".imagen")[0].clientHeight) / $(".imagen")[0].naturalHeight);
        ancho = (faces[i].Width * $(".imagen")[0].clientWidth) / $(".imagen")[0].naturalWidth;
        context.strokeRect(ejeX, ejeY, ancho, ancho);
        if (nombres[i] !== null) {
            context.fillStyle = gender[i].length == 4 ? 'blue' : 'red';
            var index = nombres[i].indexOf(' ');
            var nombre = nombres[i].substring(0, index == -1 ? nombres[i].length : index);
            context.font = "12px Helvetica";
            largoRectangulo = context.measureText(nombre).width + 10;
            ejeX = largoRectangulo > ancho ? ejeX - (largoRectangulo - ancho) / 2 : ejeX + (ancho - largoRectangulo) / 2;

            var r = 10;
            var xx = ejeX;
            var yy = ejeY + ancho + 10;
            var w = largoRectangulo;
            var h = 20;
            context.beginPath();
            context.moveTo(xx + r, yy);
            context.arcTo(xx + w, yy, xx + w, yy + h, r);
            context.arcTo(xx + w, yy + h, xx, yy + h, r);
            context.arcTo(xx, yy + h, xx, yy, r);
            context.arcTo(xx, yy, xx + w, yy, r);
            context.closePath();
            context.fill();

            context.fillStyle = "white";
            context.fillText(nombre, ejeX + 5, ejeY + ancho + 25);
        }
    };
}

function prepararParaDropReco(event) {
    event.preventDefault();
    event.stopPropagation();
    $(".dropZone").css("height", "300px");
    $("#dzLabel").css("line-height", "300px");
    var canvas = $("canvas");
    if (canvas.length > 0) {
        $.each(canvas, function (index, value) {
            value.style.top = "200px";
        });
    }

}

function ajustarDropZoneReco() {
    $(".dropZone").css("height", "100px");
    $("#dzLabel").css("line-height", "100px");
    $("#dzLabelB").css("line-height", "100px");
    var canvas = $("canvas");
    if (canvas.length > 0) {
        $.each(canvas, function (index, value) {
            value.style.top = "0px";
        });
    }
}

function onImageDropReco(urlUpload, event, agregar) {
    if (event.dataTransfer && event.dataTransfer.files.length) {
        event.preventDefault();
        event.stopPropagation();
        $.each(event.dataTransfer.files, function (i, file) {
            if (agregar) {
                agregarCaraLocal(urlUpload, file);
            }
            else {
                cargarYReconocerImagenLocal(urlUpload, file);
            }
        });
    }
}

function cargarYReconocerImagenLocal(urlUpload, droppedFile) {
    var data = new FormData();
    var file;
    if (droppedFile) {
        file = droppedFile;
    }
    else {
        file = $("#fileImpt")[0].files[0];
    }

    data.append("IMG", file);

    $(".loadingModal").fadeIn(50, function () {
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
                screenCleanUpReco();
                cargarImagenReco(file, data, mostrarImagenLocal);
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModal').hide();
                alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
            });
    });
}

function limpiarReco() {
    document.getElementById('errorCrear').style.display = 'none';
    document.getElementById('errorAgregar').style.display = 'none';
    document.getElementById('errorImagenes').style.display = 'none';
    $("#legajo").val("");
    $("#nombre").val("");
    $("#apellido").val("");
    $("#legajoEncontrar").val("");
    $("#legajoParaImagenes").val("");
    $("#puesto").val("");
    $("#txtBoxPathAgregar").val("");
    $("#tablaImagenes").remove();
}

function validarPersona(urlUpload) {
    var x = document.getElementById('errorCrear');
    x.style.display = 'none';
    var data = new FormData();
    data.append("legajo", document.getElementById('legajo').value);
    data.append("nombre", document.getElementById('nombre').value);
    data.append("apellido", document.getElementById('apellido').value);
    data.append("puesto", document.getElementById('puesto').value);

    $(".loadingModalReco").fadeIn(50, function () {
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
                $('.loadingModalReco').hide();
                x.className = "alert alert-primary";
                x.innerHTML = "Persona fue agregada correctamente.";
                x.style.display = "block";
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-danger";
                x.innerHTML = errorThrown;
                x.style.display = "block";
            });
    });

};

function agregarCara(urlUpload, pathInput, legajo) {
    var x = document.getElementById('errorAgregar');
    x.style.display = "none";
    var data = new FormData();
    data.append("legajo", legajo);
    data.append("path", pathInput);

    $(".loadingModalReco").fadeIn(50, function () {
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
                $('.loadingModalReco').hide();
                $("#txtBoxPathAgregar").val("");
                x.className = "alert alert-primary";
                x.innerHTML = "Cara fue agregada correctamente.";
                x.style.display = "block";

            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModalReco').hide();
                $("#txtBoxPathAgregar").val("");
                x.className = "alert alert-danger";
                x.innerHTML = errorThrown;
                x.style.display = "block";
            });
    });

};

function agregarCaraLocal(urlUpload, droppedFile) {
    var x = document.getElementById('errorAgregar');
    x.style.display = "none";
    var legajo = document.getElementById('legajoEncontrar').value;
    var data = new FormData();
    var file;
    if (droppedFile) {
        file = droppedFile;
    }
    else {
        file = $("#fileImptAgregar")[0].files[0];
    }

    data.append("IMG", file);

    $(".loadingModalReco").fadeIn(50, function () {
        $.ajax({
            url: urlUpload + "?legajo=" + legajo,
            type: "Post",
            data: data,
            cache: false,
            async: false,
            contentType: false,
            processData: false
        })

            .done(function (data) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-primary";
                x.innerHTML = "Cara fue agregada correctamente.";
                x.style.display = "block";
                ajustarDropZoneReco();
                $("#fileImptAgregar").val("");
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-danger";
                x.innerHTML = errorThrown;
                x.style.display = "block";
                ajustarDropZoneReco();
                $("#fileImptAgregar").val("");
            });
    });
}

function prepararParaDropB(event) {
    event.preventDefault();
    event.stopPropagation();
    $(".dropZone").css("height", "195px");
    $("#dzLabelB").css("line-height", "195px");
}


$("#modalPersona").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#agregar").click();
    }
    if (event.keyCode === 27) {
        limpiarReco();
    }
});

$("#modalCara").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#botonUrlAgregar").click();
    }
    if (event.keyCode === 27) {
        limpiarReco();
    }
});

$("#modalListado").keyup(function (event) {
    if (event.keyCode === 27) {
        if ($("#tablaListado").hasClass("tabulator")) {
            $("#tablaListado").tabulator("destroy");
        }
        document.getElementById('errorListado').style.display = "none";
    }
});

$(function () {
    if ((window.location.pathname).includes("Listado")) {
        $(".loadingModalReco").fadeIn(50, function () {
            $.ajax({
                url: "/Reconocimiento/ObtenerListadoPersonas",
                type: "Post",
                async: false
            })

                .done(function (data) {
                    $('.loadingModalReco').hide();
                    GenerarListado(data);
                })

                .fail(function (jqXHR, textStatus, errorThrown) {
                    $('.loadingModalReco').hide();
                    document.getElementById('errorListado').style.display = "block";
                });
        });
    }
});

function getListado() {
    $(".loadingModal").fadeIn(50, function () {
        $.ajax({
            url: "/Reconocimiento/ObtenerListadoPersonas",
            type: "Post",
            async: false
        })

            .done(function (data) {
                $('.loadingModal').hide();
                GenerarListado(data);
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModal').hide();
                document.getElementById('errorListado').style.display = "block";
            });
    });
};

function GenerarListado(data) {
    if ($("#tablaListado").hasClass("tabulator")) {
        $("#tablaListado").tabulator("destroy");
    }

    $("#tablaListado").tabulator({
        columns: [
            { title: "Nombre", field: "Nombre", headerFilter: true, headerFilterPlaceholder: "Filtrar por nombre...", width: 212 },
            { title: "Apellido", field: "Apellido", headerFilter: true, headerFilterPlaceholder: "Filtrar por apellido...", width: 212 },
            { title: "Puesto", field: "Puesto", headerFilter: true, headerFilterPlaceholder: "Filtrar por puesto...", width: 212 },
            { title: "Legajo", field: "Legajo", headerFilter: true, headerFilterPlaceholder: "Filtrar por legajo...", width: 212 }
        ]
    });

    $("#tablaListado").tabulator("setData", data);
};

function agregarCaraDeCamara() {
    var x = document.getElementById('errorAgregar');
    x.style.display = 'none';

    var data = new FormData();
    data.append("legajo", $('#legajo').val());

    $(".loadingModalReco").fadeIn(50, function () {
        $.ajax({
            url: '/Reconocimiento/AgregarCaraDeCamara',
            type: "Post",
            data: data,
            cache: false,
            async: false,
            contentType: false,
            processData: false
        })

            .done(function (data) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-primary";
                x.innerHTML = "Cara fue agregada correctamente.";
                x.style.display = "block";
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-danger";
                x.innerHTML = errorThrown;
                x.style.display = "block";
            });
    });
};

function agregarCaraCamaraWeb(file) {
    var x = document.getElementById('errorAgregar');
    x.style.display = 'none';

    var data = new FormData();
    data.append("legajo", $('#legajoEncontrar').val());
    data.append("imagen", file);

    $(".loadingModalReco").fadeIn(50, function () {
        $.ajax({
            url: '/Reconocimiento/AgregarCaraDeWebCam',
            type: "Post",
            data: data,
            cache: false,
            async: false,
            contentType: false,
            processData: false
        })

            .done(function (data) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-primary";
                x.innerHTML = "Cara fue agregada correctamente.";
                x.style.display = "block";
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModalReco').hide();
                x.className = "alert alert-danger";
                x.innerHTML = errorThrown;
                x.style.display = "block";
            });
    });
};

$("#modalImagenes").keyup(function (event) {
    if (event.keyCode === 27) {
        $("#tablaImagenes").remove();
        $("#legajoParaImagenes").val("");
        document.getElementById('errorImagenes').style.display = "none";
    }
    if (event.keyCode === 13) {
        $("#botonParaImagenes").click();
    }
});

window.onclick = function (event) {
    if (event.target.className == "modal fade") {
        limpiarReco();
    }
};

function obtenerImagenes() {
    var x = document.getElementById('errorImagenes');
    x.style.display = 'none';
    $('#tablaImagenes').remove();

    $(".loadingModalReco").fadeIn(50, function () {
        $.ajax({
            url: "/Reconocimiento/ObtenerImagenesPorLegajo?legajo=" + $('#legajoParaImagenes').val(),
            type: "Post",
            async: false
        })

            .done(function (data) {
                $('.loadingModalReco').hide();
                var section = $("#imagenes");
                section.append("<table id=\"tablaImagenes\" class='col-md-12'></table>");
                i = data.length;
                for (j = 0; j <= Math.floor(i / 5); j++) {
                    $("#tablaImagenes").append("<tr id=\"fila" + j + "\"></tr>");
                }

                $.each(data, function (index, element) {
                    var img = new Image();
                    img.classList.add("reconocimiento");
                    mostrarImagenDeCamara(img, element);
                    $("#fila" + Math.floor(index / 5)).append("<td id=\"img" + index + "\" onclick='tdclick(" + index + ");' style='text-align: center;'></td>");
                    $("#img" + index)[0].appendChild(img);
                });
                $(".reconocimiento").css({ height: "auto", width: "auto", 'max-height': "150px", 'max-width': "150px", });
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModalReco').hide();
                x.innerHTML = errorThrown;
                x.style.display = "block";
            });
    });

};

function tdclick(i) {
    var modal = document.getElementById('myModal');
    var span = document.getElementsByClassName("close")[0];

    $("#imag").append("<img src=" + $("#img" + i + " img")[0].src + " alt='' style='height: auto; width: auto; max-height: 600px; max-width: 600px;' >");

    modal.style.display = "block";

    $("#myModalContent").css({
        top: "200px",
        'background-color': '#fefefe',
        margin: 'auto',
        padding: '20px',
        border: '1px solid #888',
        width: $("#imag img")[0].width <= 600 ? $("#imag img")[0].width + 40 : "640px",
    });

    window.onclick = function (event) {
        if (event.target == modal) {
            $("#imag img").remove();
            modal.style.display = "none";
        }
    }
};

function onTakePhoto(metodo) {
    var imageCapture;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (mediaStream) {
            var videoStream = document.getElementById('video');
            videoStream.srcObject = mediaStream;
            const mediaStreamTrack = mediaStream.getVideoTracks()[0];

            if (typeof InstallTrigger !== 'undefined') { //isFirefox
                setTimeout(function () {
                    procesarImagenReco(metodo, videoStream, videoStream.videoWidth, videoStream.videoHeight);
                }, 2000);
            } else {
                imageCapture = new ImageCapture(mediaStreamTrack);
                imageCapture.grabFrame()
                    .then(imageBitmap => {
                        procesarImagenReco(metodo, imageBitmap, imageBitmap.width, imageBitmap.height);
                    })
                    .catch(error => alert(error));
            }
            setTimeout(function () { mediaStreamTrack.stop() }, 5000);
        })
        .catch(error => alert(error));
};

function procesarImagenReco(metodo, imagen, ancho, alto) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    canvas.width = ancho;
    canvas.height = alto;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.display = "none";
    document.body.appendChild(canvas);

    var context = canvas.getContext('2d');
    context.drawImage(imagen, 0, 0);

    var data = canvas.toDataURL().slice(22);
    metodo(data);
}

function analizarFotoCamaraWeb(file) {
    var data = new FormData();
    data.append("imagen", file);

    $(".loadingModal").fadeIn(50, function () {
        $.ajax({
            url: '/Reconocimiento/ReconocerCarasWebCam',
            type: "Post",
            data: data,
            cache: false,
            async: false,
            contentType: false,
            processData: false
        })

            .done(function (data) {
                $(".loadingModal").hide();
                cargarImagenReco(file, data, mostrarImagenDeCamara);
            })

            .fail(function (jqXHR, textStatus, errorThrown) {
                $('.loadingModal').hide();
                alert('La imagen no pudo ser analizada. Por favor intente nuevamente.');
            });
    });
};
