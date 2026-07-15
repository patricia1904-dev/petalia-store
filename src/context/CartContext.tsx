'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

type Producto = {
  id: number
  nombre: string
  precio: number
  imagen: string
  tipo: string
}

type CartContextType = {
  carrito: Producto[]
  agregarAlCarrito: (
    producto: Producto
  ) => void
  eliminarDelCarrito: (
    id: number
  ) => void
  vaciarCarrito: () => void
}

const CartContext =
  createContext<CartContextType | null>(
    null
  )

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const [carrito, setCarrito] =
    useState<Producto[]>([])

  const [carritoCargado, setCarritoCargado] =
    useState(false)

  /*
    Recupera el carrito una sola vez,
    cuando el componente se carga en el navegador.
  */
  useEffect(() => {

    try {

      const carritoGuardado =
        localStorage.getItem('carrito')

      if (carritoGuardado) {

        const carritoConvertido =
          JSON.parse(carritoGuardado)

        if (Array.isArray(carritoConvertido)) {

          setCarrito(carritoConvertido)
        }
      }

    } catch (error) {

      console.error(
        'Error al recuperar el carrito:',
        error
      )

      localStorage.removeItem('carrito')
    }

    setCarritoCargado(true)

  }, [])

  /*
    Guarda el carrito solamente después
    de haber leído localStorage.
  */
  useEffect(() => {

    if (!carritoCargado) {
      return
    }

    localStorage.setItem(
      'carrito',
      JSON.stringify(carrito)
    )

  }, [carrito, carritoCargado])

  function agregarAlCarrito(
    producto: Producto
  ) {

    setCarrito((prev) => {

      const existe = prev.some(
        (item) =>
          item.id === producto.id
      )

      if (existe) {
        return prev
      }

      return [
        ...prev,
        producto,
      ]
    })
  }

  function eliminarDelCarrito(
    id: number
  ) {

    setCarrito((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    )
  }

  function vaciarCarrito() {

    setCarrito([])
  }

  return (

    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
      }}
    >

      {children}

    </CartContext.Provider>
  )
}

export function useCart() {

  const context =
    useContext(CartContext)

  if (!context) {

    throw new Error(
      'useCart debe usarse dentro de CartProvider'
    )
  }

  return context
}