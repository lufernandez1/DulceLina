
// ==========================================
// 1. ARRAY DE PRODUCTOS
// ==========================================

const productos = [
    {
        id: 1,
        nombre: "Chipá",
        categoria: "panaderia",
        descripcion: "Deliciosos chipás artesanales elaborados con queso.",
        precio: 1500,
        imagen: "IMG/chipa.jpeg"
    },
    {
        id: 2,
        nombre: "Croissants",
        categoria: "panaderia",
        descripcion: "Croissants de manteca, dorados y crujientes.",
        precio: 2500,
        imagen: "IMG/croissants.jpeg"
    },
    {
        id: 3,
        nombre: "Medialunas",
        categoria: "panaderia",
        descripcion: "Medialunas suaves, esponjosas y recién horneadas.",
        precio: 1200,
        imagen: "IMG/medialunas.jpeg"
    },
    {
        id: 4,
        nombre: "Torta de frutillas",
        categoria: "pasteleria",
        descripcion: "Torta artesanal con crema y frutillas frescas.",
        precio: 18000,
        imagen: "IMG/torta-frutillas.jpeg"
    }
];


// ==========================================
// 2. VARIABLES Y ELEMENTOS DEL DOM
// ==========================================

const contenedorProductos = document.querySelector("#productos");
const buscador = document.querySelector("#buscador");
const filtro = document.querySelector("#filtro");
const sinResultados = document.querySelector("#sin-resultados");

const listaCarrito = document.querySelector("#lista-carrito");
const totalCarrito = document.querySelector("#total-carrito");
const botonVaciar = document.querySelector("#vaciar-carrito");
const botonFinalizar = document.querySelector("#finalizar-compra");
const confirmacion = document.querySelector("#confirmacion-compra");

const formulario = document.querySelector("#formulario");
const cotizacionTexto = document.querySelector("#cotizacion");

let cotizacionDolar = null;

// Recuperamos el carrito guardado en localStorage.

let carrito = [];

try {
    carrito = JSON.parse(localStorage.getItem("carritoDulceLina")) || [];
} catch (error) {
    carrito = [];
}


// ==========================================
// 3. FORMATO DE PRECIOS
// ==========================================

function formatoPrecio(precio) {

    return precio.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    });

}


// ==========================================
// 4. MOSTRAR PRODUCTOS DINÁMICAMENTE
// ==========================================

function mostrarProductos() {

    const texto = buscador.value.toLowerCase().trim();
    const categoria = filtro.value;

    const productosFiltrados = productos.filter(function(producto) {

        const coincideNombre =
            producto.nombre.toLowerCase().includes(texto);

        const coincideCategoria =
            categoria === "todos" ||
            producto.categoria === categoria;

        return coincideNombre && coincideCategoria;

    });

    contenedorProductos.innerHTML = "";

    sinResultados.hidden = productosFiltrados.length !== 0;

    productosFiltrados.forEach(function(producto) {

        let precioDolar = "";

        if (cotizacionDolar !== null) {

            precioDolar =
                "USD " +
                (producto.precio / cotizacionDolar).toFixed(2);

        }

        const tarjeta = document.createElement("article");

        tarjeta.classList.add("producto");

        tarjeta.innerHTML = `
            <div class="producto-imagen">
                <img src="${producto.imagen}"
                     alt="${producto.nombre}">
            </div>

            <p class="categoria">${producto.categoria.toUpperCase()}</p>

            <h2>${producto.nombre}</h2>

            <p>${producto.descripcion}</p>

            <p class="precio">
                ${formatoPrecio(producto.precio)}
            </p>

            <p class="precio-usd">${precioDolar}</p>

            <button type="button" class="boton-js">
                Agregar al pedido
            </button>
        `;

        const boton = tarjeta.querySelector("button");

        boton.addEventListener("click", function() {

            agregarAlCarrito(producto.id);

        });

        contenedorProductos.appendChild(tarjeta);

    });

}


// ==========================================
// 5. EVENTOS DEL BUSCADOR Y FILTRO
// ==========================================

buscador.addEventListener("input", mostrarProductos);

filtro.addEventListener("change", mostrarProductos);


// ==========================================
// 6. AGREGAR PRODUCTOS AL CARRITO
// ==========================================

function agregarAlCarrito(id) {

    const existente = carrito.find(function(item) {

        return item.id === id;

    });

    if (existente) {

        existente.cantidad++;

    } else {

        carrito.push({
            id: id,
            cantidad: 1
        });

    }

    confirmacion.textContent = "";

    actualizarCarrito();

}


// ==========================================
// 7. MODIFICAR CANTIDADES Y ELIMINAR
// ==========================================

function cambiarCantidad(id, cambio) {

    const item = carrito.find(function(producto) {

        return producto.id === id;

    });

    if (item) {

        item.cantidad += cambio;

        if (item.cantidad <= 0) {

            eliminarProducto(id);

        } else {

            actualizarCarrito();

        }

    }

}

function eliminarProducto(id) {

    carrito = carrito.filter(function(item) {

        return item.id !== id;

    });

    actualizarCarrito();

}


// ==========================================
// 8. CALCULAR EL TOTAL
// ==========================================

function calcularTotal() {

    let total = 0;

    carrito.forEach(function(item) {

        const producto = productos.find(function(p) {

            return p.id === item.id;

        });

        if (producto) {

            total += producto.precio * item.cantidad;

        }

    });

    return total;

}


