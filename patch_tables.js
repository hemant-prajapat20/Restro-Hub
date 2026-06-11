import fs from 'fs';
import path from 'path';

const tablesFile = path.resolve('Frontend/src/views/businessAdmin/Tables.tsx');
let content = fs.readFileSync(tablesFile, 'utf8');

// Add imports
content = content.replace(
  "import { MOCK_TABLES, MOCK_MENU } from '../mockData';",
  "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\nimport api from '../../utils/api';\nimport toast from 'react-hot-toast';\nimport { MOCK_TABLES, MOCK_MENU } from '../../mockData';"
);

// We need to fix the mock data import path anyway
content = content.replace("import { Table, TableStatus, MenuItem } from '../types';", "import { Table, TableStatus, MenuItem } from '../../types';");
content = content.replace("import { generateReceiptPDF } from '../utils/pdfGenerator';", "import { generateReceiptPDF } from '../../utils/pdfGenerator';");


// Replace state initialization with React Query
const stateInitStr = `  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);`;

const queriesStr = `  const queryClient = useQueryClient();
  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response.data;
    }
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.put(\`/tables/\${id}\`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const mergeTablesMutation = useMutation({
    mutationFn: async (data: { primaryTableId: string, secondaryTableIds: string[] }) => {
      await api.post('/tables/merge', data);
    },
    onSuccess: () => {
      toast.success('Tables merged successfully');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const addTableMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/tables', data);
    },
    onSuccess: () => {
      toast.success('Table added successfully');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      // Reset form handled in component
    },
    onError: () => toast.error('Failed to add table')
  });

  const addOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/orders', data);
    }
  });

  const handleMergePrompt = (tableId: string) => {
    const tableNumToMerge = prompt('Enter the table number to merge into this one (e.g. T2):');
    if (tableNumToMerge) {
      const secondary = tables.find(t => t.number === tableNumToMerge.trim() || t.number === tableNumToMerge.trim().toUpperCase());
      if (secondary) {
        mergeTablesMutation.mutate({
          primaryTableId: tableId,
          secondaryTableIds: [secondary.id || (secondary as any)._id]
        });
      } else {
        toast.error('Table not found');
      }
    }
  };

  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);`;

content = content.replace(stateInitStr, queriesStr);

// Replace selectedTable to handle _id
content = content.replace(
  "const selectedTable = tables.find(t => t.id === selectedTableId) || null;",
  "const selectedTable = tables.find(t => t.id === selectedTableId || (t as any)._id === selectedTableId) || null;"
);

// Replace addToTableOrder logic
const addToOrderOld = `  // Adding item to order
  const addToTableOrder = (tableId: string, menuItem: MenuItem) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId && (t.status === 'Available' || t.status === 'Reserved' || t.status === 'Cleaning')) {
        return { ...t, status: 'Occupied' };
      }
      return t;
    }));

    setTableOrders(prev => {`;

const addToOrderNew = `  // Adding item to order
  const addToTableOrder = (tableId: string, menuItem: MenuItem) => {
    const table = tables.find(t => t.id === tableId || (t as any)._id === tableId);
    if (table && (table.status === 'Available' || table.status === 'Reserved' || table.status === 'Cleaning')) {
      updateTableMutation.mutate({ id: tableId, data: { status: 'Occupied' } });
    }

    addOrderMutation.mutate({
      type: 'POS',
      tableId: table ? (table.id || (table as any)._id) : tableId,
      items: [{
        menuItem: menuItem.id || (menuItem as any)._id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
        status: 'In Kitchen'
      }],
      subtotal: menuItem.price,
      tax: menuItem.price * 0.05,
      total: menuItem.price * 1.05,
      status: 'Pending'
    });

    setTableOrders(prev => {`;

content = content.replace(addToOrderOld, addToOrderNew);

// Replace setTableStatus
content = content.replace(
  "  const setTableStatus = (tableId: string, status: TableStatus) => {\n    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));\n  };",
  "  const setTableStatus = (tableId: string, status: TableStatus) => {\n    updateTableMutation.mutate({ id: tableId, data: { status } });\n  };"
);

// Replace handleSettleAndClear status update
content = content.replace(
  "    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'Cleaning' } : t));",
  "    updateTableMutation.mutate({ id: tableId, data: { status: 'Cleaning' } });"
);

// Replace MOCK_MENU with React Query
const menuMockStr = `  const filteredMenuItems = MOCK_MENU.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });`;

