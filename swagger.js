const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuración del swagger
// Usar BASE_URL si está definida (p. ej. en Render) o URL relativa '/' para hacer llamadas
// relativas al host donde se sirve la UI (evita problemas de CORS cuando accedes desde otro dispositivo).
const serverUrl = process.env.BASE_URL || '/';
const swaggerDefinition = {
  openapi: '3.0.0',
  info:{
    title:'Documentacion de la API',
    version:'1.0.0',
    description:'Documentacion de la API Swagger'
  },
  servers: [
    {
      url: serverUrl,
      description: 'Servidor'
    }
  ]
};

const options ={
  swaggerDefinition,
  apis:['./Routes/*.js'],
}

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app){
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;