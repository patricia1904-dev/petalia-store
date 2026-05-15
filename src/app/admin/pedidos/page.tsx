'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export default function AdminPedidosPage() {

  const [pedidos, setPedidos] = useState<any[]>([])
  
  const [estadoFiltro, setEstadoFiltro] = useState('Todos')

  async function cargarPedidos() {

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {

      console.log(
        'ERROR PEDIDO:',
        error
        )

      return
    }

    setPedidos(data || [])
  }

  async function actualizarEstado(
    id:number,
    estado:string
  ) {

    const { error } = await supabase
      .from('pedidos')
      .update({
        estado,
      })
      .eq('id', id)

    if (error) {

      console.log(error)

      return
    }

    cargarPedidos()
  }


  useEffect(() => {

    cargarPedidos()

  }, [])

  const pedidosFiltrados = pedidos.filter(
    (pedido) => {

      if (estadoFiltro === 'Todos') {
        return true
      }

      return pedido.estado === estadoFiltro
    }
  )

  return (

    <main className="min-h-screen bg-[#fafafa] p-6">

      <div className="max-w-7xl mx-auto">

        {/* TITULO */}

        <div className="mb-10">

          <h1 className="text-5xl font-black mb-3">
            Pedidos
          </h1>

          <p className="text-gray-500">
            Gestión de pedidos realizados.
          </p>

          <div className="mt-6">
            <select
              value={estadoFiltro}
              onChange={(e) =>
                setEstadoFiltro(e.target.value)
              }
              className="
                border
                rounded-2xl
                px-5
                py-3
                bg-white
              "
            >

              <option value="Todos">
                Todos los estados
              </option>

              <option value="Pendiente">
                Pendiente
              </option>

              <option value="Pagado">
                Pagado
              </option>

              <option value="Enviado">
                Enviado
              </option>

              <option value="Entregado">
                Entregado
              </option>

            </select>

          </div>

        </div>

        {/* LISTADO */}

        <div className="flex flex-col gap-8">

          {
            pedidosFiltrados.map((pedido) => (

              <article
                key={pedido.id}
                className="
                  bg-white
                  rounded-[30px]
                  p-8
                  shadow-sm
                "
              >

                {/* HEADER */}

                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-6
                    mb-8
                  "
                >

                  <div>

                    <h2 className="text-3xl font-black">
                      {pedido.nombre}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      {pedido.email}
                    </p>

                  </div>

                  <div className="text-right">

                    <div className="flex justify-end mb-3">

                      <select
                        value={pedido.estado}
                        onChange={(e) =>
                          actualizarEstado(
                            pedido.id,
                            e.target.value
                          )
                        }
                        className={`
                          px-4
                          py-2
                          rounded-full
                          text-sm
                          font-bold
                          border-0

                          ${
                            pedido.estado === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-700'

                            : pedido.estado === 'Pagado'
                              ? 'bg-blue-100 text-blue-700'

                            : pedido.estado === 'Enviado'
                              ? 'bg-purple-100 text-purple-700'

                            : 'bg-green-100 text-green-700'
                          }
                        `}
                      >

                        <option value="Pendiente">
                          Pendiente
                        </option>

                        <option value="Pagado">
                          Pagado
                        </option>

                        <option value="Enviado">
                          Enviado
                        </option>

                        <option value="Entregado">
                          Entregado
                        </option>

                      </select>

                    </div>

                    <p className="text-4xl font-black">
                      ${pedido.total}
                    </p>

                    <p className="text-gray-500 mt-2">
                      {
                        new Date(
                          pedido.created_at
                        ).toLocaleDateString()
                      }
                    </p>

                  </div>
                </div>

                {/* DATOS */}

                <div
                  className="
                    grid
                    md:grid-cols-3
                    gap-6
                    mb-8
                  "
                >

                  <div>

                    <p className="text-sm text-gray-500 mb-2">
                      Teléfono
                    </p>

                    <p className="font-semibold">
                      {pedido.telefono}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500 mb-2">
                      Ciudad
                    </p>

                    <p className="font-semibold">
                      {pedido.ciudad}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500 mb-2">
                      Departamento
                    </p>

                    <p className="font-semibold">
                      {pedido.departamento}
                    </p>

                  </div>

                </div>

                {/* DIRECCION */}

                <div className="mb-8">

                  <p className="text-sm text-gray-500 mb-2">
                    Dirección
                  </p>

                  <p className="font-semibold">
                    {pedido.direccion}
                  </p>

                </div>

                {/* PRODUCTOS */}

                <div>

                  <h3 className="text-2xl font-black mb-6">
                    Productos
                  </h3>

                  <div className="grid gap-4">

                    {
                      pedido.productos?.map(
                        (producto:any) => (

                          <div
                            key={producto.id}
                            className="
                              border
                              rounded-2xl
                              p-4
                              flex
                              items-center
                              gap-4
                            "
                          >

                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="
                                w-20
                                h-20
                                object-cover
                                rounded-xl
                              "
                            />

                            <div className="flex-1">

                              <h4 className="font-bold">
                                {producto.nombre}
                              </h4>

                              <p className="text-sm text-gray-500">
                                {producto.tipo}
                              </p>

                            </div>

                            <p className="font-black text-xl">
                              ${producto.precio}
                            </p>

                          </div>
                        )
                      )
                    }

                  </div>

                </div>

              </article>
            ))
          }

        </div>

      </div>

    </main>
  )
}