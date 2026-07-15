'use client'

import Link from 'next/link'

import {
  Trash2,
} from 'lucide-react'

import { useCart }
  from '@/context/CartContext'

export default function CarritoPage() {

  const {
    carrito,
    eliminarDelCarrito,
  } = useCart()

  const subtotal =
    carrito.reduce(

      (acc, item) =>
        acc + item.precio,

      0
    )

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
        Tu carrito
      </h1>

      {
        carrito.length === 0 && (

          <div
            className="
              flex
              flex-col
              gap-6
            "
          >

            <p className="text-gray-500">
              Tu carrito está vacío.
            </p>

            <Link
              href="/"
              className="
                bg-black
                text-white
                px-8
                py-4
                rounded-2xl
                w-fit
              "
            >
              Seguir comprando
            </Link>

          </div>
        )
      }

      {
        carrito.length > 0 && (

          <div
            className="
              grid
              lg:grid-cols-[1fr_380px]
              gap-14
            "
          >

            {/* PRODUCTOS */}

            <div
              className="
                flex
                flex-col
                gap-6
              "
            >

              {
                carrito.map((producto) => (

                  <div
                    key={producto.id}
                    className="
                      flex
                      gap-5
                      border
                      rounded-[30px]
                      p-5
                    "
                  >

                    {/* IMAGEN */}

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="
                        w-40
                        h-40
                        object-cover
                        rounded-2xl
                      "
                    />

                    {/* INFO */}

                    <div
                      className="
                        flex-1
                        flex
                        flex-col
                        justify-between
                      "
                    >

                      <div>

                        <h2
                          className="
                            text-2xl
                            font-bold
                          "
                        >
                          {producto.nombre}
                        </h2>

                        <p className="text-gray-500">
                          {producto.tipo}
                        </p>

                      </div>

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <span
                          className="
                            text-2xl
                            font-black
                          "
                        >
                          ${producto.precio}
                        </span>

                        <button
                          onClick={() =>
                            eliminarDelCarrito(
                              producto.id
                            )
                          }
                          className="
                            text-red-500
                            hover:text-red-700
                            transition
                          "
                        >
                          <Trash2 />
                        </button>

                      </div>

                    </div>

                  </div>
                ))
              }

            </div>

            {/* RESUMEN */}

            <div
              className="
                h-fit
                sticky
                top-28
                border
                rounded-[30px]
                p-8
                flex
                flex-col
                gap-8
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

              <div
                className="
                  flex
                  justify-between
                "
              >

                <span>Subtotal</span>

                <span>
                  ${subtotal}
                </span>

              </div>

              <div
                className="
                  flex
                  justify-between
                "
              >

                <span>Envío</span>

                <span>Gratis</span>

              </div>

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

                  <span>
                    ${subtotal}
                  </span>

                </div>

              </div>

              <div className="flex flex-col gap-3">

                <Link
                  href="/checkout"
                  className="
                    bg-black
                    text-white
                    py-5
                    rounded-2xl
                    font-bold
                    hover:bg-gray-800
                    transition
                    text-center
                  "
                >
                  Finalizar compra
                </Link>

                <Link
                  href="/"
                  className="
                    border
                    border-black
                    text-black
                    py-4
                    rounded-2xl
                    font-bold
                    hover:bg-gray-100
                    transition
                    text-center
                  "
                >
                  Seguir comprando
                </Link>

              </div>

            </div>

          </div>
        )
      }

    </main>
  )
}