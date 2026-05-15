'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/context/CartContext'
import CartSidebar from '@/components/CartSidebar'

import {
  Search,
  ShoppingBag,
  Menu,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [carritoAbierto,
  setCarritoAbierto] =
  useState(false)

  const { carrito } = useCart()
  const [productos, setProductos] =
    useState<any[]>([])

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState('Todos')

  const [
    subcategoriaSeleccionada,
    setSubcategoriaSeleccionada,
  ] = useState('Todos')

  async function cargarProductos() {

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('vendido', false)
      .order('categoria')
      .order('subcategoria')
      .order('tipo')
      .order('id', { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setProductos(data || [])
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const categorias = useMemo(() => {

    const ordenCategorias = [
      'Mujer',
      'Hombre',
      'Niños',
      'Libros',
    ]

    const categoriasExistentes = [
      ...new Set(
        productos.map((p) => p.categoria)
      ),
    ]

    const categoriasOrdenadas =
      ordenCategorias.filter((categoria) =>
        categoriasExistentes.includes(
          categoria
        )
      )

    return [
      'Todos',
      ...categoriasOrdenadas,
    ]

  }, [productos])

  const subcategorias = useMemo(() => {

    if (
      categoriaSeleccionada === 'Todos'
    ) {
      return ['Todos']
    }

    const filtrados = productos.filter(
      (p) =>
        p.categoria ===
        categoriaSeleccionada
    )

    return [

      'Todos',

      ...new Set(
        filtrados.map(
          (p) => p.subcategoria
        )
      ),
    ]

  }, [
    productos,
    categoriaSeleccionada,
  ])

  const productosFiltrados = useMemo(() => {

    return productos.filter(
      (producto) => {

        const categoriaOk =

          categoriaSeleccionada ===
            'Todos'

            ? true

            : producto.categoria ===
            categoriaSeleccionada

        const subcategoriaOk =

          subcategoriaSeleccionada ===
            'Todos'

            ? true

            : producto.subcategoria ===
            subcategoriaSeleccionada

        return (
          categoriaOk &&
          subcategoriaOk
        )
      }
    )

  }, [

    productos,

    categoriaSeleccionada,

    subcategoriaSeleccionada,
  ])
  const productosAgrupados = useMemo(() => {

    const agrupados: any = {}

    productosFiltrados.forEach((producto) => {

      const categoria =
        producto.categoria || 'Otros'

      const subcategoria =
        producto.subcategoria || 'General'

      if (!agrupados[categoria]) {

        agrupados[categoria] = {}
      }

      if (
        !agrupados[categoria][subcategoria]
      ) {

        agrupados[categoria][subcategoria] = []
      }

      agrupados[categoria][subcategoria]
        .push(producto)
    })

    return agrupados

  }, [productosFiltrados])
  return (

    <main className="min-h-screen bg-[#fafafa]">

      {/* TOP BAR */}

      <div
        className="
          bg-black
          text-white
          text-sm
          py-3
          px-6
          flex
          justify-center
          gap-10
        "
      >

        <p>
          🚚 Envíos a todo el país
        </p>

        <p>
          ♻️ Moda circular
        </p>

        <p>
          ✨ Prendas únicas
        </p>

      </div>

      {/* HEADER */}

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
            px-6
            py-5
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
              gap-4
            "
          >

            <button className="md:hidden">
              <Menu />
            </button>

            <h1
              className="
                text-3xl
                font-black
                tracking-tight
              "
            >
              Petalia Second Hand
            </h1>

          </div>

          {/* MENU */}

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
              className="
                hover:text-gray-500
                transition
              "
            >
              NUEVOS
            </button>

            <button
              className="
                hover:text-gray-500
                transition
              "
            >
              MUJER
            </button>

            <button
              className="
                hover:text-gray-500
                transition
              "
            >
              HOMBRE
            </button>

            <button
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
              gap-5
            "
          >

            <button>
              <Search className="w-5 h-5" />
            </button>

            <button
              className="relative"
              onClick={() =>
                setCarritoAbierto(true)
              }
            >

              <ShoppingBag className="w-5 h-5" />

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

      {/* HERO */}

      <section
        className="
          relative
          h-[550px]
          overflow-hidden
        "
      >

        <img
          src="
https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1800
"
          alt="Fashion"
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

        <div
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            text-white
            text-center
            px-6
          "
        >

          <p
            className="
            uppercase
            tracking-[8px]
            mb-6
            text-sm
          "
          >
            Moda Circular
          </p>

          <h2
            className="
              text-5xl
              md:text-7xl
              font-black
              max-w-5xl
              leading-tight
            "
          >
            Ropa de segunda mano
            con estilo único
          </h2>

          <button
            className="
              mt-10
              bg-white
              text-black
              px-10
              py-4
              rounded-full
              font-bold
              hover:scale-105
              transition
            "
          >
            Comprar ahora
          </button>

        </div>

      </section>
      {/* FILTROS */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-6
          py-14
          flex
          gap-12
        "
      >

        <div
          className="
            w-[260px]
            shrink-0
            sticky
            top-28
            h-fit
            flex
            flex-col
            gap-8
          "
        >

          {/* TITULO */}

          <div>

            <h3
              className="
          text-4xl
          font-black
          mb-3
        "
            >
              Categorías
            </h3>

            <p className="text-gray-500">
              Descubrí prendas únicas
              seleccionadas especialmente.
            </p>

          </div>

          {/* CATEGORIAS */}

          <div
            className="
              flex
              flex-wrap
              gap-4
            "
          >

            {
              categorias.map((categoria) => (

                <button
                  key={categoria}

                  onClick={() => {

                    setCategoriaSeleccionada(
                      categoria
                    )

                    setSubcategoriaSeleccionada(
                      'Todos'
                    )
                  }}

                  className={`
              
                    px-6
                    py-3
                    rounded-full
                    border
                    transition-all

                      ${categoriaSeleccionada ===
                      categoria

                      ? `
                      bg-black
                      text-white
                      border-black
                      `

                      : `
                      bg-white
                      hover:bg-gray-100
                      `
                    }
            `}
                >

                  {categoria}

                </button>
              ))
            }

          </div>

          {/* SUBCATEGORIAS */}

          {
            categoriaSeleccionada !==
            'Todos' && (

              <div
                className="
                  flex
                  flex-wrap
                  gap-3
                "
              >

                {
                  subcategorias.map(
                    (subcategoria) => (

                      <button
                        key={subcategoria}

                        onClick={() =>
                          setSubcategoriaSeleccionada(
                            subcategoria
                          )
                        }

                        className={`
                          px-5
                          py-2
                          rounded-full
                          text-sm
                          transition-all

                    ${subcategoriaSeleccionada ===
                            subcategoria

                            ? `
                            bg-black
                            text-white
                          `

                            : `
                            bg-white
                            border
                            hover:bg-gray-100
                          `
                          }
                  `}
                      >

                        {subcategoria}

                      </button>
                    )
                  )
                }

              </div>
            )
          }

        </div>


        {/* PRODUCTOS */}

        <div className="flex-1">

          {
            categorias
              .filter((categoria) => categoria !== 'Todos')
              .map((categoria) => {

                const subcategorias =
                  productosAgrupados[categoria]

                if (!subcategorias) return null

                return (

                  <section
                    key={categoria}
                    className="mb-20"
                  >

                    {/* TITULO CATEGORIA */}

                    <div className="mb-10">

                      <h2
                        className="
                          text-5xl
                          font-black
                          mb-3
                        "
                      >
                        {categoria}
                      </h2>

                      <div
                        className="
                          w-32
                          h-1
                          bg-black
                          rounded-full
                        "
                      />

                    </div>

                    {
                      Object.entries(
                        subcategorias as any
                      ).map(

                        ([subcategoria, productos]) => (

                          <div
                            key={subcategoria}
                            className="mb-14"
                          >

                            {/* SUBCATEGORIA */}

                            <h3
                              className="
                                text-3xl
                                font-bold
                                mb-8
                              "
                            >
                              {subcategoria}
                            </h3>

                            {/* GRID */}
                            <div
                              className="
                                grid
                                grid-cols-1
                                  sm:grid-cols-2
                                  lg:grid-cols-3
                                  xl:grid-cols-4
                                  gap-8
                              "
                            >

                              {
                                (
                                  productos as any[]
                                ).map((producto) => (

                                  <Link
                                    href={`/producto/${producto.id}`}
                                    key={producto.id}
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
                                        src={producto.imagen}

                                        alt={producto.nombre}

                                        className="
                                          w-full
                                          h-[420px]
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

                                        {producto.tipo}

                                      </div>

                                    </div>

                                    {/* INFO */}

                                    <div
                                      className="
                                        p-6
                                        flex
                                        flex-col
                                        gap-3
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
                                            {producto.nombre}
                                          </h3>

                                          <p
                                            className="
                                              text-gray-500
                                              text-sm
                                              mt-1
                                            "
                                          >
                                            {producto.tipo}
                                          </p>

                                        </div>

                                        <span
                                          className="
                                            font-black
                                            text-lg
                                          "
                                        >
                                          ${producto.precio}
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
                                        {producto.descripcion}
                                      </p>

                                      <div
                                        className="
                                          flex
                                          items-center
                                          justify-between
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
                                          {producto.estado}
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
                                          Talle {producto.talle}
                                        </span>

                                      </div>

                                      <button
                                        className="
                                        mt-4
                                        bg-black
                                        text-white
                                        py-4
                                        rounded-2xl
                                        hover:bg-gray-800
                                        transition
                                        font-semibold
                                      "
                                      >
                                        Comprar
                                      </button>

                                    </div>

                                  </Link>
                                ))
                              }

                            </div>

                          </div>

                        ))
                    }

                  </section>
                )
              })
          }
        </div>
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