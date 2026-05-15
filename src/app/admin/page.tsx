'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [productos, setProductos] =
    useState<any[]>([])

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [imagen, setImagen] = useState('')
  const [talle, setTalle] = useState('')
  const [categoria, setCategoria] = useState('')
  const [subcategoria, setSubcategoria] = useState('')
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [mostrarVendidos, setMostrarVendidos] = useState(false)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  const [editandoId, setEditandoId] =
    useState<number | null>(null)

  const [modalEliminar, setModalEliminar] =
    useState(false)

  const [productoEliminar, setProductoEliminar] =
    useState<any>(null)

  const [mensaje, setMensaje] = useState('')

  const categorias = {

    Mujer: {

      Vestidos: [
        'Fiesta',
        'Casual',
      ],

      'Camisas y Remeras': [
        'Blusa',
        'Camisa',
        'Remera',
        'Top',
      ],

      Pantalones: [
        'Jeans',
        'Cargo',
        'De vestir',
      ],

      Chaquetas: [
        'Abrigo',
        'Cazadora',
        'Chaqueta fina',
      ],

      Calzados: [
        'Botas',
        'Sandalias',
        'Zapatos',
        'Deportivos',
      ],

      Bolsos: [
        'Fiesta',
        'Casual',
      ],

      Accesorios: [
        'Pañuelos',
        'Cinturones',
        'Bijou',
      ],
    },

    Hombre: {
      
      Camisas: [
        'Formal',
        'Casual',
      ],

      Remeras: [
        'Oversize',
        'Casual',
      ],

      Pantalones: [
        'Jeans',
        'Jogger',
      ],

      Camperas: [
        'Cuero',
        'Denim',
      ],
    },
    Niños: {
      Nenas: [
        'Fiesta',
        'Casual',
      ],
       Varones: [
        'Fiesta',
        'Casual',
      ],
    },
    Libros: {
      Novela:[],
      Infantil:[],
    }
  }

  async function cargarProductos() {

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('vendido', mostrarVendidos)
      .order('categoria')
      .order('subcategoria')
      .order('tipo')

    if (error) {
      console.log(error)
      return
    }

    setProductos(data || [])
  }

  useEffect(() => {
    cargarProductos()
  }, [mostrarVendidos])

  function limpiarFormulario() {

    setNombre('')
    setDescripcion('')
    setPrecio('')
    setImagen('')
    setTalle('')
    setCategoria('')
    setSubcategoria('')
    setTipo('')
    setEstado('')

    setEditandoId(null)
  }

  async function guardarProducto() {

    if (
      !nombre ||
      !precio ||
      !imagen
    ) {
      setMensaje('Completa los campos obligatorios')

      setTimeout(() => {
        setMensaje('')
      }, 3000)

      return
    }

    if (editandoId) {

      const { error } = await supabase
        .from('productos')
        .update({
          nombre,
          descripcion,
          precio,
          imagen,
          talle,
          categoria,
          subcategoria,
          tipo,
          estado,
        })
        .eq('id', editandoId)

      if (error) {
        console.log(error)
        return
      }

      setMensaje('Producto actualizado correctamente')

    } else {

      const { error } = await supabase
        .from('productos')
        .insert({
          nombre,
          descripcion,
          precio,
          imagen,
          talle,
          categoria,
          subcategoria,
          tipo,
          estado,
        })

      if (error) {
        console.log(error)
        return
      }

      setMensaje('Producto agregado correctamente')
    }

    limpiarFormulario()

    cargarProductos()

    setTimeout(() => {
      setMensaje('')
    }, 3000)
  }

  function editarProducto(producto: any) {

    setEditandoId(producto.id)

    setNombre(producto.nombre)
    setDescripcion(producto.descripcion)
    setPrecio(producto.precio)
    setImagen(producto.imagen)
    setTalle(producto.talle)
    setCategoria(producto.categoria)
    setSubcategoria(producto.subcategoria)
    setTipo(producto.tipo)
    setEstado(producto.estado)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function abrirModalEliminar(producto: any) {

    setProductoEliminar(producto)

    setModalEliminar(true)
  }

  async function eliminarProducto() {

    if (!productoEliminar) return

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', productoEliminar.id)

    if (error) {
      console.log(error)
      return
    }

    setMensaje('Producto eliminado correctamente')

    setModalEliminar(false)

    setProductoEliminar(null)

    cargarProductos()

    setTimeout(() => {
      setMensaje('')
    }, 3000)
  }

  const productosFiltrados =
    productos.filter((producto) => {

      const categoriaOk =

        categoriaFiltro === 'Todas'

          ? true

          : producto.categoria ===
            categoriaFiltro

      const subcategoriaOk =

        subcategoriaFiltro === 'Todas'

          ? true

          : producto.subcategoria ===
            subcategoriaFiltro

      const busquedaOk =

        producto.nombre
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )

      return (
        categoriaOk &&
        subcategoriaOk &&
        busquedaOk
      )
    })

  return (

    <main className="min-h-screen bg-[#fafafa] p-6">

      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* TITULO */}

        <div>

          <h1 className="text-5xl font-black mb-3">
            Panel Admin
          </h1>

          <p className="text-gray-500">
            Gestiona productos de tu tienda.
          </p>

        </div>

        {/* MENSAJE */}

        {
          mensaje && (

            <div
              className="
                bg-black
                text-white
                px-6
                py-4
                rounded-2xl
                font-medium
              "
            >
              {mensaje}
            </div>
          )
        }

        {/* FORMULARIO */}

        <section
          className="
            bg-white
            rounded-[30px]
            p-8
            shadow-sm
            flex
            flex-col
            gap-5
          "
        >

          <h2 className="text-3xl font-black">
            {
              editandoId
                ? 'Editar producto'
                : 'Nuevo producto'
            }
          </h2>

          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            className="border p-4 rounded-2xl"
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            className="border p-4 rounded-2xl min-h-[120px]"
          />

          <input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) =>
              setPrecio(e.target.value)
            }
            className="border p-4 rounded-2xl"
          />

          <input
            type="text"
            placeholder="URL imagen"
            value={imagen}
            onChange={(e) =>
              setImagen(e.target.value)
            }
            className="border p-4 rounded-2xl"
          />

          <input
            type="text"
            placeholder="Talle"
            value={talle}
            onChange={(e) =>
              setTalle(e.target.value)
            }
            className="border p-4 rounded-2xl"
          />

          {/* CATEGORIA */}

          <select
            value={categoria}
            onChange={(e) => {

              setCategoria(e.target.value)

              setSubcategoria('')

              setTipo('')
            }}
            className="border p-4 rounded-2xl"
          >

            <option value="">
              Seleccionar categoría
            </option>

            {
              Object.keys(categorias).map(
                (cat) => (

                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                )
              )
            }

          </select>

          {/* SUBCATEGORIA */}

          <select
            value={subcategoria}
            onChange={(e) => {

              setSubcategoria(e.target.value)

              setTipo('')
            }}
            className="border p-4 rounded-2xl"
          >

            <option value="">
              Seleccionar subcategoría
            </option>

            {
              categoria &&

              Object.keys(
                categorias[
                  categoria as keyof typeof categorias
                ]
              ).map((sub) => (

                <option
                  key={sub}
                  value={sub}
                >
                  {sub}
                </option>
              ))
            }

          </select>

          {/* TIPO */}

          <select
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value)
            }
            className="border p-4 rounded-2xl"
          >

            <option value="">
              Seleccionar tipo
            </option>

            {
              categoria &&
              subcategoria &&
              (
                categorias[
                  categoria as keyof typeof categorias
                ][
                  subcategoria as keyof typeof categorias[
                    keyof typeof categorias
                  ]
                ] as string[]
              ).map((item:string) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))
            }

          </select>

          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value)
            }
            className="border p-4 rounded-2xl"
          >

            <option value="">
              Seleccionar estado
            </option>

            <option value="Nuevo con etiqueta">
              Nuevo con etiqueta
            </option>

            <option value="Excelente estado">
              Excelente estado
            </option>

            <option value="Muy buen estado">
              Muy buen estado
            </option>

            <option value="Buen estado">
              Buen estado
            </option>

          </select>

          {/* BOTONES */}

          <div className="flex gap-4">

            <button
              onClick={guardarProducto}
              className="
                bg-black
                text-white
                px-8
                py-4
                rounded-2xl
                font-bold
                hover:bg-gray-800
                transition
              "
            >
              {
                editandoId
                  ? 'Guardar cambios'
                  : 'Guardar producto'
              }
            </button>

            {
              editandoId && (

                <button
                  onClick={limpiarFormulario}
                  className="
                    border
                    px-8
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Cancelar edición
                </button>
              )
            }

          </div>

        </section>

        {/* PRODUCTOS */}

        <section>
          
            {/* TABS */}

          <div className="flex gap-4 mb-8">

            <button
              onClick={() =>
                setMostrarVendidos(false)
              }
              className={`
                px-6 py-3 rounded-full border
                ${!mostrarVendidos
                  ? 'bg-black text-white'
                  : 'bg-white'}
              `}
            >
              Activos
            </button>

            <button
              onClick={() =>
                setMostrarVendidos(true)
              }
              className={`
                px-6 py-3 rounded-full border
                ${mostrarVendidos
                  ? 'bg-black text-white'
                  : 'bg-white'}
              `}
            >
              Vendidos
            </button>

          </div>

          {/* FILTRO CATEGORIA */}
          <select
            value={categoriaFiltro}
            onChange={(e) =>
              setCategoriaFiltro(e.target.value)
            }
            className="
              border
              rounded-xl
              px-4
              py-3
            "
          >

            <option value="Todas">
              Todas
            </option>

            {
              [
                ...new Set(
                  productos.map(
                    (p) => p.categoria
                  )
                ),
              ].map((categoria) => (

                <option
                  key={categoria}
                  value={categoria}
                >
                  {categoria}
                </option>
              ))
            }

          </select>

          {/* FILTRO SUBCATEGORIA */}
          <select
            value={subcategoriaFiltro}
            onChange={(e) =>
              setSubcategoriaFiltro(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              px-4
              py-3
              mb-6
              ml-4
            "
          >

            <option value="Todas">
              Todas
            </option>

            {
              categoriaFiltro !== 'Todas' &&

              Object.keys(
                categorias[
                  categoriaFiltro as keyof typeof categorias
                ]
              ).map((sub) => (

                <option
                  key={sub}
                  value={sub}
                >
                  {sub}
                </option>
              ))
            }

          </select>

          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            className="
              border
              rounded-xl
              px-4
              py-3
              w-full
              max-w-md
            "
          />

          {/* GRID */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

            {
              productosFiltrados.map((producto) => (

                <article
                  key={producto.id}
                  className="
                    bg-white
                    rounded-[30px]
                    overflow-hidden
                    shadow-sm
                  "
                >

                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-[320px] object-cover"
                  />

                  <div className="p-6 flex flex-col gap-4">

                    <div className="flex justify-between gap-4">

                      <div>

                        <h3 className="text-2xl font-bold">
                          {producto.nombre}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          {producto.subcategoria}
                        </p>

                      </div>

                      <span className="font-black text-xl">
                        ${producto.precio}
                      </span>

                    </div>

                    <p className="text-gray-500 text-sm">
                      {producto.descripcion}
                    </p>

                    <div className="flex gap-3 flex-wrap">

                      <span className="bg-gray-100 px-3 py-2 rounded-full text-xs">
                        {producto.categoria}
                      </span>

                      <span className="bg-gray-100 px-3 py-2 rounded-full text-xs">
                        {producto.tipo}
                      </span>

                      <span className="bg-gray-100 px-3 py-2 rounded-full text-xs">
                        Talle {producto.talle}
                      </span>

                    </div>

                    <div className="flex gap-3 mt-3">

                      <button
                        onClick={() =>
                          editarProducto(producto)
                        }
                        className="
                          flex-1
                          bg-black
                          text-white
                          py-3
                          rounded-2xl
                          font-semibold
                        "
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          abrirModalEliminar(producto)
                        }
                        className="
                          flex-1
                          border
                          py-3
                          rounded-2xl
                          font-semibold
                        "
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                </article>
              ))
            }

          </div>

        </section>

      </div>

      {/* MODAL ELIMINAR */}

      {
        modalEliminar && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              flex
              items-center
              justify-center
              z-50
              p-6
            "
          >

            <div
              className="
                bg-white
                rounded-[30px]
                p-8
                max-w-md
                w-full
                flex
                flex-col
                gap-6
              "
            >

              <div>

                <h2 className="text-3xl font-black mb-3">
                  Eliminar producto
                </h2>

                <p className="text-gray-500 leading-relaxed">
                  ¿Seguro que deseas eliminar:
                  <strong>
                    {' '}
                    {productoEliminar?.nombre}
                  </strong>
                  ?
                </p>

              </div>

              <div className="flex gap-4">

                <button
                  onClick={eliminarProducto}
                  className="
                    flex-1
                    bg-black
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Sí, eliminar
                </button>

                <button
                  onClick={() =>
                    setModalEliminar(false)
                  }
                  className="
                    flex-1
                    border
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Cancelar
                </button>

              </div>

            </div>

          </div>
        )
      }

    </main>
  )
}