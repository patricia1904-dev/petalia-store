import {
  MercadoPagoConfig,
  Payment,
} from 'mercadopago'

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin'

const accessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {

  throw new Error(
    'Falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno'
  )
}

const mercadoPagoClient =
  new MercadoPagoConfig({
    accessToken,
  })

const paymentClient =
  new Payment(
    mercadoPagoClient
  )

type ProductoPedido = {
  id: number
}

type Pedido = {
  id: number
  total: number
  estado: string
  productos: ProductoPedido[] | null
}

/*
  Mercado Pago llama a esta función
  mediante una solicitud POST.
*/
export async function POST(
  request: Request
) {

  try {

    const url =
      new URL(request.url)

    /*
      Dependiendo de la notificación,
      Mercado Pago puede enviar el ID:

      - en la URL: data.id
      - en el cuerpo: data.id
    */

    let body:
      | {
          type?: string
          topic?: string
          data?: {
            id?: string | number
          }
        }
      | null = null

    try {

      body = await request.json()

    } catch {

      /*
        Algunas pruebas pueden llegar
        sin un cuerpo JSON válido.
      */

      body = null
    }

    const tipoNotificacion =
      body?.type ||
      body?.topic ||
      url.searchParams.get('type') ||
      url.searchParams.get('topic')

    const paymentId =
      body?.data?.id ||
      url.searchParams.get('data.id') ||
      url.searchParams.get('id')

    /*
      Mercado Pago puede enviar eventos que
      no corresponden directamente a pagos.

      Los ignoramos y devolvemos 200 para indicar
      que la notificación fue recibida.
    */
    if (
      tipoNotificacion &&
      tipoNotificacion !== 'payment'
    ) {

      return Response.json({
        recibido: true,
        ignorado: true,
        motivo:
          'La notificación no corresponde a un pago',
      })
    }

    if (!paymentId) {

      /*
        Respondemos 200 porque algunos chequeos
        o simulaciones pueden no incluir un ID.
      */

      return Response.json({
        recibido: true,
        procesado: false,
        motivo:
          'La notificación no contiene un ID de pago',
      })
    }

    /*
      Consultamos el pago directamente en
      Mercado Pago.

      Nunca confiamos únicamente en el contenido
      recibido por el webhook.
    */

    const pago =
      await paymentClient.get({
        id: String(paymentId),
      })

    const estadoPago =
      pago.status

    /*
      Solo completamos la venta cuando
      Mercado Pago confirma "approved".
    */

    if (
      estadoPago !== 'approved'
    ) {

      return Response.json({
        recibido: true,
        procesado: false,
        paymentId:
          String(paymentId),
        estado:
          estadoPago,
      })
    }

    /*
      external_reference contiene el ID del pedido
      porque lo configuramos al crear la preferencia.
    */

    const pedidoId =
      Number(
        pago.external_reference
      )

    if (
      !Number.isInteger(pedidoId) ||
      pedidoId <= 0
    ) {

      console.error(
        'El pago aprobado no tiene un pedido válido:',
        {
          paymentId,
          externalReference:
            pago.external_reference,
        }
      )

      return Response.json(
        {
          error:
            'El pago no tiene una referencia de pedido válida',
        },
        {
          status: 400,
        }
      )
    }

    /*
      Obtenemos el pedido usando el cliente privado
      de Supabase, exclusivo del servidor.
    */

    const {
      data: pedido,
      error: errorPedido,
    } = await supabaseAdmin
      .from('pedidos')
      .select(`
        id,
        total,
        estado,
        productos
      `)
      .eq('id', pedidoId)
      .single<Pedido>()

    if (
      errorPedido ||
      !pedido
    ) {

      console.error(
        'No se encontró el pedido:',
        {
          pedidoId,
          errorPedido,
        }
      )

      return Response.json(
        {
          error:
            'No se encontró el pedido relacionado con el pago',
        },
        {
          status: 404,
        }
      )
    }

    /*
      Una misma notificación puede llegar más de una vez.

      Si el pedido ya está Pagado o en una etapa posterior,
      no repetimos las actualizaciones.
    */

    const estadosYaProcesados = [
      'Pagado',
      'Preparando',
      'Enviado',
      'Entregado',
    ]

    if (
      estadosYaProcesados.includes(
        pedido.estado
      )
    ) {

      return Response.json({
        recibido: true,
        procesado: true,
        repetido: true,
        pedidoId,
        estado:
          pedido.estado,
      })
    }

    /*
      Verificamos que el importe aprobado coincida
      con el total guardado en Supabase.
    */

    const importePagado =
      Number(
        pago.transaction_amount
      )

    const totalPedido =
      Number(
        pedido.total
      )

    if (
      !Number.isFinite(
        importePagado
      ) ||
      importePagado !==
        totalPedido
    ) {

      console.error(
        'El importe no coincide:',
        {
          pedidoId,
          importePagado,
          totalPedido,
        }
      )

      return Response.json(
        {
          error:
            'El importe del pago no coincide con el pedido',
        },
        {
          status: 400,
        }
      )
    }

    /*
      Extraemos los IDs de los productos incluidos
      en el pedido.
    */

    const productoIds =
      (
        pedido.productos || []
      )
        .map(
          (producto) =>
            Number(producto.id)
        )
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )

    if (
      productoIds.length === 0
    ) {

      console.error(
        'El pedido aprobado no contiene productos válidos:',
        pedidoId
      )

      return Response.json(
        {
          error:
            'El pedido no contiene productos válidos',
        },
        {
          status: 400,
        }
      )
    }

    /*
      Marcamos como vendidas las prendas
      incluidas en el pedido.
    */

    const {
      error:
        errorProductos,
    } = await supabaseAdmin
      .from('productos')
      .update({
        vendido: true,
      })
      .in(
        'id',
        productoIds
      )

    if (errorProductos) {

      console.error(
        'No se pudieron marcar los productos como vendidos:',
        errorProductos
      )

      return Response.json(
        {
          error:
            'No se pudieron actualizar los productos',
        },
        {
          status: 500,
        }
      )
    }

    /*
      Finalmente cambiamos el pedido a Pagado.
    */

    const {
      error:
        errorActualizarPedido,
    } = await supabaseAdmin
      .from('pedidos')
      .update({
        estado: 'Pagado',
      })
      .eq('id', pedidoId)

    if (
      errorActualizarPedido
    ) {

      console.error(
        'No se pudo actualizar el pedido:',
        errorActualizarPedido
      )

      /*
        Intentamos revertir los productos para evitar
        que queden vendidos mientras el pedido no figura
        como Pagado.
      */

      await supabaseAdmin
        .from('productos')
        .update({
          vendido: false,
        })
        .in(
          'id',
          productoIds
        )

      return Response.json(
        {
          error:
            'No se pudo actualizar el estado del pedido',
        },
        {
          status: 500,
        }
      )
    }

    console.log(
      `Pago aprobado. Pedido ${pedidoId} actualizado correctamente.`
    )

    return Response.json({
      recibido: true,
      procesado: true,
      pedidoId,
      paymentId:
        String(paymentId),
      estado:
        'Pagado',
      productosVendidos:
        productoIds,
    })

  } catch (error) {

    console.error(
      'ERROR EN WEBHOOK DE MERCADO PAGO:',
      error
    )

    return Response.json(
      {
        error:
          'Error interno procesando el webhook',
      },
      {
        status: 500,
      }
    )
  }
}

/*
  Esto permite abrir la dirección en el navegador
  y comprobar que la ruta existe.

  No procesa ningún pago.
*/
export async function GET() {

  return Response.json({
    activo: true,
    mensaje:
      'Webhook de Mercado Pago disponible',
  })
}