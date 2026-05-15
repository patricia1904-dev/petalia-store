import { supabase } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ProductoPage({
  params,
}: Props) {

  const { id } = await params

  const { data: producto } =
    await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

  if (!producto) {

    return (
      <main className="p-10">
        Producto no encontrado
      </main>
    )
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

      <div
        className="
          grid
          md:grid-cols-2
          gap-14
        "
      >

        {/* IMAGEN */}

        <div>

          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="
              w-full
              rounded-[30px]
              object-cover
            "
          />

        </div>

        {/* INFO */}

        <div
          className="
            flex
            flex-col
            gap-6
          "
        >

          <div>

            <p className="text-gray-500">
              {producto.categoria}
            </p>

            <h1
              className="
                text-5xl
                font-black
                mt-2
              "
            >
              {producto.nombre}
            </h1>

          </div>

          <span
            className="
              text-4xl
              font-black
            "
          >
            ${producto.precio}
          </span>

          <p
            className="
              text-gray-600
              leading-relaxed
              text-lg
            "
          >
            {producto.descripcion}
          </p>

          <div className="flex gap-3">

            <span
              className="
                bg-gray-100
                px-4
                py-2
                rounded-full
              "
            >
              {producto.estado}
            </span>

            <span
              className="
                bg-gray-100
                px-4
                py-2
                rounded-full
              "
            >
              Talle {producto.talle}
            </span>

          </div>

          <AddToCartButton
            producto={producto}
            />

        </div>

      </div>

    </main>
  )
}