// ==========================================
// 9. ACTUALIZAR Y GUARDAR EL CARRITO
// ==========================================

function actualizarCarrito() {

    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {

        listaCarrito.textContent = "Tu carrito está vacío.";

    }

    carrito.forEach(function(item) {

        const producto = productos.find(function(p) {

            return p.id === item.id;

        });

        if (!producto) {
            return;
        }

        const fila = document.createElement("div");

        fila.classList.add("fila-carrito");

        fila.innerHTML = `
            <strong>${producto.nombre}</strong>

            <div>
                <button type="button" class="restar">-</button>
                <span>${item.cantidad}</span>
                <button type="button" class="sumar">+</button>
            </div>

            <span>
                ${formatoPrecio(producto.precio * item.cantidad)}
            </span>

            <button type="button" class="eliminar">
                Eliminar
            </button>
        `;

        fila.querySelector(".restar").addEventListener("click", function() {

            cambiarCantidad(item.id, -1);

        });

        fila.querySelector(".sumar").addEventListener("click", function() {

            cambiarCantidad(item.id, 1);

        });

        fila.querySelector(".eliminar").addEventListener("click", function() {

            eliminarProducto(item.id);

        });

        listaCarrito.appendChild(fila);

    });

    totalCarrito.textContent = formatoPrecio(calcularTotal());

    // Guardamos el carrito en el navegador.

    localStorage.setItem(
        "carritoDulceLina",
        JSON.stringify(carrito)
    );

}


// ==========================================
// 10. VACIAR CARRITO
// ==========================================

botonVaciar.addEventListener("click", function() {

    carrito = [];

    confirmacion.textContent = "";

    actualizarCarrito();

});


// ==========================================
// 11. FINALIZAR COMPRA SIMULADA
// ==========================================

botonFinalizar.addEventListener("click", function() {

    if (carrito.length === 0) {

        confirmacion.textContent =
            "Agregá productos antes de finalizar la compra.";

        confirmacion.style.color = "#b42318";

        return;

    }

    const totalCompra = calcularTotal();

    carrito = [];

    actualizarCarrito();

    confirmacion.textContent =
        "¡Gracias por elegir DulceLina! Tu compra de " +
        formatoPrecio(totalCompra) +
        " fue confirmada correctamente. " +
        "Esta es una compra simulada.";

    confirmacion.style.color = "#287a46";

    confirmacion.style.fontWeight = "bold";

});


// ==========================================
// 12. VALIDACIÓN DEL FORMULARIO
// ==========================================

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const nombre = document.querySelector("#nombre");
    const email = document.querySelector("#email");
    const mensaje = document.querySelector("#mensaje");

    const resultado = document.querySelector("#resultado-formulario");

    let formularioValido = true;

    resultado.textContent = "";

    // Limpiar errores anteriores.

    document.querySelectorAll(".error").forEach(function(error) {

        error.textContent = "";

    });

    document.querySelectorAll(".invalido").forEach(function(campo) {

        campo.classList.remove("invalido");

    });

    // Validar nombre.

    if (nombre.value.trim().length < 3) {

        document.querySelector("#error-nombre").textContent =
            "Ingresá un nombre de al menos 3 caracteres.";

        nombre.classList.add("invalido");

        formularioValido = false;

    }

    // Validar correo electrónico.

    const expresionEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expresionEmail.test(email.value.trim())) {

        document.querySelector("#error-email").textContent =
            "Ingresá un correo electrónico válido.";

        email.classList.add("invalido");

        formularioValido = false;

    }

    // Validar mensaje.

    if (mensaje.value.trim().length < 10) {

        document.querySelector("#error-mensaje").textContent =
            "El mensaje debe tener al menos 10 caracteres.";

        mensaje.classList.add("invalido");

        formularioValido = false;

    }

    // Confirmar envío simulado.

    if (formularioValido) {

        resultado.textContent =
            "¡Gracias, " + nombre.value.trim() +
            "! Tu consulta fue registrada correctamente. " +
            "Envío simulado.";

        formulario.reset();

    }

});


// ==========================================
// 13. CONSUMO DE API EXTERNA
// ==========================================

async function obtenerCotizacion() {

    cotizacionTexto.textContent =
        "Cargando cotización del dólar...";

    try {

        const respuesta = await fetch(
            "https://dolarapi.com/v1/dolares/oficial"
        );

        if (!respuesta.ok) {

            throw new Error("Error al consultar la API");

        }

        const datos = await respuesta.json();

        if (!Number.isFinite(datos.venta) || datos.venta <= 0) {

            throw new Error("Cotización inválida");

        }

        cotizacionDolar = datos.venta;

        cotizacionTexto.textContent =
            "Dólar oficial: " +
            formatoPrecio(cotizacionDolar) +
            " | Precios en USD orientativos.";

        mostrarProductos();

    } catch (error) {

        cotizacionDolar = null;

        cotizacionTexto.textContent =
            "No se pudo obtener la cotización del dólar. " +
            "Los precios en pesos siguen disponibles.";

        console.error("Error de API:", error);

    }

}


// ==========================================
// 14. INICIALIZACIÓN DE LA PÁGINA
// ==========================================

mostrarProductos();

actualizarCarrito();

obtenerCotizacion();
