'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function AddToCartButton({
  producto,
}: {
  producto: any
}) {

  const router = useRouter()

  const { agregarAlCarrito } =
    useCart()

  function manejarAgregar() {

    agregarAlCarrito(producto)

    router.push('/')
  }

  return (

    <button
      onClick={manejarAgregar}
      className="
        w-full
        bg-black
        text-white
        py-4
        px-6
        rounded-2xl
        font-semibold
        hover:bg-gray-800
        transition
        flex
        items-center
        justify-center
      "
    >
      Agregar al carrito
    </button>
  )
}