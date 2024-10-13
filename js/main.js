let productos = [];

// Cargar productos del JSON y del localStorage
fetch("./js/productos.json")
    .then(response => response.json())
    .then(data => {
        const productosGuardados = localStorage.getItem("productos");
        productos = productosGuardados ? JSON.parse(productosGuardados) : data;
        cargarProductos(productos);
    });

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");

// Aquí agregamos el selector para el campo de búsqueda
const inputBusqueda = document.getElementById('input-busqueda');
const btnBuscar = document.getElementById('btn-buscar');

botonesCategorias.forEach(boton => boton.addEventListener("click", () => {
    aside.classList.remove("aside-visible");
}));

function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {
        if (producto.stock > 0) { // Solo mostrar productos con stock
            const div = document.createElement("div");
            div.classList.add("producto");
            div.innerHTML = `
                <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="producto-detalles">
                    <h3 class="producto-titulo">${producto.titulo}</h3>
                    <p class="producto-precio">$${producto.precio}</p>
                    <p class="producto-stock">Stock: ${producto.stock}</p>
                    <button class="producto-agregar" id="${producto.id}">Agregar</button>
                </div>
            `;
            contenedorProductos.append(div);
        }
    });

    actualizarBotonesAgregar();
}

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const productoCategoria = productos.find(producto => producto.categoria.id === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.categoria.nombre;
            const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            cargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
        }
    });
});

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}

// Agregar productos al carrito y actualizar el stock en tiempo real
function agregarAlCarrito(e) {
    Toastify({
        text: "Producto agregado al carrito",
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
    const productoAgregado = productos.find(producto => producto.id === idBoton);
    const cantidadAgregar = 1; // Puedes cambiar esto para permitir agregar múltiples a la vez

    if (productoAgregado.stock >= cantidadAgregar) {
        productoAgregado.stock -= cantidadAgregar; // Restar del stock temporalmente

        // Actualizar carrito
        if (productosEnCarrito.some(producto => producto.id === idBoton)) {
            const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
            productosEnCarrito[index].cantidad += cantidadAgregar;
        } else {
            productoAgregado.cantidad = cantidadAgregar;
            productosEnCarrito.push(productoAgregado);
        }

        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        localStorage.setItem("productos", JSON.stringify(productos)); // Guardar cambios en el stock
        cargarProductos(productos); // Refrescar la vista de productos
        actualizarNumerito();
    } else {
        Toastify({
            text: "No hay suficiente stock",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #ff0000, #ff7373)",
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
    }
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

// Función de búsqueda
function buscarProductos() {
    const query = inputBusqueda.value.toLowerCase();
    const productosFiltrados = productos.filter(producto =>
        producto.titulo.toLowerCase().includes(query) ||
        producto.categoria.nombre.toLowerCase().includes(query)
    );
    cargarProductos(productosFiltrados);
}

// Evento de búsqueda al hacer clic en el botón
btnBuscar.addEventListener('click', buscarProductos);

// Búsqueda al presionar "Enter" en el campo de búsqueda
inputBusqueda.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarProductos();
    }
});
