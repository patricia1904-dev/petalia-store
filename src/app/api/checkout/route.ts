import {
  MercadoPagoConfig,
  Preference,
} from 'mercadopago'

const accessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN

if (!accessToken) {

  throw new Error(
    'Falta MERCADOPAGO_ACCESS_TOKEN en .env.local'
  )
}

const client =
  new MercadoPagoConfig({
    accessToken,
  })

export async function POST(
  req: Request
) {

  try {

    const body = await req.json()

    const {
      items,
      pedidoId,
    } = body

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {

      return Response.json(
        {
          error:
            'El pedido no contiene productos',
        },
        {
          status: 400,
        }
      )
    }

    if (!pedidoId) {

      return Response.json(
        {
          error:
            'Falta el identificador del pedido',
        },
        {
          status: 400,
        }
      )
    }

    /*
      Obtiene automáticamente la dirección
      desde la cual se llamó a esta API.

      En la PC podría ser:
      http://localhost:3000

      Desde el celular podría ser:
      http://192.168.1.3:3000
    */
    const origin =
      new URL(req.url).origin

    const preference =
      new Preference(client)

    const response =
      await preference.create({

        body: {

          items,

          /*
            Relaciona el pago de Mercado Pago
            con el pedido de Supabase.
          */
          external_reference:
            String(pedidoId),

          back_urls: {

            success:
              `${origin}/gracias?pedido=${pedidoId}`,

            failure:
              `${origin}/checkout?resultado=fallido`,

            pending:
              `${origin}/checkout?resultado=pendiente`,
          },

          /*
            Si el pago es aprobado,
            Mercado Pago vuelve automáticamente
            a la página de agradecimiento.
          */
          auto_return: 'approved',
        },
      })

    return Response.json({

      id: response.id,

      init_point:
        response.init_point,
    })

  } catch (error) {

    console.error(
      'ERROR CREANDO CHECKOUT:',
      error
    )

    return Response.json(
      {
        error:
          'Error creando checkout',
      },
      {
        status: 500,
      }
    )
  }
}