'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useCart }
  from '@/context/CartContext'

import { supabase }
  from '@/lib/supabase'

export default function CheckoutPage() {

  const router = useRouter()

  const { carrito } = useCart()

  const [
    nombre,
    setNombre,
  ] = useState('')

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    telefono,
    setTelefono,
  ] = useState('')

  const [
    direccion,
    setDireccion,
  ] = useState('')

  const [
    ciudad,
    setCiudad,
  ] = useState('')

  const [
    departamento,
    setDepartamento,
  ] = useState('')

  const [
    metodoEnvio,
    setMetodoEnvio,
  ] = useState('')

  const [
    metodoPago,
    setMetodoPago,
  ] = useState('')

  const [
    notas,
    setNotas,
  ] = useState('')

  const [
    procesando,
    setProcesando,
  ] = useState(false)

  const [
    mensajeError,
    setMensajeError,
  ] = useState('')

  const total = carrito.reduce(
    (acumulado, producto) =>
      acumulado + Number(producto.precio),
    0
  )

  const requiereDireccion =
    metodoEnvio !== 'Retira en tienda'

  function validarFormulario() {

    if (carrito.length === 0) {

      return 'Tu carrito está vacío.'
    }

    if (!nombre.trim()) {

      return 'Ingresá tu nombre completo.'
    }

    if (!email.trim()) {

      return 'Ingresá tu correo electrónico.'
    }

    if (!telefono.trim()) {

      return 'Ingresá tu teléfono.'
    }

    if (!metodoEnvio) {

      return 'Seleccioná un método de envío.'
    }

    if (!metodoPago) {

      return 'Seleccioná un método de pago.'
    }

    if (
      requiereDireccion &&
      !direccion.trim()
    ) {

      return 'Ingresá la dirección de entrega.'
    }

    if (
      requiereDireccion &&
      !ciudad.trim()
    ) {

      return 'Ingresá la ciudad de entrega.'
    }

    if (
      requiereDireccion &&
      !departamento
    ) {

      return 'Seleccioná el departamento.'
    }

    return null
  }

  async function finalizarCompra() {

    const errorValidacion =
      validarFormulario()

    if (errorValidacion) {

      setMensajeError(
        errorValidacion
      )

      return
    }

    setMensajeError('')
    setProcesando(true)

    try {

      /*
        1. Guardar el pedido en Supabase.
      */

      const {
        data: pedidoCreado,
        error: errorPedido,
      } = await supabase
        .from('pedidos')
        .insert({
          nombre:
            nombre.trim(),

          email:
            email.trim(),

          telefono:
            telefono.trim(),

          direccion:
            requiereDireccion
              ? direccion.trim()
              : 'Retiro en tienda',

          ciudad:
            requiereDireccion
              ? ciudad.trim()
              : null,

          departamento:
            requiereDireccion
              ? departamento
              : null,

          metodo_envio:
            metodoEnvio,

          metodo_pago:
            metodoPago,

          notas:
            notas.trim() || null,

          total,

          productos:
            carrito,

          estado:
            metodoPago ===
              'Transferencia bancaria'

              ? 'Pendiente de transferencia'

              : 'Pendiente de pago',
        })
        .select()
        .single()

      if (errorPedido) {

        console.error(
          'ERROR AL CREAR PEDIDO:',
          errorPedido
        )

        setMensajeError(
          'No se pudo guardar el pedido. Intentá nuevamente.'
        )

        return
      }

      /*
        2. Si paga mediante transferencia,
        ir directamente a la página de gracias.
      */

      if (
        metodoPago ===
        'Transferencia bancaria'
      ) {

        router.push(
          `/gracias?pedido=${pedidoCreado.id}&pago=transferencia`
        )

        return
      }

      /*
        3. Preparar los productos para
        Mercado Pago.
      */

      const items = carrito.map(
        (producto) => ({

          id:
            String(producto.id),

          title:
            producto.nombre,

          quantity: 1,

          unit_price:
            Number(producto.precio),

          currency_id:
            'UYU',
        })
      )

      /*
        4. Solicitar la preferencia
        de pago a nuestra API.
      */

      const response = await fetch(
        '/api/checkout',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            items,
            pedidoId:
              pedidoCreado.id,
          }),
        }
      )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.init_point
      ) {

        console.error(
          'ERROR MERCADO PAGO:',
          data
        )

        setMensajeError(
          'El pedido fue guardado, pero no se pudo abrir Mercado Pago. Intentá nuevamente.'
        )

        return
      }

      /*
        5. Redirigir a Mercado Pago.
      */

      window.location.href =
        data.init_point

    } catch (error) {

      console.error(
        'ERROR AL FINALIZAR COMPRA:',
        error
      )

      setMensajeError(
        'Ocurrió un error inesperado. Intentá nuevamente.'
      )

    } finally {

      /*
        Si la página redirige a Mercado Pago,
        este cambio prácticamente no se verá.

        Si ocurre un error, vuelve a habilitar
        el botón.
      */

      setProcesando(false)
    }
  }

  return (

    <main
      className="
        max-w-7xl
        mx-auto
        px-4
        md:px-6
        py-10
        md:py-16
      "
    >

      <h1
        className="
          text-4xl
          md:text-5xl
          font-black
          mb-10
          md:mb-14
        "
      >
        Checkout
      </h1>

      {carrito.length === 0 ? (

        <div
          className="
            max-w-xl
            border
            rounded-[30px]
            p-8
          "
        >

          <h2
            className="
              text-2xl
              font-black
            "
          >
            Tu carrito está vacío
          </h2>

          <p
            className="
              text-gray-500
              mt-2
              mb-6
            "
          >
            Agregá alguna prenda antes
            de comenzar la compra.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push('/')
            }
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
            Volver a la tienda
          </button>

        </div>

      ) : (

        <div
          className="
            grid
            lg:grid-cols-[1fr_400px]
            gap-10
            lg:gap-14
          "
        >

          {/* FORMULARIO */}

          <form
            className="
              flex
              flex-col
              gap-5
            "
            onSubmit={async (evento) => {

              evento.preventDefault()

              await finalizarCompra()
            }}
          >

            <h2
              className="
                text-2xl
                font-black
                mb-2
              "
            >
              Datos del comprador
            </h2>

            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(evento) =>
                setNombre(
                  evento.target.value
                )
              }
              disabled={procesando}
              className="
                border
                rounded-2xl
                p-4
                md:p-5
                disabled:bg-gray-100
              "
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(evento) =>
                setEmail(
                  evento.target.value
                )
              }
              disabled={procesando}
              className="
                border
                rounded-2xl
                p-4
                md:p-5
                disabled:bg-gray-100
              "
            />

            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(evento) =>
                setTelefono(
                  evento.target.value
                )
              }
              disabled={procesando}
              className="
                border
                rounded-2xl
                p-4
                md:p-5
                disabled:bg-gray-100
              "
            />

            <h2
              className="
                text-2xl
                font-black
                mt-4
                mb-2
              "
            >
              Entrega
            </h2>

            <select
              value={metodoEnvio}
              onChange={(evento) =>
                setMetodoEnvio(
                  evento.target.value
                )
              }
              disabled={procesando}
              className="
                border
                rounded-2xl
                p-4
                md:p-5
                bg-white
                disabled:bg-gray-100
              "
            >

              <option value="">
                Seleccionar método de envío
              </option>

              <option value="DAC">
                DAC
              </option>

              <option value="Mirtrans">
                Mirtrans
              </option>

              <option value="Retira en tienda">
                Retira en tienda
              </option>

            </select>

            {requiereDireccion && (

              <>

                <input
                  type="text"
                  placeholder="Dirección"
                  value={direccion}
                  onChange={(evento) =>
                    setDireccion(
                      evento.target.value
                    )
                  }
                  disabled={procesando}
                  className="
                    border
                    rounded-2xl
                    p-4
                    md:p-5
                    disabled:bg-gray-100
                  "
                />

                <input
                  type="text"
                  placeholder="Ciudad o localidad"
                  value={ciudad}
                  onChange={(evento) =>
                    setCiudad(
                      evento.target.value
                    )
                  }
                  disabled={procesando}
                  className="
                    border
                    rounded-2xl
                    p-4
                    md:p-5
                    disabled:bg-gray-100
                  "
                />

                <select
                  value={departamento}
                  onChange={(evento) =>
                    setDepartamento(
                      evento.target.value
                    )
                  }
                  disabled={procesando}
                  className="
                    border
                    rounded-2xl
                    p-4
                    md:p-5
                    bg-white
                    disabled:bg-gray-100
                  "
                >

                  <option value="">
                    Seleccionar departamento
                  </option>

                  <option value="Artigas">
                    Artigas
                  </option>

                  <option value="Canelones">
                    Canelones
                  </option>

                  <option value="Cerro Largo">
                    Cerro Largo
                  </option>

                  <option value="Colonia">
                    Colonia
                  </option>

                  <option value="Durazno">
                    Durazno
                  </option>

                  <option value="Flores">
                    Flores
                  </option>

                  <option value="Florida">
                    Florida
                  </option>

                  <option value="Lavalleja">
                    Lavalleja
                  </option>

                  <option value="Maldonado">
                    Maldonado
                  </option>

                  <option value="Montevideo">
                    Montevideo
                  </option>

                  <option value="Paysandú">
                    Paysandú
                  </option>

                  <option value="Río Negro">
                    Río Negro
                  </option>

                  <option value="Rivera">
                    Rivera
                  </option>

                  <option value="Rocha">
                    Rocha
                  </option>

                  <option value="Salto">
                    Salto
                  </option>

                  <option value="San José">
                    San José
                  </option>

                  <option value="Soriano">
                    Soriano
                  </option>

                  <option value="Tacuarembó">
                    Tacuarembó
                  </option>

                  <option value="Treinta y Tres">
                    Treinta y Tres
                  </option>

                </select>

              </>

            )}

            <h2
              className="
                text-2xl
                font-black
                mt-4
                mb-2
              "
            >
              Pago
            </h2>

            <select
              value={metodoPago}
              onChange={(evento) =>
                setMetodoPago(
                  evento.target.value
                )
              }
              disabled={procesando}
              className="
                border
                rounded-2xl
                p-4
                md:p-5
                bg-white
                disabled:bg-gray-100
              "
            >

              <option value="">
                Seleccionar método de pago
              </option>

              <option value="MercadoPago">
                Mercado Pago
              </option>

              <option value="Transferencia bancaria">
                Transferencia bancaria
              </option>

            </select>

            <textarea
              placeholder="Notas adicionales — opcional"
              value={notas}
              onChange={(evento) =>
                setNotas(
                  evento.target.value
                )
              }
              disabled={procesando}
              className="
                border
                rounded-2xl
                p-4
                md:p-5
                min-h-[120px]
                resize-y
                disabled:bg-gray-100
              "
            />

            {mensajeError && (

              <div
                className="
                  border
                  border-red-300
                  bg-red-50
                  text-red-700
                  rounded-2xl
                  px-5
                  py-4
                "
              >
                {mensajeError}
              </div>

            )}

            <button
              type="submit"
              disabled={procesando}
              className="
                bg-black
                text-white
                py-5
                rounded-2xl
                font-bold
                hover:bg-gray-800
                transition
                disabled:bg-gray-400
                disabled:cursor-not-allowed
              "
            >
              {
                procesando
                  ? 'Procesando...'
                  : 'Confirmar compra'
              }
            </button>

          </form>

          {/* RESUMEN */}

          <aside
            className="
              border
              rounded-[30px]
              p-6
              md:p-8
              h-fit
              lg:sticky
              lg:top-28
              flex
              flex-col
              gap-6
            "
          >

            <h2
              className="
                text-3xl
                font-black
              "
            >
              Resumen
            </h2>

            {carrito.map(
              (producto) => (

                <div
                  key={producto.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      min-w-0
                    "
                  >

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="
                        w-14
                        h-14
                        rounded-xl
                        object-cover
                        shrink-0
                      "
                    />

                    <span
                      className="
                        font-medium
                        truncate
                      "
                    >
                      {producto.nombre}
                    </span>

                  </div>

                  <span
                    className="
                      font-bold
                      shrink-0
                    "
                  >
                    ${producto.precio}
                  </span>

                </div>

              )
            )}

            <div
              className="
                border-t
                pt-6
              "
            >

              <div
                className="
                  flex
                  justify-between
                  text-2xl
                  font-black
                "
              >

                <span>Total</span>

                <span>
                  ${total}
                </span>

              </div>

            </div>

          </aside>

        </div>

      )}

    </main>
  )
}