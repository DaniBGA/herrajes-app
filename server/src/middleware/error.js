export function notFound(request, response) {
  response.status(404).json({ message: 'Ruta no encontrada' });
}

export function errorHandler(error, request, response, next) {
  // eslint-disable-line no-unused-vars
  console.error(error);
  response.status(error.statusCode || 500).json({
    message: error.message || 'Error interno del servidor'
  });
}
