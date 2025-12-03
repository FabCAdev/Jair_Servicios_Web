function logErrors(err, req, res, next){
  console.error(err); // usar console.error en vez de console.log
  next(err); //al enviarle err entiende que es un middleware de error
}

function errorHandler(err, req, res, next){
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: err.message,
    // no enviar stack en producción
    ...(isProd ? {} : { stack: err.stack }),
  });
}

module.exports = {logErrors, errorHandler};
