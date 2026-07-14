import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { Role } from '../models/User';
import SystemSettings from '../models/SystemSettings';
import Business from '../models/Business';

const generateToken = async (id: string): Promise<string> => {
  let expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  try {
    const settings = await SystemSettings.findOne();
    if (settings && settings.jwtExpirationTime) {
      if (settings.jwtExpirationTime === '24 Hours') expiresIn = '24h';
      else if (settings.jwtExpirationTime === '7 Days') expiresIn = '7d';
      else if (settings.jwtExpirationTime === '30 Days') expiresIn = '30d';
    }
  } catch (err) {
    console.error('Could not fetch JWT expiration settings', err);
  }

  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const registerSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (userExists) {
      if (userExists.email === email) {
        res.status(400).json({ status: 'error', message: 'User email already exists' });
      } else {
        res.status(400).json({ status: 'error', message: 'User phone number already exists' });
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      role: Role.SUPER_ADMIN,
    });

    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: await generateToken(user._id.toString()),
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const registerCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (userExists) {
      if (userExists.email === email) {
        res.status(400).json({ status: 'error', message: 'User email already exists' });
      } else {
        res.status(400).json({ status: 'error', message: 'User phone number already exists' });
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone,
      role: 'CUSTOMER', // Default to Customer
    });

    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: await generateToken(user._id.toString()),
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ status: 'error', message: 'Account has been deactivated' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    let businessData = null;
    if (user.businessId) {
      businessData = await Business.findById(user.businessId);
      if (businessData && businessData.status !== 'ACTIVE') {
        res.status(403).json({ status: 'error', message: 'Your business account has been suspended by the Super Admin.' });
        return;
      }
    }

    res.json({
      status: 'success',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        businessId: user.businessId,
        businessData,
        token: await generateToken(user._id.toString()),
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    let businessData = null;
    if (user.businessId) {
      businessData = await Business.findById(user.businessId);
    }

    res.json({
      status: 'success',
      data: {
        ...user.toObject(),
        businessData
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Generate and send OTP for Phone Login
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ status: 'error', message: 'Phone number is required' });
      return;
    }

    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User with this phone number not found' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ status: 'error', message: 'Account is deactivated' });
      return;
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // In a production environment, you would integrate Twilio or another SMS gateway here:
    // await smsService.send(phone, `Your Dine & Dusk login OTP is: ${otp}`);
    console.log(`[MOCK SMS] OTP for ${phone} is: ${otp}`);

    res.json({
      status: 'success',
      message: 'OTP sent successfully to your phone number'
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Verify OTP and Login
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ status: 'error', message: 'Phone and OTP are required' });
      return;
    }

    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired OTP' });
      return;
    }

    // Clear the OTP fields upon successful login
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    let businessData = null;
    if (user.businessId) {
      businessData = await Business.findById(user.businessId);
      if (businessData && businessData.status !== 'ACTIVE') {
        res.status(403).json({ status: 'error', message: 'Your business account has been suspended by the Super Admin.' });
        return;
      }
    }

    res.json({
      status: 'success',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        businessId: user.businessId,
        businessData,
        token: await generateToken(user._id.toString()),
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const secretLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { secretKey } = req.body;

    if (!secretKey) {
      res.status(400).json({ status: 'error', message: 'Secret key is required' });
      return;
    }

    // 1. Fetch System Settings from Database
    let settings = await SystemSettings.findOne();

    // If no settings exist yet in the database, auto-create them to set the default master key
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    // 2. Validate against Database Secret Key
    if (secretKey !== settings.masterSecretKey) {
      res.status(401).json({ status: 'error', message: 'Invalid secret key' });
      return;
    }

    // Find the first SUPER_ADMIN user
    let user = await User.findOne({ role: Role.SUPER_ADMIN });

    // If no Super Admin exists, auto-create the Owner account since they possess the Master Key
    if (!user) {
      const hashedPassword = await bcrypt.hash(secretKey, 10);
      user = await User.create({
        firstName: 'System',
        lastName: 'Owner',
        email: 'owner@dineandusk.com',
        passwordHash: hashedPassword,
        phone: '0000000000',
        role: Role.SUPER_ADMIN,
        isActive: true,
      });
    }

    res.json({
      status: 'success',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        businessId: user.businessId,
        token: await generateToken(user._id.toString()),
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateProfilePhoto = async (req: any, res: Response): Promise<void> => {
  try {
    const { profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    user.profilePhoto = profilePhoto;
    await user.save();

    res.json({
      status: 'success',
      message: 'Profile photo updated successfully',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
