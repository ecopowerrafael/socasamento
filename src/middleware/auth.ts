import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'guia_fotografo_casamento_secure_jwt_key_2026';

export interface UserPayload {
  uid: string;
  id?: number | string;
  email: string;
  name?: string;
  role: 'admin' | 'super_admin' | 'photographer' | 'client' | string;
  photographerId?: string;
  studioName?: string;
  city?: string;
  state?: string;
  phone?: string;
  lastLoginAt?: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const signToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
};

// Helper to extract token from HttpOnly Cookie or Authorization header
export const getTokenFromReq = (req: Request): string | null => {
  if (req.cookies) {
    if (req.cookies.auth_token) return req.cookies.auth_token;
    if (req.cookies.token) return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split('Bearer ')[1];
  }
  return null;
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acesso não autorizado: Você precisa realizar o login para acessar este recurso.',
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Sessão inválida ou expirada. Por favor, faça login novamente.',
    });
  }

  req.user = user;
  return next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = getTokenFromReq(req);
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Sessão necessária. Efetue login para continuar.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado: Perfil "${req.user.role}" não possui autorização para esta área.`,
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['super_admin', 'admin']);
export const requirePhotographer = requireRole(['photographer', 'admin', 'super_admin']);
export const requirePhotographerOrAdmin = requireRole(['super_admin', 'admin', 'photographer']);

// Middleware to ensure a photographer can ONLY edit or access their own resources (unless admin)
export const requireOwnPhotographerData = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Sessão não encontrada.' });
  }

  // Admins have full cross-access
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }

  // Photographer profile check
  if (req.user.role === 'photographer') {
    const requestedPhotographerId = req.params.photographerId || req.body.photographerId || req.query.photographerId;
    if (requestedPhotographerId && requestedPhotographerId !== req.user.photographerId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso proibido: Um fotógrafo não pode visualizar ou alterar dados de outro fotógrafo.',
      });
    }
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Acesso negado. Apenas fotógrafos autorizados ou administradores têm permissão.',
  });
};

