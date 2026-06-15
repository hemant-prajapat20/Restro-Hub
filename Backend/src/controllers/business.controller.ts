import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Business, { BusinessModule, BusinessStatus } from '../models/Business';
import User, { Role } from '../models/User';
import ActivityLog from '../models/ActivityLog';
import mongoose from 'mongoose';
import { seedTemplateData } from '../utils/seedData';

// @desc    Create a new business and its admin user
// @route   POST /api/businesses
// @access  Private/SuperAdmin
export const createBusiness = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      businessName, 
      ownerFirstName, 
      ownerLastName, 
      ownerEmail, 
      ownerPassword, 
      ownerPhone,
      address,
      state,
      district,
      platforms,
      activeModules,
      subscriptionExpiry,
      subscriptionAmountPaid
    } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email: ownerEmail }, { phone: ownerPhone }] 
    }).session(session);
    
    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      if (userExists.email === ownerEmail) {
        res.status(400).json({ status: 'error', message: 'User email already exists' });
      } else {
        res.status(400).json({ status: 'error', message: 'User phone number already exists' });
      }
      return;
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ownerPassword, salt);

    // 3. Generate unique businessAdminCode
    // E.g., BA-XXXXXX where X is uppercase alphanumeric
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const businessAdminCode = `BA-${randomSuffix}`;

    // 4. Create Business Admin User
    const newAdmin = new User({
      firstName: ownerFirstName,
      lastName: ownerLastName,
      email: ownerEmail,
      passwordHash,
      phone: ownerPhone,
      role: Role.BUSINESS_ADMIN,
      businessAdminCode
    });
    
    await newAdmin.save({ session });

    // 5. Create Business
    const newBusiness = new Business({
      name: businessName,
      ownerId: newAdmin._id,
      contactEmail: ownerEmail,
      contactPhone: ownerPhone,
      address,
      state,
      district,
      platforms: platforms || [],
      subscriptionAmountPaid,
      activeModules: activeModules || [BusinessModule.POS],
      subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : new Date(),
      status: BusinessStatus.ACTIVE
    });

    await newBusiness.save({ session });

    // 5. Update Admin User with Business ID
    newAdmin.businessId = newBusiness._id as mongoose.Types.ObjectId;
    await newAdmin.save({ session });

    // 6. Log Activity
    const log = new ActivityLog({
      action: 'BUSINESS_REGISTERED',
      message: `New Business Admin registered: ${ownerFirstName} ${ownerLastName} for platform(s) ${platforms.join(', ')}`,
      type: 'success'
    });
    await log.save({ session });

    // 7. Seed template data for the new business
    await seedTemplateData(newBusiness._id as mongoose.Types.ObjectId, session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      message: 'Business and Admin User created successfully',
      data: {
        business: newBusiness,
        admin: {
          _id: newAdmin._id,
          email: newAdmin.email,
          role: newAdmin.role
        }
      }
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Private/SuperAdmin
export const getAllBusinesses = async (req: Request, res: Response): Promise<void> => {
  try {
    const businesses = await Business.find()
      .populate('ownerId', 'firstName lastName email phone isActive businessAdminCode')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: businesses.length,
      data: businesses
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update business details, plan, modules, or status
// @route   PUT /api/businesses/:id
// @access  Private/SuperAdmin
export const updateBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      platforms, 
      activeModules, 
      status,
      name,
      contactEmail,
      address,
      state,
      district,
      subscriptionExpiry,
      subscriptionAmountPaid
    } = req.body;

    const business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ status: 'error', message: 'Business not found' });
      return;
    }

    if (platforms) business.platforms = platforms;
    if (activeModules) business.activeModules = activeModules;
    if (status) business.status = status;
    if (name) business.name = name;
    if (contactEmail) business.contactEmail = contactEmail;
    if (address) business.address = address;
    if (state) business.state = state;
    if (district) business.district = district;
    if (subscriptionExpiry) business.subscriptionExpiry = new Date(subscriptionExpiry);
    if (subscriptionAmountPaid !== undefined) business.subscriptionAmountPaid = subscriptionAmountPaid;

    const updatedBusiness = await business.save();

    res.json({
      status: 'success',
      data: updatedBusiness
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all active businesses for public customer view
// @route   GET /api/businesses/public
// @access  Public
export const getPublicBusinesses = async (req: Request, res: Response): Promise<void> => {
  try {
    const businesses = await Business.find({ status: BusinessStatus.ACTIVE }).select('name address district state logoUrl activeModules');
    res.json({
      status: 'success',
      data: businesses
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update business logo (for BUSINESS_ADMIN)
// @route   PUT /api/businesses/me/logo
// @access  Private/BUSINESS_ADMIN
export const updateMyBusinessLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user || !user.businessId) {
      res.status(403).json({ status: 'error', message: 'Not authorized or no business associated' });
      return;
    }

    const { logoUrl } = req.body;
    const business = await Business.findById(user.businessId);

    if (!business) {
      res.status(404).json({ status: 'error', message: 'Business not found' });
      return;
    }

    business.logoUrl = logoUrl;
    await business.save();

    res.json({
      status: 'success',
      message: 'Business logo updated successfully',
      data: business
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
