import { Request, Response } from 'express';
import Table from '../models/Table';
import { logMessage } from '../utils/messageLogger';

export const getTables = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const tables = await Table.find({ businessId }).sort({ number: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tables' });
  }
};

export const addTable = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { number, capacity, status, floor } = req.body;

    const newTable = new Table({
      businessId,
      number,
      capacity,
      status,
      floor
    });

    const savedTable = await newTable.save();
    await logMessage(businessId, 'system', 'Table Added', `Added new table: T-${savedTable.number}`, 'success');
    res.status(201).json(savedTable);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding table' });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const updatedTable = await Table.findOneAndUpdate(
      { _id: id, businessId },
      req.body,
      { new: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await logMessage(businessId, 'system', 'Table Updated', `Updated table: T-${updatedTable.number}`, 'info');
    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating table' });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { id } = req.params;

    const deletedTable = await Table.findOneAndDelete({ _id: id, businessId });

    if (!deletedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await logMessage(businessId, 'system', 'Table Removed', `Removed table: T-${deletedTable.number}`, 'warning');
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting table' });
  }
};

export const mergeTables = async (req: Request, res: Response) => {
  try {
    const businessId = (req as any).user.businessId;
    const { primaryTableId, secondaryTableIds } = req.body;

    if (!primaryTableId || !secondaryTableIds || !Array.isArray(secondaryTableIds)) {
      return res.status(400).json({ message: 'Invalid data for merging tables' });
    }

    // Update primary table to include linked tables
    const primaryTable = await Table.findOneAndUpdate(
      { _id: primaryTableId, businessId },
      { $addToSet: { linkedTables: { $each: secondaryTableIds } } },
      { new: true }
    );

    // Update secondary tables to status 'Merged'
    await Table.updateMany(
      { _id: { $in: secondaryTableIds }, businessId },
      { $set: { status: 'Merged' } }
    );

    // Emit event
    const io = req.app.get('io');
    if (io) {
      io.emit('tablesMerged', { primaryTableId, secondaryTableIds });
    }

    res.json(primaryTable);
  } catch (error) {
    res.status(500).json({ message: 'Server error merging tables' });
  }
};
