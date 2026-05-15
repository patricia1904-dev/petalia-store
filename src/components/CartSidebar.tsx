'use client'

import { X,Trash2, } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

type Props = {
  abierto: boolean
  cerrar: () => void
}

export default function CartSidebar({
  abierto,
  cerrar,
}: Props) {

  const {
    carrito,
    eliminarDelCarrito,
  } = useCart()

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio,
    0
  )

  return (

    <>

      {/* OVERLAY */}

      {
        abierto && (

          <div
            onClick={cerrar}
            className="
              fixed
              inset-0
              bg-black/40
              z-40
            "
          />
        )
      }

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          top-0
          right-0
          h-full
          w-[420px]
          bg-white
          z-50
          shadow-2xl
          transition-transform
          duration-300

          ${abierto
            ? 'translate-x-0'
            : 'translate-x-full'
          }
        `}
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            p-6
            border-b
          "
        >

          <h2
            className="
              text-2xl
              font-black
            "
          >
            Tu carrito
          </h2>

          <button onClick={cerrar}>
            <X />
          </button>

        </div>

        {/* PRODUCTOS */}

        <div
          className="
            flex-1
            overflow-y-auto
            p-6
            flex
            flex-col
            gap-5
          "
        >

          {
            carrito.length === 0 && (

              <p className="text-gray-500">
                Tu carrito está vacío.
              </p>
            )
          }

          {
            carrito.map((producto) => (

              <div
                key={producto.id}
                className="
                  flex
                  gap-4
                "
              >

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="
                    w-24
                    h-24
                    object-cover
                    rounded-2xl
                  "
                />

                <div className="flex-1">

                  <h3 className="font-bold">
                    {producto.nombre}
                  </h3>

                  <p className="text-gray-500">
                    ${producto.precio}
                  </p>
                  
                  <button
                    onClick={() =>
                        eliminarDelCarrito(
                        producto.id
                        )
                    }
                    className="
                        mt-2
                        text-red-500
                        hover:text-red-700
                        transition
                    "
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                </div>

              </div>
            ))
          }

        </div>

        {/* FOOTER */}

        <div
          className="
            border-t
            p-6
            flex
            flex-col
            gap-5
          "
        >

          <div
            className="
              flex
              justify-between
              font-bold
              text-lg
            "
          >

            <span>Subtotal</span>

            <span>${subtotal}</span>

          </div>

          <Link
            href="/carrito"
            className="
              bg-black
              text-white
              py-4
              rounded-2xl
              text-center
              font-bold
              hover:bg-gray-800
              transition
            "
          >
            Finalizar compra
          </Link>

        </div>

      </aside>

    </>
  )
}