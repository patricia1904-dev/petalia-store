import {
  Suspense,
} from 'react'

import GraciasContenido
  from './GraciasContenido'

function CargandoPedido() {

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

export default function GraciasPage() {

  return (

    <Suspense
      fallback={
        <CargandoPedido />
      }
    >

      <GraciasContenido />

    </Suspense>
  )
}