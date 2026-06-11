import fs from 'fs';
import path from 'path';

const kdsFile = path.resolve('Frontend/src/views/businessAdmin/KDS.tsx');
let content = fs.readFileSync(kdsFile, 'utf8');

// Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { io } from 'socket.io-client';\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\nimport api from '../../utils/api';\nimport toast from 'react-hot-toast';"
);

// Remove mock imports
content = content.replace(
  "import { MOCK_ORDERS } from '../mockData';",
  ""
);

// Replace state initialization with React Query
const stateInitStr = `  const [orders, setOrders] = useState(MOCK_ORDERS.map(o => ({
    ...o,
    status: o.status as OrderStatus,
    completedItems: [] as string[]
  })));`;

const queriesStr = `  const queryClient = useQueryClient();
  const [completedItemsMap, setCompletedItemsMap] = useState<Record<string, string[]>>({});

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ['kdsOrders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data;
    },
    refetchInterval: 10000 
  });

  useEffect(() => {
    const backendUrl = (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(backendUrl);
    
    socket.on('newOrder', () => {
      queryClient.invalidateQueries({ queryKey: ['kdsOrders'] });
      toast.success('New order arrived in kitchen!');
    });

    socket.on('orderUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['kdsOrders'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const orders = rawOrders
    .filter((o: any) => o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Out for Delivery')
    .map((o: any) => ({
      id: o._id.toString().slice(-4).toUpperCase(),
      dbId: o._id,
      tableId: o.tableId?.name || (o.type === 'Delivery' ? 'DELIVERY' : 'TAKEAWAY'),
      type: o.type,
      status: o.status === 'Pending' ? 'New' : o.status === 'In Kitchen' ? 'Preparing' : o.status === 'Ready' ? 'Ready' : o.status,
      items: o.items.map((i: any) => ({ itemId: i._id || i.menuItem, name: i.name, quantity: i.quantity, notes: '' })),
      completedItems: completedItemsMap[o._id] || []
    }));

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      let backendStatus = status;
      if (status === 'New') backendStatus = 'Pending';
      if (status === 'Preparing') backendStatus = 'In Kitchen';
      if (status === 'Completed') backendStatus = 'Completed';
      
      await api.patch(\`/orders/\${id}/status\`, { status: backendStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kdsOrders'] });
    },
    onError: () => toast.error('Failed to update order status')
  });`;

content = content.replace(stateInitStr, queriesStr);

// Replace handleToggleItem
const handleToggleItemOld = `  const handleToggleItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const completed = order.completedItems.includes(itemId)
        ? order.completedItems.filter(id => id !== itemId)
        : [...order.completedItems, itemId];
      return { ...order, completedItems: completed };
    }));
  };`;

const handleToggleItemNew = `  const handleToggleItem = (orderDbId: string, itemId: string) => {
    setCompletedItemsMap(prev => {
      const current = prev[orderDbId] || [];
      const updated = current.includes(itemId) 
        ? current.filter(id => id !== itemId)
        : [...current, itemId];
      return { ...prev, [orderDbId]: updated };
    });
  };`;

content = content.replace(handleToggleItemOld, handleToggleItemNew);

// Fix handleToggleItem param to use dbId
content = content.replace("handleToggleItem(order.id, item.itemId)", "handleToggleItem(order.dbId, item.itemId)");

// Replace updateOrderStatus logic
const updateOrderStatusOld = `  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };`;

const updateOrderStatusNew = `  const updateOrderStatus = (orderDbId: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderDbId, status });
  };`;

content = content.replace(updateOrderStatusOld, updateOrderStatusNew);

// Fix updateOrderStatus param to use dbId
content = content.replace(/updateOrderStatus\(order\.id, /g, "updateOrderStatus(order.dbId, ");

fs.writeFileSync(kdsFile, content);
console.log('Successfully patched KDS.tsx');