const menuQueryStr = `  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const response = await api.get('/menu');
      return response.data;
    }
  });

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });`;

content = content.replace(menuMockStr, menuQueryStr);

// Add loading state UI
content = content.replace(
  "  return (\n    <div className=\"p-8 space-y-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar\">\n      <div className=\"flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-soft\">",
  "  if (isLoading) return <div className=\"flex items-center justify-center h-full\"><div className=\"w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin\"></div></div>;\n\n  return (\n    <div className=\"p-8 space-y-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar\">\n      <div className=\"flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-soft gap-4\">"
);

// Add merge button next to X button
const xBtnStr = `<button onClick={() => setSelectedTableId(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                       <X size={24} />
                    </button>`;

const mergeBtnStr = `<div className="flex items-center gap-2">
                       <button onClick={() => handleMergePrompt(selectedTable.id || (selectedTable as any)._id)} className="px-4 py-2 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white rounded-2xl font-semibold text-xs transition-all flex items-center gap-1.5">
                         <Layers size={14} /> Merge
                       </button>
                       <button onClick={() => setSelectedTableId(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                          <X size={24} />
                       </button>
                    </div>`;

content = content.replace(xBtnStr, mergeBtnStr);

// Add new table form state
content = content.replace(
  "  const [showAddTableModal, setShowAddTableModal] = useState(false);",
  "  const [showAddTableModal, setShowAddTableModal] = useState(false);\n  const [newTableIdentifier, setNewTableIdentifier] = useState('');\n  const [newTableCapacity, setNewTableCapacity] = useState(4);\n  const [newTableFloor, setNewTableFloor] = useState(1);"
);

// Waitlist / Add table bindings
// We will replace the static <button> DISCARD and <button> PROVISION TABLE
const provisionBtnStr = `<button onClick={() => setShowAddTableModal(false)} className="flex-[2] py-4 bg-brand-accent text-white font-semibold rounded-2xl shadow-xl shadow-brand-accent/20">PROVISION TABLE</button>`;

const newProvisionBtnStr = `<button 
          onClick={() => {
            if (!newTableIdentifier) return toast.error('Table Identifier is required');
             addTableMutation.mutate({
              number: newTableIdentifier,
                capacity: newTableCapacity,
               floor: newTableFloor,
                status: 'Available'
              });
             setShowAddTableModal(false);
             setNewTableIdentifier('');
               }}
                  disabled={addTableMutation.isPending}
                className="flex-[2] py-4 bg-brand-accent text-white font-semibold rounded-2xl shadow-xl shadow-brand-accent/20"
              >
                 {addTableMutation.isPending ? 'PROVISIONING...' : 'PROVISION TABLE'}
              </button>`;

content = content.replace(provisionBtnStr, newProvisionBtnStr);

// inputs bindings
content = content.replace(
  `<input type="text" placeholder="e.g. 15, V1, T10" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-semibold text-xl" />`,
  `<input type="text" placeholder="e.g. 15, V1, T10" value={newTableIdentifier} onChange={e => setNewTableIdentifier(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-semibold text-xl" />`
);

content = content.replace(
  `<select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-semibold text-xl">\n                           <option>2 Seater</option>\n                           <option>4 Seater</option>\n                           <option>6 Seater</option>\n                           <option>8 Seater (Royal)</option>\n                        </select>`,
  `<select value={newTableCapacity} onChange={e => setNewTableCapacity(Number(e.target.value))} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-semibold text-xl">\n                           <option value={2}>2 Seater</option>\n                           <option value={4}>4 Seater</option>\n                           <option value={6}>6 Seater</option>\n                           <option value={8}>8 Seater (Royal)</option>\n                        </select>`
);

content = content.replace(
  `<div className="flex gap-2">\n                           <button className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-semibold text-xs uppercase tracking-widest">Ground</button>\n                           <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-semibold text-xs uppercase tracking-widest">Terrace</button>\n                        </div>`,
  `<div className="flex gap-2">\n                           <button onClick={() => setNewTableFloor(1)} className={\`flex-1 py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest \${newTableFloor === 1 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'}\`}>Ground</button>\n                           <button onClick={() => setNewTableFloor(2)} className={\`flex-1 py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest \${newTableFloor === 2 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'}\`}>Terrace</button>\n                        </div>`
);

// Map table items to key
content = content.replace("key={table.id}", "key={table.id || (table as any)._id}");

fs.writeFileSync(tablesFile, content);
console.log('Successfully patched Tables.tsx');
