import {
  createHmac,
  timingSafeEqual,
} from 'node:crypto'

import {
  MercadoPagoConfig,
  Payment,
} from 'mercadopago'

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin'

/*
  Este webhook necesita el entorno Node.js
  porque utiliza node:crypto.
*/
export const runtime = 'nodejs'

const accessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {

  throw new Error(
    'Falta MERCADOPAGO_ACCESS_TOKEN'
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

type WebhookBody = {
  type?: string
  topic?: string
  action?: string

  data?: {
    id?: string | number
  }
}

/*
  Valida manualmente la firma enviada
  por Mercado Pago.

  El encabezado x-signature tiene una
  estructura parecida a:

  ts=1704908010,v1=firma_generada
*/
function validarFirmaWebhook({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: {
  xSignature: string
  xRequestId: string
  dataId: string
  secret: string
}) {

  const partesFirma =
    xSignature
      .split(',')
      .map(
        (parte) =>
          parte.trim()
      )

  const timestamp =
    partesFirma
      .find(
        (parte) =>
          parte.startsWith('ts=')
      )
      ?.slice(3)

  const firmaRecibida =
    partesFirma
      .find(
        (parte) =>
          parte.startsWith('v1=')
      )
      ?.slice(3)

  if (
    !timestamp ||
    !firmaRecibida
  ) {

    return false
  }

  /*
    Una firma SHA-256 en hexadecimal debe
    contener exactamente 64 caracteres.
  */
  if (
    !/^[a-f0-9]{64}$/i.test(
      firmaRecibida
    )
  ) {

    return false
  }

  /*
    Mercado Pago indica que data.id debe
    normalizarse a minúsculas cuando sea
    alfanumérico.
  */
  const dataIdNormalizado =
    dataId.toLowerCase()

  const manifiesto =
    `id:${dataIdNormalizado};request-id:${xRequestId};ts:${timestamp};`

  const firmaEsperada =
    createHmac(
      'sha256',
      secret
    )
      .update(manifiesto)
      .digest('hex')

  const bufferRecibido =
    Buffer.from(
      firmaRecibida,
      'hex'
    )

  const bufferEsperado =
    Buffer.from(
      firmaEsperada,
      'hex'
    )

  if (
    bufferRecibido.length !==
    bufferEsperado.length
  ) {

    return false
  }

  /*
    timingSafeEqual evita comparar las firmas
    con una operación vulnerable a ataques
    basados en diferencias de tiempo.
  */
  return timingSafeEqual(
    bufferRecibido,
    bufferEsperado
  )
}

export async function POST(
  request: Request
) {

  try {

    const webhookSecret =
      process.env
        .MERCADOPAGO_WEBHOOK_SECRET

    if (!webhookSecret) {

      console.error(
        'Falta MERCADOPAGO_WEBHOOK_SECRET'
      )

      return Response.json(
        {
          error:
            'El webhook no está configurado correctamente',
        },
        {
          status: 500,
        }
      )
    }

    const url =
      new URL(request.url)

    /*
      Datos enviados por Mercado Pago
      para autenticar la notificación.
    */

    const xSignature =
      request.headers.get(
        'x-signature'
      )

    const xRequestId =
      request.headers.get(
        'x-request-id'
      )

    /*
      Mercado Pago normalmente envía el
      identificador como data.id en la URL.
    */

    const dataIdQuery =
      url.searchParams.get(
        'data.id'
      )

    /*
      Leemos también el cuerpo porque allí
      suelen venir type, action y data.id.
    */

    let body:
      | WebhookBody
      | null = null

    try {

      body =
        await request.json()

    } catch {

      body = null
    }

    const dataIdBody =
      body?.data?.id !== undefined

        ? String(
            body.data.id
          )

        : null

    /*
      Compatibilidad con distintos formatos
      de notificación de Mercado Pago.
    */

    const paymentId =
      dataIdQuery ||
      dataIdBody ||
      url.searchParams.get('id')

    const dataIdFirma =
      dataIdQuery ||
      dataIdBody ||
      url.searchParams.get('id')

    if (
      !xSignature ||
      !xRequestId ||
      !dataIdFirma
    ) {

      console.error(
        'Notificación sin datos suficientes para validar la firma:',
        {
          tieneFirma:
            Boolean(xSignature),

          tieneRequestId:
            Boolean(xRequestId),

          tieneDataId:
            Boolean(dataIdFirma),
        }
      )

      return Response.json(
        {
          error:
            'Notificación sin firma válida',
        },
        {
          status: 401,
        }
      )
    }

    /*
      VALIDACIÓN DE LA FIRMA
    */

    const firmaValida =
      validarFirmaWebhook({
        xSignature,
        xRequestId,
        dataId:
          dataIdFirma,
        secret:
          webhookSecret,
      })

    if (!firmaValida) {

      console.error(
        'Firma inválida recibida en el webhook'
      )

      return Response.json(
        {
          error:
            'Firma inválida',
        },
        {
          status: 401,
        }
      )
    }

    /*
      Desde este punto sabemos que la firma
      de la notificación es válida.
    */

    const tipoNotificacion =
      body?.type ||
      body?.topic ||
      url.searchParams.get('type') ||
      url.searchParams.get('topic')

    /*
      Solo procesamos notificaciones de pago.
    */

    if (
      tipoNotificacion &&
      tipoNotificacion !== 'payment'
    ) {

      return Response.json({
        recibido: true,
        firmaValida: true,
        ignorado: true,
        motivo:
          'El evento no corresponde a un pago',
      })
    }

    if (!paymentId) {

      return Response.json({
        recibido: true,
        firmaValida: true,
        procesado: false,
        motivo:
          'La notificación no contiene un ID de pago',
      })
    }

    /*
      No confiamos únicamente en el cuerpo
      de la notificación.

      Consultamos el pago directamente en
      Mercado Pago con nuestro Access Token.
    */

    let pago

    try {

      pago =
        await paymentClient.get({
          id:
            String(paymentId),
        })

    } catch (error) {

      /*
        El simulador puede utilizar un ID
        ficticio que no representa un pago real.

        Como la firma ya fue validada,
        respondemos 200 para confirmar
        que recibimos correctamente la prueba.
      */

      console.error(
        'No se pudo consultar el pago:',
        {
          paymentId:
            String(paymentId),

          error,
        }
      )

      return Response.json({
        recibido: true,
        firmaValida: true,
        procesado: false,
        motivo:
          'No se encontró un pago real para procesar',
      })
    }

    /*
      Solo completamos la venta cuando
      Mercado Pago confirma approved.
    */

    if (
      pago.status !== 'approved'
    ) {

      return Response.json({
        recibido: true,
        firmaValida: true,
        procesado: false,
        paymentId:
          String(paymentId),
        estado:
          pago.status,
      })
    }

    /*
      external_reference contiene el ID
      del pedido guardado en Supabase.
    */

    const pedidoId =
      Number(
        pago.external_reference
      )

    if (
      !Number.isInteger(
        pedidoId
      ) ||
      pedidoId <= 0
    ) {

      console.error(
        'Pago aprobado sin pedido válido:',
        {
          paymentId:
            String(paymentId),

          externalReference:
            pago.external_reference,
        }
      )

      return Response.json(
        {
          error:
            'Referencia de pedido inválida',
        },
        {
          status: 400,
        }
      )
    }

    /*
      Buscamos el pedido relacionado.
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
      .eq(
        'id',
        pedidoId
      )
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
            'No se encontró el pedido relacionado',
        },
        {
          status: 404,
        }
      )
    }

    /*
      Mercado Pago puede repetir una
      notificación.

      Si el pedido ya fue procesado,
      no volvemos a modificarlo.
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
        firmaValida: true,
        procesado: true,
        repetido: true,
        pedidoId,
        estado:
          pedido.estado,
      })
    }

    /*
      Comprobamos que el importe aprobado
      coincida con el total del pedido.
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
            'El importe pagado no coincide con el pedido',
        },
        {
          status: 400,
        }
      )
    }

    /*
      Obtenemos los identificadores de
      las prendas incluidas en el pedido.
    */

    const productoIds =
      (
        pedido.productos || []
      )
        .map(
          (producto) =>
            Number(
              producto.id
            )
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
        'El pedido no contiene productos válidos:',
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
      error: errorProductos,
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
        'Error marcando productos como vendidos:',
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
      Actualizamos el pedido a Pagado.
    */

    const {
      error:
        errorActualizarPedido,
    } = await supabaseAdmin
      .from('pedidos')
      .update({
        estado: 'Pagado',
      })
      .eq(
        'id',
        pedidoId
      )

    if (
      errorActualizarPedido
    ) {

      console.error(
        'Error actualizando el pedido:',
        errorActualizarPedido
      )

      /*
        Intentamos revertir el cambio de
        los productos si falla el pedido.
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
            'No se pudo actualizar el pedido',
        },
        {
          status: 500,
        }
      )
    }

    console.log(
      `Pedido ${pedidoId} pagado correctamente`
    )

    return Response.json({
      recibido: true,
      firmaValida: true,
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
  Permite comprobar desde el navegador
  que la ruta está disponible.

  No procesa pagos.
*/

export async function GET() {

  return Response.json({
    activo: true,
    mensaje:
      'Webhook de Mercado Pago disponible',
  })
}