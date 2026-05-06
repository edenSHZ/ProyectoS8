document.addEventListener("DOMContentLoaded", () => {

    const visor = document.getElementById("visorPDF");
    const btn   = document.getElementById("btnDescargar");
    const contenedor = document.querySelector(".pdf-visualizador");

    fetch("config/obtener_calendario_publico.php")
        .then(res => res.json())
        .then(data => {

            if (data.status === "success") {

                const ruta = "admin/uploads/calendarios/" + data.archivo;

                // Mostrar PDF
                visor.src = ruta;

                // Botón descarga
                btn.href = ruta;
                btn.setAttribute("download", "Calendario_Escolar.pdf");

            } else {
                contenedor.innerHTML = "<p>No hay calendario disponible</p>";
            }

        })
        .catch(error => {
            console.error("Error al cargar el calendario:", error);
            contenedor.innerHTML = "<p>Error al cargar el calendario</p>";
        });

});