const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//Configuracion del swagger
const serverUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const swaggerDefinition = {
  openapi: '3.0.0',
  info:{
    title:'Documentacion de la API',
    version:'1.0.0',
    description:'Documentacion de la API Swagger'
  },
  servers:[
    {
      url: serverUrl,
      description: 'Servidor'
    }
  ]
};

const options ={
  swaggerDefinition,
  //Paths to files (corregido a carpeta 'Routes')
  apis:['./Routes/*.js'],
}

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app){
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;