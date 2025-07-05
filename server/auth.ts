import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { sendEmail, generatePasswordResetEmail } from './email';
import type { 
  RegisterData, 
  LoginData, 
  ForgotPasswordData, 
  ResetPasswordData,
  ChangePasswordData,
  User 
} from '@shared/schema';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate secure token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate user ID
export function generateUserId(): string {
  return nanoid();
}

// Register new user
export async function registerUser(userData: RegisterData): Promise<{ user: User; message: string }> {
  // Check if username already exists
  const existingUserByUsername = await storage.getUserByUsername(userData.username);
  if (existingUserByUsername) {
    throw new Error('Username already exists');
  }

  // Check if email already exists
  const existingUserByEmail = await storage.getUserByEmail(userData.email);
  if (existingUserByEmail) {
    throw new Error('Email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Create user
  const user = await storage.createUser({
    id: generateUserId(),
    username: userData.username,
    email: userData.email,
    passwordHash,
    firstName: userData.firstName,
    lastName: userData.lastName,
  });

  // No email verification needed for salon use - account is immediately active

  return {
    user,
    message: 'Registration successful! You can now sign in to your account.',
  };
}

// Login user
export async function loginUser(loginData: LoginData): Promise<{ user: User; message: string }> {
  // Find user by username
  const user = await storage.getUserByUsername(loginData.username);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(loginData.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid username or password');
  }

  return {
    user,
    message: 'Login successful!',
  };
}

// Request password reset with email delivery
export async function requestPasswordReset(forgotData: ForgotPasswordData): Promise<{ message: string; resetToken?: string }> {
  const user = await storage.getUserByEmail(forgotData.email);
  if (!user) {
    throw new Error('No account found with this email address');
  }

  // Generate reset token
  const resetToken = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await storage.createPasswordResetToken({
    userId: user.id,
    token: resetToken,
    expiresAt,
  });

  try {
    // Send email using Brevo
    const emailOptions = generatePasswordResetEmail(resetToken, user.email);
    await sendEmail(emailOptions);
    
    console.log(`Password reset email sent to: ${user.email}`);
    
    return {
      message: 'Password reset link has been sent to your email address. Please check your inbox.',
    };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    
    // Fallback to console logging if email fails
    console.log(`\n=== PASSWORD RESET FALLBACK ===`);
    console.log(`User: ${user.username} (${user.email})`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: /auth?token=${resetToken}`);
    console.log(`Expires: ${expiresAt.toLocaleString()}`);
    console.log(`===============================\n`);
    
    return {
      message: 'Email service temporarily unavailable. Please contact your administrator for password reset assistance.',
      resetToken: resetToken, // Return token for admin assistance
    };
  }
}

// Reset password
export async function resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
  // Find valid reset token
  const resetToken = await storage.getPasswordResetToken(resetData.token);
  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const passwordHash = await hashPassword(resetData.password);

  // Update user password
  await storage.updateUserPassword(resetToken.userId, passwordHash);

  // Delete used token
  await storage.deletePasswordResetToken(resetToken.id);

  return {
    message: 'Password reset successfully! You can now login with your new password.',
  };
}

// Change password (for logged-in users)
export async function changePassword(userId: string, changeData: ChangePasswordData): Promise<{ message: string }> {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValidPassword = await verifyPassword(changeData.currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await hashPassword(changeData.newPassword);

  // Update password
  await storage.updateUserPassword(userId, passwordHash);

  return {
    message: 'Password changed successfully!',
  };
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Get current user middleware
export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (session?.userId) {
    try {
      const user = await storage.getUser(session.userId);
      if (user) {
        // Remove password hash from user object
        const { passwordHash, ...safeUser } = user;
        req.user = safeUser;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'passwordHash'>;
    }
  }
  namespace Express {
    interface Session {
      userId?: string;
    }
  }
}