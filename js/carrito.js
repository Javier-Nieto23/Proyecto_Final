let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito) || [];

// Supongamos que los productos tienen el stock en localStorage también
let productosDisponibles = localStorage.getItem("productos");
productosDisponibles = JSON.parse(productosDisponibles) || [];

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

function cargarProductosCarrito() {
    if (productosEnCarrito.length > 0) {

        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {

            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;

            contenedorCarritoProductos.append(div);
        });

        actualizarBotonesEliminar();
        actualizarTotal();

    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    Toastify({
        text: "Producto eliminado del carrito",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #4b33a8, #785ce9)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
        },
        onClick: function() { }
    }).showToast();

    const idBoton = e.currentTarget.id;
    const productoEliminado = productosEnCarrito.find(producto => producto.id === idBoton);

    // Restaurar stock
    const productoOriginal = productosDisponibles.find(producto => producto.id === idBoton);
    if (productoOriginal) {
        productoOriginal.stock += productoEliminado.cantidad; // Restaurar el stock
    }

    productosEnCarrito = productosEnCarrito.filter(producto => producto.id !== idBoton);
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    localStorage.setItem("productos", JSON.stringify(productosDisponibles)); // Guardar cambios en el stock

    cargarProductosCarrito();
}

botonVaciar.addEventListener("click", vaciarCarrito);

function vaciarCarrito() {
    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            // Restaurar stock al vaciar el carrito
            productosEnCarrito.forEach(productoCarrito => {
                const productoOriginal = productosDisponibles.find(producto => producto.id === productoCarrito.id);
                if (productoOriginal) {
                    productoOriginal.stock += productoCarrito.cantidad; // Restaurar stock
                }
            });

            productosEnCarrito.length = 0; // Vaciar el carrito
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            localStorage.setItem("productos", JSON.stringify(productosDisponibles)); // Guardar cambios en el stock
            cargarProductosCarrito();
            cargarProductos(productosDisponibles); // Actualizar el stock en el menú
        }
    });
}

// Comprar los productos del carrito y actualizar el stock permanentemente
botonComprar.addEventListener("click", comprarCarrito);

function comprarCarrito() {
    if (productosEnCarrito.length > 0) {
        // Aquí simplemente dejamos el stock como está porque ya se restó al agregar
        productosEnCarrito.length = 0; // Vaciar el carrito tras la compra
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        cargarProductosCarrito();
        cargarProductos(productosDisponibles); // Actualizar el menú
        Swal.fire({
            icon: 'success',
            title: 'Compra realizada',
            text: 'Gracias por su compra.'
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Carrito vacío',
            text: 'No tienes productos en el carrito.'
        });
    }
}

function actualizarTotal() {
    const total = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    contenedorTotal.innerText = `$${total}`;
}
