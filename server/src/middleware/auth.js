import jwt from 'jsonwebtoken';

export function requireAuth(request, response, next) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return response.status(401).json({ message: 'Falta token de autenticación' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = payload;
    return next();
  } catch {
    return response.status(401).json({ message: 'Token inválido o vencido' });
  }
}
