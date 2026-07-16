export const SITE_CONFIG = {

  // ============================
  // IDENTIDAD DE LA TIENDA
  // ============================

  nombre: 'Petalia Second Hand',

  descripcion:
    'Ropa de segunda mano con estilo único.',

  tituloNavegador:
    'Petalia Second Hand | Moda circular',

  empresa: {
    pais: 'Uruguay',
    codigoPais: 'UY',
    moneda: 'UYU',
    simboloMoneda: '$',
  },

  // ============================
  // CONTACTO
  // ============================

  whatsapp: '59897984793',

  whatsappVisible:
    '+598 97 984 793',

  contacto: {
    email: 'contacto@petalia.com',
  },

  // ============================
  // DATOS BANCARIOS
  // ============================

  banco: {
    institucion:
      'NOMBRE DEL BANCO',

    titular:
      'NOMBRE DEL TITULAR',

    cuenta:
      'NÚMERO DE CUENTA',

    moneda:
      'Pesos uruguayos',
  },

  // ============================
  // MÉTODOS DE ENVÍO
  // ============================

  metodosEnvio: [
    'DAC',
    'Mirtrans',
    'Retira en tienda',
  ],

  // ============================
  // MÉTODOS DE PAGO
  // ============================

  metodosPago: [
    {
      valor: 'MercadoPago',
      etiqueta: 'Mercado Pago',
    },

    {
      valor: 'Transferencia bancaria',
      etiqueta: 'Transferencia bancaria',
    },
  ],

  // ============================
  // DEPARTAMENTOS DE URUGUAY
  // ============================

  departamentos: [
    'Artigas',
    'Canelones',
    'Cerro Largo',
    'Colonia',
    'Durazno',
    'Flores',
    'Florida',
    'Lavalleja',
    'Maldonado',
    'Montevideo',
    'Paysandú',
    'Río Negro',
    'Rivera',
    'Rocha',
    'Salto',
    'San José',
    'Soriano',
    'Tacuarembó',
    'Treinta y Tres',
  ],

  // ============================
  // ESTADOS DE LOS PEDIDOS
  // ============================

  estadosPedido: [
    'Pendiente de transferencia',
    'Pendiente de pago',
    'Pagado',
    'Preparando',
    'Enviado',
    'Entregado',
    'Cancelado',
  ],

  estadosPedidoParaAtender: [
    'Pagado',
    'Preparando',
  ],

  estadosPedidoProcesados: [
    'Pagado',
    'Preparando',
    'Enviado',
    'Entregado',
  ],

  // ============================
  // MENSAJES DE LA APLICACIÓN
  // ============================

  mensajes: {

    pedidoRecibido:
      'Tu pedido fue recibido correctamente.',

    carritoVacio:
      'Tu carrito está vacío.',

    cargandoProductos:
      'Cargando productos...',

    preparandoCatalogo:
      'Estamos preparando el catálogo.',

    sinProductos:
      'No encontramos productos.',

    sinProductosFiltro:
      'Probá seleccionando otra sección.',

    errorProductos:
      'No pudimos cargar los productos. Revisá tu conexión e intentá nuevamente.',

    pedidoRegistrado:
      'Tu pedido ya quedó registrado en el sistema.',

    whatsappOpcional:
      'No es necesario comunicarte por WhatsApp para confirmarlo.',
  },

  // ============================
  // REDES SOCIALES
  // Se completarán más adelante
  // ============================

  redes: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },
} as const