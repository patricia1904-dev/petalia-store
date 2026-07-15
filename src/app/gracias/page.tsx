'use client'

import { SITE_CONFIG } from '@/config/site'

import Link from 'next/link'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useSearchParams,
} from 'next/navigation'

import {
  useCart,
} from '@/context/CartContext'

import {
  supabase,
} from '@/lib/supabase'

type Pedido = {
  id: number
  nombre: string
  email: string
  telefono: string
  metodo_pago: string | null
  metodo_envio: string | null
  total: number
  estado: string
}

export default function GraciasPage() {

  const searchParams =
    useSearchParams()

  const pedidoId =
    searchParams.get('pedido')

  const tipoPagoUrl =
    searchParams.get('pago')

  const { vaciarCarrito } =
    useCart()

  const [
    pedido,
    setPedido,
  ] = useState<Pedido | null>(null)

  const [
    cargando,
    setCargando,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    mostrarAyuda,
    setMostrarAyuda,
  ] = useState(false)

  const ayudaRef =
    useRef<HTMLDivElement | null>(null)

  useEffect(() => {

    vaciarCarrito()

  }, [])

  useEffect(() => {

    async function cargarPedido() {

      if (!pedidoId) {

        setCargando(false)

        return
      }

      const {
        data,
        error: errorPedido,
      } = await supabase
        .from('pedidos')
        .select(`
          id,
          nombre,
          email,
          telefono,
          metodo_pago,
          metodo_envio,
          total,
          estado
        `)
        .eq('id', pedidoId)
        .single()

      if (errorPedido) {

        console.error(
          'ERROR AL CARGAR PEDIDO:',
          errorPedido
        )

        setError(
          'No pudimos cargar los detalles del pedido.'
        )

        setCargando(false)

        return
      }

      setPedido(data)
      setCargando(false)
    }

    cargarPedido()

  }, [pedidoId])

  const esTransferencia =
    pedido?.metodo_pago ===
      'Transferencia bancaria' ||
    tipoPagoUrl ===
      'transferencia'

  const mensajeAyuda = `
Hola, necesito ayuda con el pedido N.º ${pedidoId || ''} de ${SITE_CONFIG.nombre}.
`.trim()

  const whatsappUrl =
    `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
      mensajeAyuda
    )}`

  function alternarAyuda() {

    const seAbrira =
      !mostrarAyuda

    setMostrarAyuda(
      seAbrira
    )

    if (seAbrira) {

      window.setTimeout(() => {

        ayudaRef.current
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })

      }, 50)
    }
  }

  if (cargando) {

    return (

      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          px-6
          bg-[#fafafa]
        "
      >

        <p
          className="
            text-lg
            text-gray-500
          "
        >
          Cargando tu pedido...
        </p>

      </main>
    )
  }

  return (

    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        py-8
        bg-[#fafafa]
      "
    >

      <div
        className="
          bg-white
          rounded-[36px]
          shadow-sm
          p-6
          md:p-9
          max-w-2xl
          w-full
          text-center
          flex
          flex-col
          gap-6
        "
      >

        {/* ENCABEZADO */}

        <div>

          <h1
            className="
              text-3xl
              md:text-5xl
              font-black
              mb-3
            "
          >
            🎉 Pedido recibido
          </h1>

          <p
            className="
              text-base
              md:text-lg
              text-gray-500
              leading-relaxed
            "
          >
            Gracias por comprar en{' '}
            {SITE_CONFIG.nombre}.
          </p>

          {pedidoId && (

            <p
              className="
                mt-2
                text-base
                font-bold
              "
            >
              Pedido N.º {pedidoId}
            </p>

          )}

        </div>

        {/* ERROR */}

        {error && (

          <div
            className="
              bg-yellow-50
              border
              border-yellow-200
              text-yellow-800
              rounded-2xl
              px-5
              py-4
            "
          >
            {error}
          </div>

        )}

        {/* RESUMEN */}

        {pedido && (

          <div
            className="
              border
              rounded-3xl
              p-5
              text-left
              flex
              flex-col
              gap-3
            "
          >

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span className="text-gray-500">
                Pago
              </span>

              <span
                className="
                  font-bold
                  text-right
                "
              >
                {pedido.metodo_pago}
              </span>

            </div>

            <div
              className="
                flex
                justify-between
                gap-4
              "
            >

              <span className="text-gray-500">
                Entrega
              </span>

              <span
                className="
                  font-bold
                  text-right
                "
              >
                {pedido.metodo_envio}
              </span>

            </div>

            <div
              className="
                flex
                justify-between
                gap-4
                border-t
                pt-3
              "
            >

              <span className="text-gray-500">
                Total
              </span>

              <span className="font-black">
                ${pedido.total}
              </span>

            </div>

          </div>

        )}

        {/* TRANSFERENCIA */}

        {esTransferencia ? (

          <div
            className="
              bg-gray-50
              rounded-3xl
              p-5
              text-left
              flex
              flex-col
              gap-4
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  md:text-2xl
                  font-black
                  mb-2
                "
              >
                Datos para la transferencia
              </h2>

              <p
                className="
                  text-sm
                  md:text-base
                  text-gray-600
                "
              >
                Transferí exactamente el total
                indicado y usá el número de pedido
                como referencia.
              </p>

            </div>

            <div
              className="
                bg-white
                border
                rounded-2xl
                p-4
                flex
                flex-col
                gap-2.5
              "
            >

              <div
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-gray-500">
                  Banco
                </span>

                <span
                  className="
                    font-bold
                    text-right
                  "
                >
                  {SITE_CONFIG.banco.institucion}
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-gray-500">
                  Titular
                </span>

                <span
                  className="
                    font-bold
                    text-right
                  "
                >
                  {SITE_CONFIG.banco.titular}
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-gray-500">
                  Cuenta
                </span>

                <span
                  className="
                    font-bold
                    text-right
                    break-all
                  "
                >
                  {SITE_CONFIG.banco.cuenta}
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-gray-500">
                  Moneda
                </span>

                <span
                  className="
                    font-bold
                    text-right
                  "
                >
                  {SITE_CONFIG.banco.moneda}
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                  border-t
                  pt-3
                  text-lg
                "
              >

                <span className="font-bold">
                  Importe
                </span>

                <span className="font-black">
                  ${pedido?.total}
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-gray-500">
                  Referencia
                </span>

                <span
                  className="
                    font-bold
                    text-right
                  "
                >
                  Pedido {pedidoId}
                </span>

              </div>

            </div>

            <ul
              className="
                text-sm
                md:text-base
                text-gray-600
                flex
                flex-col
                gap-1.5
              "
            >

              <li>
                ✅ Registramos tu pedido.
              </li>

              <li>
                🏦 Realizá la transferencia
                con los datos indicados.
              </li>

              <li>
                📦 Prepararemos el pedido
                cuando confirmemos el pago.
              </li>

              <li>
                🚚 Usaremos el método de
                entrega que elegiste.
              </li>

            </ul>

          </div>

        ) : (

          /* MERCADO PAGO */

          <div
            className="
              bg-gray-50
              rounded-3xl
              p-5
              text-left
            "
          >

            <p className="font-bold mb-3">
              Estado de la compra
            </p>

            <ul
              className="
                text-sm
                md:text-base
                text-gray-600
                flex
                flex-col
                gap-1.5
              "
            >

              <li>
                ✅ Registramos tu pedido.
              </li>

              <li>
                💳 Estamos confirmando
                el estado del pago.
              </li>

              <li>
                📦 Prepararemos tu pedido
                cuando el pago sea aprobado.
              </li>

              <li>
                🚚 Usaremos el método de
                entrega que elegiste.
              </li>

            </ul>

          </div>

        )}

        {/* BOTONES */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            gap-3
          "
        >

          <Link
            href="/"
            className="
              flex-1
              bg-black
              text-white
              px-7
              py-4
              rounded-2xl
              font-bold
              hover:bg-gray-800
              transition
            "
          >
            Volver a la tienda
          </Link>

          <button
            type="button"
            onClick={alternarAyuda}
            className="
              flex-1
              border
              border-black
              text-black
              px-7
              py-4
              rounded-2xl
              font-bold
              hover:bg-gray-100
              transition
            "
          >
            {
              mostrarAyuda
                ? 'Cerrar ayuda'
                : 'Necesito ayuda'
            }
          </button>

        </div>

        {/* INFORMACIÓN DE AYUDA */}

        {mostrarAyuda && (

          <div
            ref={ayudaRef}
            className="
              scroll-mt-6
              border
              rounded-3xl
              p-5
              text-left
              flex
              flex-col
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-lg
                  text-gray-500
                  mb-1
                "
              >
                Número de atención por WhatsApp de{' '}
                {SITE_CONFIG.nombre}
              </p>

              <p
                className="
                  text-xl
                  md:text-2xl
                  font-black
                "
              >
                {SITE_CONFIG.whatsappVisible}
              </p>

            </div>

            <p
              className="
                text-sm
                md:text-base
                text-gray-600
              "
            >
              Podés comunicarte  a este número de WhatsApp cuando lo necesites.
              Y también podés abrir WhatsApp desde esta misma página.
            </p>

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >

              <a
                href={`tel:+${SITE_CONFIG.whatsapp}`}
                className="
                  flex-1
                  border
                  border-black
                  text-black
                  px-6
                  py-3.5
                  rounded-2xl
                  font-bold
                  text-center
                  hover:bg-gray-100
                  transition
                "
              >
                Llamar
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex-1
                  bg-green-600
                  text-white
                  px-6
                  py-3.5
                  rounded-2xl
                  font-bold
                  text-center
                  hover:bg-green-700
                  transition
                "
              >
                Abrir WhatsApp
              </a>

            </div>

          </div>

        )}

        <p
          className="
            text-xs
            md:text-sm
            text-gray-500
          "
        >
          Tu pedido ya quedó registrado
          en el sistema.
        </p>

      </div>

    </main>
  )
}