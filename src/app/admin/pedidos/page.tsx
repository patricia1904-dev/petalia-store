'use client'

import Link from 'next/link'

import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '@/lib/supabase'

import {
  SITE_CONFIG,
} from '@/config/site'

type ProductoPedido = {
  id: number
  nombre: string
  precio: number
  imagen: string
  tipo?: string
  talle?: string
  categoria?: string
  subcategoria?: string
}

type Pedido = {
  id: number
  nombre: string
  email: string
  telefono: string
  direccion: string | null
  ciudad: string | null
  departamento: string | null
  total: number
  productos: ProductoPedido[] | null
  created_at: string
  estado: string
  metodo_envio: string | null
  metodo_pago: string | null
  notas: string | null
}

const [
  estadoPendienteTransferencia,
  estadoPendientePago,
  estadoPagado,
  estadoPreparando,
  estadoEnviado,
  estadoEntregado,
  estadoCancelado,
] = SITE_CONFIG.estadosPedido

export default function AdminPedidosPage() {

  const [
    pedidos,
    setPedidos,
  ] = useState<Pedido[]>([])

  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState('Todos')

  const [
    cargando,
    setCargando,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    mensaje,
    setMensaje,
  ] = useState('')

  async function cargarPedidos() {

    setCargando(true)
    setError('')

    const {
      data,
      error: errorPedidos,
    } = await supabase
      .from('pedidos')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false,
        }
      )

    if (errorPedidos) {

      console.error(
        'ERROR AL CARGAR PEDIDOS:',
        errorPedidos
      )

      setError(
        'No se pudieron cargar los pedidos.'
      )

      setCargando(false)

      return
    }

    setPedidos(
      (data as Pedido[]) || []
    )

    setCargando(false)
  }

  useEffect(() => {

    cargarPedidos()

  }, [])

  async function actualizarEstado(
    id: number,
    nuevoEstado: string
  ) {

    const estadoAnterior =
      pedidos.find(
        (pedido) =>
          pedido.id === id
      )?.estado

    /*
      Actualizamos primero la pantalla para
      que el cambio se vea inmediatamente.
    */
    setPedidos(
      (pedidosActuales) =>
        pedidosActuales.map(
          (pedido) =>
            pedido.id === id
              ? {
                  ...pedido,
                  estado: nuevoEstado,
                }
              : pedido
        )
    )

    const { error: errorActualizar } =
      await supabase
        .from('pedidos')
        .update({
          estado: nuevoEstado,
        })
        .eq('id', id)

    if (errorActualizar) {

      console.error(
        'ERROR AL ACTUALIZAR PEDIDO:',
        errorActualizar
      )

      /*
        Si falla Supabase, recuperamos
        el estado anterior.
      */
      setPedidos(
        (pedidosActuales) =>
          pedidosActuales.map(
            (pedido) =>
              pedido.id === id
                ? {
                    ...pedido,
                    estado:
                      estadoAnterior ||
                      pedido.estado,
                  }
                : pedido
          )
      )

      setError(
        'No se pudo actualizar el estado del pedido.'
      )

      return
    }

    setMensaje(
      `Pedido N.º ${id} actualizado a “${nuevoEstado}”.`
    )

    window.setTimeout(() => {

      setMensaje('')

    }, 3000)
  }

  function obtenerClasesEstado(
    estado: string
  ) {

    if (
      estado ===
      estadoPendienteTransferencia
    ) {

      return `
        bg-yellow-100
        text-yellow-800
      `
    }

    if (
      estado ===
      estadoPendientePago
    ) {

      return `
        bg-orange-100
        text-orange-800
      `
    }

    if (estado === estadoPagado) {

      return `
        bg-blue-100
        text-blue-800
      `
    }

    if (estado === estadoPreparando) {

      return `
        bg-cyan-100
        text-cyan-800
      `
    }

    if (estado === estadoEnviado) {

      return `
        bg-purple-100
        text-purple-800
      `
    }

    if (estado === estadoEntregado) {

      return `
        bg-green-100
        text-green-800
      `
    }

    if (estado === estadoCancelado) {

      return `
        bg-red-100
        text-red-800
      `
    }

    return `
      bg-gray-100
      text-gray-800
    `
  }

  function formatearFecha(
    fecha: string
  ) {

    return new Intl.DateTimeFormat(
      'es-UY',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    ).format(
      new Date(fecha)
    )
  }

  const pedidosFiltrados =
    pedidos.filter(
      (pedido) => {

        if (
          estadoFiltro === 'Todos'
        ) {

          return true
        }

        return (
          pedido.estado ===
          estadoFiltro
        )
      }
    )

  const cantidadPendientes =
    pedidos.filter(
      (pedido) =>
        pedido.estado ===
          estadoPendienteTransferencia ||
        pedido.estado ===
          estadoPendientePago
    ).length

  const cantidadPagados =
    pedidos.filter(
      (pedido) =>
        pedido.estado ===
        estadoPagado
    ).length

  return (

    <main
      className="
        min-h-screen
        bg-[#fafafa]
        px-4
        py-6
        md:p-6
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          flex
          flex-col
          gap-10
        "
      >

        {/* ENCABEZADO */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-sm
                uppercase
                tracking-[3px]
                text-gray-500
                mb-2
              "
            >
              {SITE_CONFIG.nombre}
            </p>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-black
                mb-3
              "
            >
              Pedidos
            </h1>

            <p className="text-gray-500">
              Gestión de pedidos realizados.
            </p>

          </div>

          <nav
            className="
              flex
              flex-col
              sm:flex-row
              gap-3
            "
          >

            <Link
              href="/admin"
              className="
                border
                border-black
                text-black
                px-6
                py-3
                rounded-2xl
                font-bold
                text-center
                hover:bg-gray-100
                transition
              "
            >
              Productos
            </Link>

            <Link
              href="/admin/pedidos"
              className="
                bg-black
                text-white
                px-6
                py-3
                rounded-2xl
                font-bold
                text-center
                hover:bg-gray-800
                transition
              "
            >
              Pedidos
            </Link>

            <Link
              href="/"
              className="
                border
                border-gray-300
                text-gray-700
                px-6
                py-3
                rounded-2xl
                font-bold
                text-center
                hover:bg-white
                transition
              "
            >
              Ver tienda
            </Link>

          </nav>

        </div>

        {/* RESUMEN GENERAL */}

        <div
          className="
            grid
            sm:grid-cols-3
            gap-4
          "
        >

          <div
            className="
              bg-white
              border
              rounded-3xl
              p-6
            "
          >

            <p className="text-gray-500">
              Total de pedidos
            </p>

            <p
              className="
                text-4xl
                font-black
                mt-2
              "
            >
              {pedidos.length}
            </p>

          </div>

          <div
            className="
              bg-white
              border
              rounded-3xl
              p-6
            "
          >

            <p className="text-gray-500">
              Pendientes de pago
            </p>

            <p
              className="
                text-4xl
                font-black
                mt-2
              "
            >
              {cantidadPendientes}
            </p>

          </div>

          <div
            className="
              bg-white
              border
              rounded-3xl
              p-6
            "
          >

            <p className="text-gray-500">
              Pagados
            </p>

            <p
              className="
                text-4xl
                font-black
                mt-2
              "
            >
              {cantidadPagados}
            </p>

          </div>

        </div>

        {/* MENSAJES */}

        {mensaje && (

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

        )}

        {error && (

          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-700
              px-6
              py-4
              rounded-2xl
            "
          >
            {error}
          </div>

        )}

        {/* FILTROS */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            gap-4
          "
        >

          <select
            value={estadoFiltro}
            onChange={(evento) =>
              setEstadoFiltro(
                evento.target.value
              )
            }
            className="
              border
              rounded-2xl
              px-5
              py-3
              bg-white
              w-full
              sm:w-auto
            "
          >

            <option value="Todos">
              Todos los estados
            </option>

            {SITE_CONFIG.estadosPedido.map(
              (estado) => (

                <option
                  key={estado}
                  value={estado}
                >
                  {estado}
                </option>

              )
            )}

          </select>

          <button
            type="button"
            onClick={cargarPedidos}
            className="
              border
              border-black
              px-5
              py-3
              rounded-2xl
              font-bold
              hover:bg-gray-100
              transition
            "
          >
            Actualizar
          </button>

          <p
            className="
              text-sm
              text-gray-500
              sm:ml-auto
            "
          >
            Mostrando{' '}
            {pedidosFiltrados.length}{' '}
            pedido(s)
          </p>

        </div>

        {/* CARGANDO */}

        {cargando && (

          <div
            className="
              bg-white
              border
              rounded-3xl
              p-10
              text-center
              text-gray-500
            "
          >
            Cargando pedidos...
          </div>

        )}

        {/* SIN PEDIDOS */}

        {!cargando &&
          pedidosFiltrados.length === 0 && (

          <div
            className="
              bg-white
              border
              rounded-3xl
              p-10
              text-center
            "
          >

            <h2
              className="
                text-2xl
                font-black
              "
            >
              No hay pedidos
            </h2>

            <p
              className="
                text-gray-500
                mt-2
              "
            >
              No existen pedidos con el
              estado seleccionado.
            </p>

          </div>

        )}

        {/* LISTADO */}

        {!cargando && (

          <div
            className="
              flex
              flex-col
              gap-8
            "
          >

            {pedidosFiltrados.map(
              (pedido) => (

                <article
                  key={pedido.id}
                  className="
                    bg-white
                    rounded-[30px]
                    p-5
                    md:p-8
                    shadow-sm
                    border
                    border-gray-100
                  "
                >

                  {/* CABECERA DEL PEDIDO */}

                  <div
                    className="
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-start
                      lg:justify-between
                      gap-6
                      mb-8
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mb-2
                        "
                      >
                        Pedido N.º {pedido.id}
                      </p>

                      <h2
                        className="
                          text-2xl
                          md:text-3xl
                          font-black
                        "
                      >
                        {pedido.nombre}
                      </h2>

                      <p
                        className="
                          text-gray-500
                          mt-2
                          break-all
                        "
                      >
                        {pedido.email}
                      </p>

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mt-2
                        "
                      >
                        {formatearFecha(
                          pedido.created_at
                        )}
                      </p>

                    </div>

                    <div
                      className="
                        flex
                        flex-col
                        items-start
                        lg:items-end
                        gap-3
                      "
                    >

                      <select
                        value={pedido.estado}
                        onChange={(evento) =>
                          actualizarEstado(
                            pedido.id,
                            evento.target.value
                          )
                        }
                        className={`
                          max-w-full
                          px-4
                          py-2.5
                          rounded-2xl
                          text-sm
                          font-bold
                          border-0
                          cursor-pointer
                          ${obtenerClasesEstado(
                            pedido.estado
                          )}
                        `}
                      >

                        {/*
                          Si existe algún pedido antiguo
                          con un estado diferente, lo
                          mostramos para no romper el select.
                        */}

                        {!SITE_CONFIG.estadosPedido.some(
                          (estado) =>
                            estado === pedido.estado
                        ) && (

                          <option
                            value={pedido.estado}
                          >
                            {pedido.estado}
                          </option>

                        )}

                        {SITE_CONFIG.estadosPedido.map(
                          (estado) => (

                            <option
                              key={estado}
                              value={estado}
                            >
                              {estado}
                            </option>

                          )
                        )}

                      </select>

                      <p
                        className="
                          text-3xl
                          md:text-4xl
                          font-black
                        "
                      >
                        {SITE_CONFIG.empresa.simboloMoneda}
                        {pedido.total}
                      </p>

                    </div>

                  </div>

                  {/* PAGO Y ENTREGA */}

                  <div
                    className="
                      grid
                      sm:grid-cols-2
                      lg:grid-cols-4
                      gap-5
                      mb-8
                    "
                  >

                    <div
                      className="
                        bg-gray-50
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mb-2
                        "
                      >
                        Método de pago
                      </p>

                      <p className="font-bold">
                        {
                          pedido.metodo_pago ||
                          'No especificado'
                        }
                      </p>

                    </div>

                    <div
                      className="
                        bg-gray-50
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mb-2
                        "
                      >
                        Método de entrega
                      </p>

                      <p className="font-bold">
                        {
                          pedido.metodo_envio ||
                          'No especificado'
                        }
                      </p>

                    </div>

                    <div
                      className="
                        bg-gray-50
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mb-2
                        "
                      >
                        Teléfono
                      </p>

                      <p
                        className="
                          font-bold
                          break-all
                        "
                      >
                        {pedido.telefono}
                      </p>

                    </div>

                    <div
                      className="
                        bg-gray-50
                        rounded-2xl
                        p-4
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                          mb-2
                        "
                      >
                        Estado
                      </p>

                      <p className="font-bold">
                        {pedido.estado}
                      </p>

                    </div>

                  </div>

                  {/* DATOS DE ENTREGA */}

                  <div
                    className="
                      border-t
                      pt-7
                      mb-8
                    "
                  >

                    <h3
                      className="
                        text-xl
                        font-black
                        mb-5
                      "
                    >
                      Datos de entrega
                    </h3>

                    <div
                      className="
                        grid
                        md:grid-cols-3
                        gap-6
                      "
                    >

                      <div>

                        <p
                          className="
                            text-sm
                            text-gray-500
                            mb-2
                          "
                        >
                          Dirección
                        </p>

                        <p className="font-semibold">
                          {
                            pedido.direccion ||
                            'No corresponde'
                          }
                        </p>

                      </div>

                      <div>

                        <p
                          className="
                            text-sm
                            text-gray-500
                            mb-2
                          "
                        >
                          Ciudad o localidad
                        </p>

                        <p className="font-semibold">
                          {
                            pedido.ciudad ||
                            'No corresponde'
                          }
                        </p>

                      </div>

                      <div>

                        <p
                          className="
                            text-sm
                            text-gray-500
                            mb-2
                          "
                        >
                          Departamento
                        </p>

                        <p className="font-semibold">
                          {
                            pedido.departamento ||
                            'No corresponde'
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* NOTAS */}

                  {pedido.notas && (

                    <div
                      className="
                        bg-yellow-50
                        border
                        border-yellow-100
                        rounded-2xl
                        p-5
                        mb-8
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-yellow-800
                          font-bold
                          mb-2
                        "
                      >
                        Notas del comprador
                      </p>

                      <p
                        className="
                          text-gray-700
                          whitespace-pre-wrap
                        "
                      >
                        {pedido.notas}
                      </p>

                    </div>

                  )}

                  {/* PRODUCTOS */}

                  <div
                    className="
                      border-t
                      pt-7
                    "
                  >

                    <h3
                      className="
                        text-2xl
                        font-black
                        mb-6
                      "
                    >
                      Productos
                    </h3>

                    {!pedido.productos ||
                      pedido.productos.length === 0 ? (

                      <p className="text-gray-500">
                        Este pedido no tiene productos
                        registrados.
                      </p>

                    ) : (

                      <div
                        className="
                          grid
                          gap-4
                        "
                      >

                        {pedido.productos.map(
                          (producto) => (

                            <div
                              key={producto.id}
                              className="
                                border
                                rounded-2xl
                                p-4
                                flex
                                items-center
                                gap-4
                              "
                            >

                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="
                                  w-16
                                  h-16
                                  md:w-20
                                  md:h-20
                                  object-cover
                                  rounded-xl
                                  shrink-0
                                "
                              />

                              <div
                                className="
                                  flex-1
                                  min-w-0
                                "
                              >

                                <h4
                                  className="
                                    font-bold
                                    truncate
                                  "
                                >
                                  {producto.nombre}
                                </h4>

                                <p
                                  className="
                                    text-sm
                                    text-gray-500
                                    mt-1
                                  "
                                >
                                  {
                                    producto.tipo ||
                                    producto.subcategoria ||
                                    'Producto'
                                  }
                                </p>

                                {producto.talle && (

                                  <p
                                    className="
                                      text-xs
                                      text-gray-500
                                      mt-1
                                    "
                                  >
                                    Talle {producto.talle}
                                  </p>

                                )}

                              </div>

                              <p
                                className="
                                  font-black
                                  text-lg
                                  md:text-xl
                                  shrink-0
                                "
                              >
                                {SITE_CONFIG.empresa.simboloMoneda}
                                {producto.precio}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </div>

    </main>
  )
}