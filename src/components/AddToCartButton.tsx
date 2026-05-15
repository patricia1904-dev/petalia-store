'use client'

import { useCart } from '@/context/CartContext'

export default function AddToCartButton({
  producto,
}: {
  producto: any
}) {

  const { agregarAlCarrito } =
    useCart()

  return (

    <button
      onClick={() =>
        agregarAlCarrito(producto)
      }
      className="
        mt-8
        bg-black
        text-white
        px-10
        py-5
        rounded-2xl
        hover:bg-gray-800
        transition
        font-bold
      "
    >
      Agregar al carrito
    </button>
  )
}
