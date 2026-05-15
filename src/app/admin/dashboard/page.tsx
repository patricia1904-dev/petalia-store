'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [productosVendidos, setProductosVendidos] = useState(0)
  const [mounted, setMounted] = useState(false)

  async function cargarDatos() {
    const { data: pedidosData, error: pedidosError } =
      await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

    if (pedidosError) {
      console.log(pedidosError)
      return
    }

    const { data: productosData } =
      await supabase
        .from('productos')
        .select('*')
        .eq('vendido', true)

    setPedidos(pedidosData || [])
    setProductosVendidos(productosData?.length || 0)
  }

  useEffect(() => {
    setMounted(true)
    cargarDatos()
  }, [])

  const ventasTotales = pedidos.reduce(
    (acc, pedido) => acc + Number(pedido.total || 0),
    0
  )

  const pedidosTotales = pedidos.length

  const ticketPromedio =
    pedidosTotales > 0
      ? Math.round(ventasTotales / pedidosTotales)
      : 0

  const ventasPorMes = pedidos.reduce(
    (acc:any[], pedido) => {

        const fecha =
        new Date(pedido.created_at)

        const mes =
        fecha.toLocaleDateString(
            'es-UY',
            {
            month: 'short',
            }
        )

        const existente =
        acc.find(
            (item) => item.mes === mes
        )

        if (existente) {

        existente.total +=
            Number(pedido.total)

        } else {

        acc.push({
            mes,
            total: Number(pedido.total),
        })
        }

        return acc

    }, []
    )

  const pedidosPorEstado = [
    {
        estado: 'Pendiente',
        cantidad: pedidos.filter(
        (pedido) => pedido.estado === 'Pendiente'
        ).length,
    },
    {
        estado: 'Pagado',
        cantidad: pedidos.filter(
        (pedido) => pedido.estado === 'Pagado'
        ).length,
    },
    {
        estado: 'Enviado',
        cantidad: pedidos.filter(
        (pedido) => pedido.estado === 'Enviado'
        ).length,
    },
    {
        estado: 'Entregado',
        cantidad: pedidos.filter(
        (pedido) => pedido.estado === 'Entregado'
        ).length,
    },
    ]  

  const coloresEstados = [
    '#FACC15', // Pendiente
    '#3B82F6', // Pagado
    '#A855F7', // Enviado
    '#22C55E', // Entregado
    ]

  const productosMasVendidos = pedidos
    .flatMap((pedido) =>
        pedido.productos || []
    )
    .reduce((acc: any[], producto) => {

        const existente = acc.find(
        (item) => item.id === producto.id
        )

        if (existente) {
        existente.cantidad += 1
        } else {
        acc.push({
            id: producto.id,
            nombre: producto.nombre,
            imagen: producto.imagen,
            precio: producto.precio,
            cantidad: 1,
        })
        }

        return acc

    }, [])
    .sort(
        (a, b) => b.cantidad - a.cantidad
    )
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-[#fafafa] p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        <div>
          <h1 className="text-5xl font-black mb-3">
            Dashboard
          </h1>

          <p className="text-gray-500">
            Resumen general de ventas y pedidos.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <p className="text-gray-500 mb-3">
              Ventas totales
            </p>
            <h2 className="text-4xl font-black">
              ${ventasTotales}
            </h2>
          </div>

          <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <p className="text-gray-500 mb-3">
              Pedidos totales
            </p>
            <h2 className="text-4xl font-black">
              {pedidosTotales}
            </h2>
          </div>

          <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <p className="text-gray-500 mb-3">
              Productos vendidos
            </p>
            <h2 className="text-4xl font-black">
              {productosVendidos}
            </h2>
          </div>

          <div className="bg-white rounded-[30px] p-8 shadow-sm">
            <p className="text-gray-500 mb-3">
              Ticket promedio
            </p>
            <h2 className="text-4xl font-black">
              ${ticketPromedio}
            </h2>
          </div>
        </section>

        <section className="bg-white rounded-[30px] p-8 shadow-sm">
          <h2 className="text-3xl font-black mb-8">
            Últimos pedidos
          </h2>

          <div className="flex flex-col gap-5">
            {pedidos.slice(0, 5).map((pedido) => (
              <div
                key={pedido.id}
                className="border rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-xl">
                    {pedido.nombre}
                  </h3>

                  <p className="text-gray-500">
                    {pedido.email}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(pedido.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-2xl">
                    ${pedido.total}
                  </span>

                  <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-bold">
                    {pedido.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[30px] p-8 shadow-sm">
            <h2 className="text-3xl font-black mb-8">
                Ventas por mes
            </h2>

            <div className="w-full h-[350px] min-w-0">
                {mounted && (
                    <ResponsiveContainer width="100%" height={350}>

                        <BarChart data={ventasPorMes}>
                            <XAxis dataKey="mes" />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="total"
                                fill="#7A284E"
                                radius={[12, 12, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>
                )}  

            </div>

        </section>

        <section className="bg-white rounded-[30px] p-8 shadow-sm">

            <h2 className="text-3xl font-black mb-8">
                Pedidos por estado
            </h2>

            <div className="w-full h-[350px] min-w-0">
                {mounted && (
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={pedidosPorEstado}
                                dataKey="cantidad"
                                nameKey="estado"
                                outerRadius={120}
                                label
                            >
                                {
                                    pedidosPorEstado.map(
                                    (_entry, index) => (

                                        <Cell
                                            key={index}
                                            fill={coloresEstados[index]}
                                        />
                                    )
                                    )
                                }
                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>

        <section className="bg-white rounded-[30px] p-8 shadow-sm">
            <h2 className="text-3xl font-black mb-8">
                Productos más vendidos
            </h2>

            <div className="flex flex-col gap-5">

                {
                productosMasVendidos.map((producto, index) => (

                    <div
                        key={producto.id}
                        className="
                        flex
                        items-center
                        gap-5
                        border
                        rounded-2xl
                        p-5
                        "
                    >
                        <span className="text-3xl font-black text-gray-300">
                        #{index + 1}
                        </span>

                        <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="
                            w-20
                            h-20
                            object-cover
                            rounded-2xl
                        "
                        />

                        <div className="flex-1">

                            <h3 className="font-bold text-xl">
                                {producto.nombre}
                            </h3>

                            <p className="text-gray-500">
                                Vendido {producto.cantidad} vez
                                {producto.cantidad > 1 ? 'es' : ''}
                            </p>

                        </div>

                        <p className="font-black text-xl">
                            ${producto.precio}
                        </p>

                    </div>
                 ))
                }

            </div>

            </section>                

      </div>
    </main>
  )
}