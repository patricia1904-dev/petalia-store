import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const preference = new Preference(client)

    const response = await preference.create({

      body: {

        items: body.items,

        back_urls: {

          success: 'http://localhost:3000/gracias',

          failure: 'http://localhost:3000/checkout',

          pending: 'http://localhost:3000/checkout',
        },

        
      },
    })

    return Response.json({
      id: response.id,
      init_point: response.init_point,
    })

  } catch (error) {

    console.log(error)

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