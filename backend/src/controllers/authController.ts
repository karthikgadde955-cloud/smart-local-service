import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role, phone, businessName, bio, basePrice } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'CUSTOMER',
        phone,
        ...(role === 'PROVIDER'
          ? {
              providerProfile: {
                create: {
                  businessName: businessName || `${name}'s Services`,
                  bio: bio || 'Professional service provider',
                  basePrice: basePrice || 300,
                  verificationStatus: 'VERIFIED',
                },
              },
            }
          : {
              customerProfile: {
                create: {
                  defaultAddress: 'Bangalore, India',
                  latitude: 12.9716,
                  longitude: 77.5946,
                },
              },
            }),
      },
      include: {
        customerProfile: true,
        providerProfile: true,
      },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          customerProfile: user.customerProfile,
          providerProfile: user.providerProfile,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          customerProfile: user.customerProfile,
          providerProfile: user.providerProfile,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
}

export async function logout(req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        providerProfile: {
          include: {
            skills: true,
            providerServices: { include: { serviceCategory: true } },
            availabilities: true,
          },
        },
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { name, phone, avatarUrl, defaultAddress, latitude, longitude } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatarUrl && { avatarUrl }),
        customerProfile: {
          upsert: {
            create: {
              defaultAddress: defaultAddress || 'Bangalore, India',
              latitude: latitude || 12.9716,
              longitude: longitude || 77.5946,
            },
            update: {
              ...(defaultAddress && { defaultAddress }),
              ...(latitude && { latitude }),
              ...(longitude && { longitude }),
            },
          },
        },
      },
      include: {
        customerProfile: true,
        providerProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
