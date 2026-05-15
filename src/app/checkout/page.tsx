'use client'

import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'


export default function CheckoutPage() {

  const router = useRouter()
  const { carrito, 
          vaciarCarrito, 
        } = useCart()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [metodoEnvio, setMetodoEnvio] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [notas, setNotas] = useState('')

  const total = carrito.reduce(
    (acc, item) => acc + item.precio,
    0
  )

  async function finalizarCompra() {

    // 1. Guardar pedido en Supabase como Pendiente

    const { data: pedidoCreado, error } =
      await supabase
        .from('pedidos')
        .insert({
          nombre,
          email,
          telefono,
          direccion,
          ciudad,
          departamento,
          total,
          productos: carrito,
          estado: 'Pendiente',
        })
        .select()
        .single()

    if (error) {
      console.log('ERROR PEDIDO:', error)
      alert('Error al guardar el pedido')
      return
    }

    // 2. Crear items para MercadoPago

    const items = carrito.map((producto) => ({

      title: producto.nombre,

      quantity: 1,

      unit_price: Number(producto.precio),

      currency_id: 'UYU',
    }))

    // 3. Pedir link de pago a nuestra API

    const response = await fetch('/api/checkout', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        items,
        pedidoId: pedidoCreado.id,
      }),
    })

    const data = await response.json()

    if (!data.init_point) {
      console.log(data)
      alert('No se pudo crear el link de pago')
      return
    }

    // 4. Redirigir a MercadoPago

    window.location.href = data.init_point
  }

  return (

    <main
      className="
        max-w-7xl
        mx-auto
        px-6
        py-16
      "
    >

      <h1
        className="
          text-5xl
          font-black
          mb-14
        "
      >
        Checkout
      </h1>

      <div
        className="
          grid
          lg:grid-cols-[1fr_400px]
          gap-14
        "
      >

        {/* FORMULARIO */}

        <form
          className="
            flex
            flex-col
            gap-6
          "
          onSubmit={async (e) => {
            e.preventDefault()

            await finalizarCompra()
          }}
        >

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          />

          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) =>
              setDireccion(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          />

          <input
            type="text"
            placeholder="Ciudad"
            value={ciudad}
            onChange={(e) =>
              setCiudad(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) =>
              setTelefono(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          />

          <select
            value={departamento}
            onChange={(e) =>
              setDepartamento(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
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

          <select
            value={metodoEnvio}
            onChange={(e) =>
              setMetodoEnvio(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          >

            <option value="">
              Método de envío
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

          <select
            value={metodoPago}
            onChange={(e) =>
              setMetodoPago(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
            "
          >

            <option value="">
              Método de pago
            </option>

            <option value="Transferencia bancaria">
              Transferencia bancaria
            </option>

            <option value="MercadoPago">
              MercadoPago
            </option>

          </select>

          <textarea
            placeholder="Notas adicionales"
            value={notas}
            onChange={(e) =>
              setNotas(e.target.value)
            }
            className="
              border
              rounded-2xl
              p-5
              min-h-[120px]
            "
          />

          <button
            type="submit"
            className="
              bg-black
              text-white
              py-5
              rounded-2xl
              font-bold
              hover:bg-gray-800
              transition
            "
          >
            Confirmar compra
          </button>

        </form>

        {/* RESUMEN */}

        <div
          className="
            border
            rounded-[30px]
            p-8
            h-fit
            sticky
            top-28
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

          {
            carrito.map((producto) => (

              <div
                key={producto.id}
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span>
                  {producto.nombre}
                </span>

                <span>
                  ${producto.precio}
                </span>

              </div>
            ))
          }

          <div className="border-t pt-6">

            <div
              className="
                flex
                justify-between
                text-2xl
                font-black
              "
            >

              <span>Total</span>

              <span>${total}</span>

            </div>

          </div>

        </div>

      </div>

    </main>
  )
}