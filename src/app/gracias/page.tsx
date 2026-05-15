'use client'

import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

export default function GraciasPage() {

  const { vaciarCarrito } = useCart()

  useEffect(() => {

    vaciarCarrito()

  }, [])

  const numeroWhatsapp =
    '59897984793'

  const mensaje = `
Hola, hice un pedido en Petalia Second Hand.

Quisiera coordinar el pago y el envío.
`

  const whatsappUrl =
    `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`

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

      <div
        className="
          bg-white
          rounded-[40px]
          shadow-sm
          p-12
          max-w-2xl
          w-full
          text-center
          flex
          flex-col
          gap-8
        "
      >

        <div>

          <h1
            className="
              text-6xl
              font-black
              mb-4
            "
          >
            🎉 Gracias
          </h1>

          <p
            className="
              text-xl
              text-gray-500
              leading-relaxed
            "
          >
            Tu pedido fue recibido correctamente.
            <br />
            En breve procesaremos tu compra.
          </p>

        </div>

        <div
          className="
            bg-gray-50
            rounded-3xl
            p-6
            text-left
          "
        >

          <p className="font-bold mb-3">
            Próximos pasos:
          </p>

          <ul className="text-gray-600 flex flex-col gap-2">

            <li>
              ✅ Verificaremos tu pago
            </li>

            <li>
              📦 Prepararemos tu pedido
            </li>

            <li>
              🚚 Coordinaremos el envío
            </li>

          </ul>

        </div>

        <div className="flex flex-col md:flex-row gap-4">

          <a
            href="/"
            className="
              flex-1
              bg-black
              text-white
              px-8
              py-5
              rounded-2xl
              font-bold
            "
          >
            Volver a la tienda
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            className="
              flex-1
              bg-green-600
              text-white
              px-8
              py-5
              rounded-2xl
              font-bold
            "
          >
            WhatsApp
          </a>

        </div>

      </div>

    </main>
  )
}