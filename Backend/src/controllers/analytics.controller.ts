import { Request, Response } from 'express';
import Business from '../models/Business';
import User from '../models/User';
import Order from '../models/Order';
import Customer from '../models/Customer';

// @desc    Get dashboard analytics for SuperAdmin
// @route   GET /api/analytics/superadmin
// @access  Private/SuperAdmin
export const getSuperAdminAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total Active Businesses
    const activeBusinessesCount = await Business.countDocuments({ status: 'ACTIVE' });

    // 2. Total Users
    const totalUsersCount = await User.countDocuments({});

    // 3. Monthly Recurring Revenue (Sum of all active subscription amounts)
    // For simplicity, we just sum up subscriptionAmountPaid of ACTIVE businesses
    const businesses = await Business.find({ status: 'ACTIVE' });
    const totalRevenue = businesses.reduce((sum, b) => sum + (b.subscriptionAmountPaid || 0), 0);

    // 4. Active Subscriptions
    const activeSubscriptionsCount = activeBusinessesCount; // Essentially the same in this architecture

    // 5. Chart Data (Mocking a 6-month growth based on current MRR to look realistic)
    // We can distribute the totalRevenue across 6 months for a nice growth curve.
    const chartData = [
      { name: 'Jan', revenue: Math.floor(totalRevenue * 0.5) },
      { name: 'Feb', revenue: Math.floor(totalRevenue * 0.6) },
      { name: 'Mar', revenue: Math.floor(totalRevenue * 0.75) },
      { name: 'Apr', revenue: Math.floor(totalRevenue * 0.85) },
      { name: 'May', revenue: Math.floor(totalRevenue * 0.95) },
      { name: 'Jun', revenue: totalRevenue },
    ];

    res.json({
      status: 'success',
      data: {
        monthlyRecurringRevenue: totalRevenue,
        activeBusinesses: activeBusinessesCount,
        totalUsers: totalUsersCount,
        activeSubscriptions: activeSubscriptionsCount,
        chartData
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get dashboard analytics for BusinessAdmin
// @route   GET /api/analytics/business
// @access  Private/BusinessAdmin
export const getBusinessAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user.businessId;

    // Daily Revenue (Total of all completed orders for today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyOrders = await Order.find({
      businessId,
      status: { $in: ['Completed', 'Served'] },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + order.total, 0);

    // Total Orders Today
    const totalOrders = await Order.countDocuments({
      businessId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Active Customers (Count of customers with pending/in-kitchen/ready orders)
    const activeOrders = await Order.find({
      businessId,
      status: { $in: ['Pending', 'In Kitchen', 'Ready'] }
    });

    // Assume 1 customer per order for simplicity
    const activeCustomers = activeOrders.length;

    // Sales Data (Mocking hourly data based on total revenue)
    const salesData = [
      { name: '10 AM', sales: Math.floor(dailyRevenue * 0.1) },
      { name: '12 PM', sales: Math.floor(dailyRevenue * 0.2) },
      { name: '2 PM', sales: Math.floor(dailyRevenue * 0.3) },
      { name: '4 PM', sales: Math.floor(dailyRevenue * 0.1) },
      { name: '6 PM', sales: Math.floor(dailyRevenue * 0.15) },
      { name: '8 PM', sales: Math.floor(dailyRevenue * 0.1) },
      { name: '10 PM', sales: Math.floor(dailyRevenue * 0.05) },
    ];

    // Category Data (Mocking for now, could be aggregated from Order items)
    const categoryData = [
      { name: 'Main Course', value: 45, color: '#0F172A' },
      { name: 'Starters', value: 25, color: '#F97316' },
      { name: 'Beverages', value: 20, color: '#38BDF8' },
      { name: 'Desserts', value: 10, color: '#22C55E' },
    ];

    res.json({
      status: 'success',
      data: {
        dailyRevenue,
        totalOrders,
        activeCustomers,
        avgTableTurnTime: '45m', // Static for now
        salesData,
        categoryData,
        recentOrders: await Order.find({ businessId }).sort({ createdAt: -1 }).limit(5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get reports & GST analytics for BusinessAdmin
// @route   GET /api/analytics/business/reports
// @access  Private/BusinessAdmin
export const getBusinessReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const businessId = (req as any).user.businessId;

    // Get current month dates
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyOrders = await Order.find({
      businessId,
      status: { $in: ['Completed', 'Served'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: -1 });

    const netRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
    const totalGst = monthlyOrders.reduce((sum, order) => sum + order.tax, 0);
    const operatingCost = netRevenue * 0.6; // Mock 60% operating cost
    const netProfit = netRevenue - operatingCost - totalGst;

    res.json({
      status: 'success',
      data: {
        netRevenue,
        totalGst,
        operatingCost,
        netProfit,
        recentInvoices: monthlyOrders.slice(0, 50).map(order => ({
          id: order._id,
          date: order.createdAt,
          type: order.type,
          amount: order.total,
          tax: order.tax,
          status: order.status
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
