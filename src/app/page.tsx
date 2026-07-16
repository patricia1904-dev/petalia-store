'use client'

import Link from 'next/link'
import { SITE_CONFIG }
  from '@/config/site'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Menu,
  Search,
  ShoppingBag,
} from 'lucide-react'

import { useCart }
  from '@/context/CartContext'

import CartSidebar
  from '@/components/CartSidebar'

import { supabase }
  from '@/lib/supabase'

type Producto = {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  talle: string
  categoria: string
  subcategoria: string
  tipo: string
  estado: string
  vendido: boolean
}

export default function HomePage() {

  const [
    carritoAbierto,
    setCarritoAbierto,
  ] = useState(false)

  const { carrito } = useCart()

  const [
    productos,
    setProductos,
  ] = useState<Producto[]>([])

  const [
    cargandoProductos,
    setCargandoProductos,
  ] = useState(true)

  const [
    errorProductos,
    setErrorProductos,
  ] = useState('')

  /*
    null significa que no hay una categoría
    seleccionada y se muestran todos los productos.
  */
  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState<string | null>(null)

  /*
    null significa que no hay una subcategoría
    seleccionada.
  */
  const [
    subcategoriaSeleccionada,
    setSubcategoriaSeleccionada,
  ] = useState<string | null>(null)

  async function cargarProductos() {

    setCargandoProductos(true)
    setErrorProductos('')

    const { data, error } =
      await supabase
        .from('productos')
        .select('*')
        .eq('vendido', false)
        .order(
          'categoria',
          { ascending: true }
        )
        .order(
          'subcategoria',
          { ascending: true }
        )
        .order(
          'tipo',
          { ascending: true }
        )
        .order(
          'id',
          { ascending: false }
        )

    if (error) {

      console.error(
        'Error al cargar productos:',
        error
      )

      setErrorProductos(
        'No pudimos cargar los productos. Revisá tu conexión e intentá nuevamente.'
      )

      setCargandoProductos(false)

      return
    }

    setProductos(
      (data as Producto[]) || []
    )

    setCargandoProductos(false)
  }
  
  useEffect(() => {

    cargarProductos()

  }, [])

  /*
    Categorías ordenadas según el orden
    que querés mostrar en la tienda.
  */
  const categorias = useMemo(() => {

    const ordenCategorias = [
      'Mujer',
      'Hombre',
      'Niños',
      'Libros',
    ]

    const categoriasExistentes =
      new Set(
        productos.map(
          (producto) =>
            producto.categoria
        )
      )

    return ordenCategorias.filter(
      (categoria) =>
        categoriasExistentes.has(
          categoria
        )
    )

  }, [productos])

  /*
    Crea una lista de subcategorías
    para cada categoría.

    Ejemplo:

    {
      Mujer: [
        'Vestidos',
        'Pantalones y Shorts',
        ...
      ],
      Hombre: [...]
    }
  */
  const subcategoriasPorCategoria =
    useMemo(() => {

      const resultado:
        Record<string, string[]> = {}

      categorias.forEach(
        (categoria) => {

          const subcategorias =
            productos
              .filter(
                (producto) =>
                  producto.categoria ===
                  categoria
              )
              .map(
                (producto) =>
                  producto.subcategoria
              )
              .filter(Boolean)

          resultado[categoria] = [
            ...new Set(subcategorias),
          ]
        }
      )

      return resultado

    }, [productos, categorias])

  /*
    Aplica los filtros seleccionados.
  */
  const productosFiltrados =
    useMemo(() => {

      return productos.filter(
        (producto) => {

          const categoriaCoincide =
            categoriaSeleccionada === null ||
            producto.categoria ===
              categoriaSeleccionada

          const subcategoriaCoincide =
            subcategoriaSeleccionada === null ||
            producto.subcategoria ===
              subcategoriaSeleccionada

          return (
            categoriaCoincide &&
            subcategoriaCoincide
          )
        }
      )

    }, [
      productos,
      categoriaSeleccionada,
      subcategoriaSeleccionada,
    ])

  /*
    Agrupa los productos para continuar
    mostrando los títulos de categoría
    y subcategoría en el catálogo.
  */
  const productosAgrupados =
    useMemo(() => {

      const agrupados:
        Record<
          string,
          Record<string, Producto[]>
        > = {}

      productosFiltrados.forEach(
        (producto) => {

          const categoria =
            producto.categoria ||
            'Otros'

          const subcategoria =
            producto.subcategoria ||
            'General'

          if (!agrupados[categoria]) {

            agrupados[categoria] = {}
          }

          if (
            !agrupados[categoria][
              subcategoria
            ]
          ) {

            agrupados[categoria][
              subcategoria
            ] = []
          }

          agrupados[categoria][
            subcategoria
          ].push(producto)
        }
      )

      return agrupados

    }, [productosFiltrados])

  /*
    Al pulsar una categoría:

    - selecciona esa categoría;
    - elimina cualquier subcategoría anterior;
    - muestra todos los productos de esa categoría.
  */
  function seleccionarCategoria(
    categoria: string
  ) {

    setCategoriaSeleccionada(
      categoria
    )

    setSubcategoriaSeleccionada(
      null
    )

    irAProductos()
  }

  /*
    Al pulsar una subcategoría:

    - selecciona su categoría;
    - selecciona la subcategoría;
    - muestra solamente esos productos.
  */
  function seleccionarSubcategoria(
    categoria: string,
    subcategoria: string
  ) {

    setCategoriaSeleccionada(
      categoria
    )

    setSubcategoriaSeleccionada(
      subcategoria
    )

    irAProductos()
  }

  /*
    Muestra nuevamente todos los productos.
    No existe un botón "Todos" en el panel:
    se usa desde "Nuevos" o el logo.
  */
  function mostrarTodos() {

    setCategoriaSeleccionada(null)
    setSubcategoriaSeleccionada(null)

    irAProductos()
  }

  function mostrarAccesorios() {

    setCategoriaSeleccionada(null)

    setSubcategoriaSeleccionada(
      'Accesorios'
    )

    irAProductos()
  }

  function irAProductos() {

    window.setTimeout(() => {

      document
        .getElementById('productos')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })

    }, 0)
  }

  /*
    Filtros reutilizables para PC y celular.
  */
  function PanelFiltros() {

    return (

      <div
        className="
          flex
          flex-col
          gap-4
        "
      >

        {categorias.map(
          (categoria) => {

            const categoriaActiva =
              categoriaSeleccionada ===
              categoria &&
              subcategoriaSeleccionada ===
              null

            return (

              <div
                key={categoria}
                className="
                  grid
                  grid-cols-[85px_1fr]
                  gap-3
                  border-b
                  border-gray-300
                  pb-4
                  last:border-b-0
                  last:pb-0
                "
              >

                {/* CATEGORÍA */}

                <button
                  type="button"
                  onClick={() =>
                    seleccionarCategoria(
                      categoria
                    )
                  }
                  className={`
                    h-fit
                    text-left
                    text-sm
                    font-bold
                    underline-offset-4
                    transition

                    ${
                      categoriaActiva

                        ? `
                          underline
                          text-black
                        `

                        : `
                          text-gray-800
                          hover:underline
                        `
                    }
                  `}
                >
                  {categoria}
                </button>

                {/* SUBCATEGORÍAS */}

                <div
                  className="
                    flex
                    flex-col
                    items-start
                    gap-1.5
                  "
                >

                  {
                    (
                      subcategoriasPorCategoria[
                        categoria
                      ] || []
                    ).map(
                      (subcategoria) => {

                        const subcategoriaActiva =
                          categoriaSeleccionada ===
                            categoria &&
                          subcategoriaSeleccionada ===
                            subcategoria

                        return (

                          <button
                            type="button"
                            key={subcategoria}
                            onClick={() =>
                              seleccionarSubcategoria(
                                categoria,
                                subcategoria
                              )
                            }
                            className={`
                              text-left
                              text-sm
                              leading-tight
                              underline-offset-4
                              transition

                              ${
                                subcategoriaActiva

                                  ? `
                                    font-bold
                                    underline
                                    text-black
                                  `

                                  : `
                                    text-gray-700
                                    hover:text-black
                                    hover:underline
                                  `
                              }
                            `}
                          >
                            {subcategoria}
                          </button>
                        )
                      }
                    )
                  }

                </div>

              </div>
            )
          }
        )}

      </div>
    )
  }

  return (

    <main
      className="
        min-h-screen
        bg-[#fafafa]
        overflow-x-hidden
      "
    >

      {/* BARRA SUPERIOR */}

      <div
        className="
          bg-black
          text-white
          text-xs
          md:text-sm
          py-2
          px-4
          flex
          justify-center
          gap-4
          md:gap-10
        "
      >

        <p>
          🚚 Envíos a todo el país
        </p>

        <p
          className="
            hidden
            sm:block
          "
        >
          ♻️ Moda circular
        </p>

        <p
          className="
            hidden
            md:block
          "
        >
          ✨ Prendas únicas
        </p>

      </div>

      {/* ENCABEZADO */}

      <header
        className="
          sticky
          top-0
          z-40
          bg-white
          border-b
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            md:px-6
            py-3
            flex
            items-center
            justify-between
          "
        >

          {/* LOGO */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <button
              type="button"
              className="md:hidden"
              aria-label="Abrir menú"
            >
              <Menu />
            </button>

            <button
              type="button"
              onClick={mostrarTodos}
              className="
                text-left
                text-xl
                md:text-3xl
                font-black
                tracking-tight
              "
            >
              {SITE_CONFIG.nombre}
            </button>

          </div>

          {/* MENÚ PC */}

          <nav
            className="
              hidden
              md:flex
              gap-8
              text-sm
              font-medium
            "
          >

            <button
              type="button"
              onClick={mostrarTodos}
              className="
                hover:text-gray-500
                transition
              "
            >
              NUEVOS
            </button>

            <button
              type="button"
              onClick={() =>
                seleccionarCategoria(
                  'Mujer'
                )
              }
              className="
                hover:text-gray-500
                transition
              "
            >
              MUJER
            </button>

            <button
              type="button"
              onClick={() =>
                seleccionarCategoria(
                  'Hombre'
                )
              }
              className="
                hover:text-gray-500
                transition
              "
            >
              HOMBRE
            </button>

            <button
              type="button"
              onClick={
                mostrarAccesorios
              }
              className="
                hover:text-gray-500
                transition
              "
            >
              ACCESORIOS
            </button>

          </nav>

          {/* ICONOS */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <button
              type="button"
              aria-label="Buscar"
            >
              <Search
                className="w-5 h-5"
              />
            </button>

            <button
              type="button"
              className="relative"
              onClick={() =>
                setCarritoAbierto(true)
              }
              aria-label="Abrir carrito"
            >

              <ShoppingBag
                className="w-5 h-5"
              />

              <span
                className="
                  absolute
                  -top-2
                  -right-2
                  bg-black
                  text-white
                  text-xs
                  rounded-full
                  w-5
                  h-5
                  flex
                  items-center
                  justify-center
                "
              >
                {carrito.length}
              </span>

            </button>

          </div>

        </div>

      </header>

      {/* IMAGEN PRINCIPAL */}

      <section
        className="
          relative
          h-[300px]
          md:h-[360px]
          lg:h-[390px]
          overflow-hidden
        "
      >

        <img
          src="
            https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1800
          "
          alt="Ropa de segunda mano"
          className="
            w-full
            h-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/40
          "
        />

        {/* TEXTO PRINCIPAL */}

        <div
          className="
            absolute
            inset-0
            z-10
            flex
            flex-col
            items-center
            justify-center
            text-white
            text-center
            px-5
            lg:pl-[310px]
          "
        >

          <p
            className="
              uppercase
              tracking-[5px]
              mb-3
              text-xs
              md:text-sm
            "
          >
            Moda Circular
          </p>

          <h2
            className="
              text-3xl
              md:text-5xl
              lg:text-6xl
              font-black
              max-w-4xl
              leading-tight
            "
          >
            Ropa de segunda mano
            con estilo único
          </h2>
          
        </div>

        {/* FILTROS SUPERPUESTOS EN PC */}

        <div
          className="
            absolute
            inset-0
            z-20
            hidden
            lg:block
            pointer-events-none
          "
        >

          <div
            className="
              max-w-[1500px]
              h-full
              mx-auto
              px-6
              flex
              items-start
              pt-8
            "
          >

            <aside
              className="
                pointer-events-auto
                w-[280px]
                max-h-[330px]
                overflow-y-auto
                bg-white/95
                backdrop-blur-md
                rounded-3xl
                p-5
                shadow-2xl
                border
                border-white/60
              "
            >

              <PanelFiltros />

            </aside>

          </div>

        </div>

      </section>

      {/* FILTROS EN CELULAR Y TABLET */}

      <section
        className="
          lg:hidden
          bg-white
          border-b
          px-4
          py-5
        "
      >

        <div
          className="
            max-w-2xl
            mx-auto
          "
        >

          <PanelFiltros />

        </div>

      </section>

      {/* PRODUCTOS */}

      <section
        id="productos"
        className="
          max-w-[1500px]
          mx-auto
          px-4
          md:px-6
          py-8
          scroll-mt-24
        "
      >

        {/* CARGANDO */}

        {cargandoProductos && (

          <div
            className="
              py-20
              text-center
            "
          >

            <div
              className="
                w-10
                h-10
                border-4
                border-gray-200
                border-t-black
                rounded-full
                animate-spin
                mx-auto
                mb-5
              "
            />

            <p
              className="
                text-lg
                font-semibold
              "
            >
              Cargando productos...
            </p>

            <p
              className="
                text-gray-500
                mt-1
              "
            >
              Estamos preparando el catálogo.
            </p>

          </div>

        )}

        {/* ERROR */}

        {
          !cargandoProductos &&
          errorProductos && (

            <div
              className="
                py-20
                text-center
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                No pudimos cargar el catálogo
              </h2>

              <p
                className="
                  mt-2
                  text-gray-500
                "
              >
                {errorProductos}
              </p>

              <button
                type="button"
                onClick={cargarProductos}
                className="
                  mt-6
                  bg-black
                  text-white
                  px-7
                  py-3
                  rounded-2xl
                  font-bold
                  hover:bg-gray-800
                  transition
                "
              >
                Reintentar
              </button>

            </div>

          )
        }

        {/* SIN PRODUCTOS */}

        {
          !cargandoProductos &&
          !errorProductos &&
          productosFiltrados.length === 0 && (

            <div
              className="
                py-20
                text-center
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                No encontramos productos
              </h2>

              <p
                className="
                  mt-2
                  text-gray-500
                "
              >
                Probá seleccionando otra sección.
              </p>

            </div>

          )
        }

        {categorias.map(
          (categoria) => {

            const grupos =
              productosAgrupados[
                categoria
              ]

            if (!grupos) {
              return null
            }

            return (

              <section
                key={categoria}
                className="mb-12"
              >

                {/* TÍTULO DE CATEGORÍA */}

                <div className="mb-6">

                  <h2
                    className="
                      text-3xl
                      font-black
                      mb-2
                    "
                  >
                    {categoria}
                  </h2>

                  <div
                    className="
                      w-20
                      h-1
                      bg-black
                      rounded-full
                    "
                  />

                </div>

                {Object.entries(
                  grupos
                ).map(
                  (
                    [
                      subcategoria,
                      productosSubcategoria,
                    ]
                  ) => (

                    <div
                      key={subcategoria}
                      className="mb-9"
                    >

                      {/* SUBCATEGORÍA */}

                      <h3
                        className="
                          text-2xl
                          font-bold
                          mb-5
                        "
                      >
                        {subcategoria}
                      </h3>

                      {/* GRILLA */}

                      <div
                        className="
                          grid
                          grid-cols-1
                          sm:grid-cols-2
                          lg:grid-cols-3
                          xl:grid-cols-4
                          2xl:grid-cols-5
                          gap-5
                        "
                      >

                        {
                          productosSubcategoria.map(
                            (producto) => (

                              <Link
                                href={
                                  `/producto/${producto.id}`
                                }
                                key={
                                  producto.id
                                }
                                className="
                                  group
                                  bg-white
                                  rounded-[30px]
                                  overflow-hidden
                                  shadow-sm
                                  hover:shadow-2xl
                                  transition-all
                                  duration-300
                                "
                              >

                                {/* IMAGEN */}

                                <div
                                  className="
                                    relative
                                    overflow-hidden
                                  "
                                >

                                  <img
                                    src={
                                      producto.imagen
                                    }
                                    alt={
                                      producto.nombre
                                    }
                                    className="
                                      w-full
                                      h-[320px]
                                      object-cover
                                      group-hover:scale-105
                                      transition
                                      duration-500
                                    "
                                  />

                                  <div
                                    className="
                                      absolute
                                      top-4
                                      left-4
                                      bg-white
                                      px-4
                                      py-2
                                      rounded-full
                                      text-xs
                                      font-bold
                                      shadow
                                    "
                                  >
                                    {
                                      producto.tipo
                                    }
                                  </div>

                                </div>

                                {/* INFORMACIÓN */}

                                <div
                                  className="
                                    p-4
                                    flex
                                    flex-col
                                    gap-2
                                  "
                                >

                                  <div
                                    className="
                                      flex
                                      items-start
                                      justify-between
                                      gap-4
                                    "
                                  >

                                    <div>

                                      <h3
                                        className="
                                          text-xl
                                          font-bold
                                        "
                                      >
                                        {
                                          producto.nombre
                                        }
                                      </h3>

                                      <p
                                        className="
                                          text-gray-500
                                          text-sm
                                          mt-1
                                        "
                                      >
                                        {
                                          producto.tipo
                                        }
                                      </p>

                                    </div>

                                    <span
                                      className="
                                        font-black
                                        text-lg
                                      "
                                    >
                                      $
                                      {
                                        producto.precio
                                      }
                                    </span>

                                  </div>

                                  <p
                                    className="
                                      text-gray-500
                                      text-sm
                                      leading-relaxed
                                      line-clamp-2
                                    "
                                  >
                                    {
                                      producto.descripcion
                                    }
                                  </p>

                                  <div
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      gap-2
                                      mt-2
                                    "
                                  >

                                    <span
                                      className="
                                        text-xs
                                        bg-gray-100
                                        px-3
                                        py-2
                                        rounded-full
                                      "
                                    >
                                      {
                                        producto.estado
                                      }
                                    </span>

                                    <span
                                      className="
                                        text-xs
                                        bg-gray-100
                                        px-3
                                        py-2
                                        rounded-full
                                      "
                                    >
                                      Talle{' '}
                                      {
                                        producto.talle
                                      }
                                    </span>

                                  </div>

                                  <div
                                    className="
                                      mt-3
                                      bg-black
                                      text-white
                                      py-3
                                      rounded-2xl
                                      hover:bg-gray-800
                                      transition
                                      font-semibold
                                      text-center
                                    "
                                  >
                                    Comprar
                                  </div>

                                </div>

                              </Link>
                            )
                          )
                        }

                      </div>

                    </div>
                  )
                )}

              </section>
            )
          }
        )}

      </section>

      <CartSidebar
        abierto={carritoAbierto}
        cerrar={() =>
          setCarritoAbierto(false)
        }
      />

    </main>
  )
}