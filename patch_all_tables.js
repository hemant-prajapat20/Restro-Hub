import fs from 'fs';
import path from 'path';

const tablesFile = path.resolve('Frontend/src/views/businessAdmin/Tables.tsx');
let content = fs.readFileSync(tablesFile, 'utf8');

// 1. Imports
const importsOld = `import { Table, TableStatus, MenuItem } from '../types';
import { generateReceiptPDF } from '../utils/pdfGenerator';`;
const importsNew = `import { Table, TableStatus, MenuItem } from '../types';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';`;
content = content.replace(importsOld, importsNew);

// 2. State hooks
const stateOld = `  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [activeFloor, setActiveFloor] = useState(1);`;
const stateNew = `  const [activeFloor, setActiveFloor] = useState(1);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableIdentifier, setNewTableIdentifier] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableFloor, setNewTableFloor] = useState(1);
  
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [newResName, setNewResName] = useState('');
  const [newResPhone, setNewResPhone] = useState('');
  const [newResGuests, setNewResGuests] = useState(2);
  const [newResTime, setNewResTime] = useState('19:00');
  const [newResFloor, setNewResFloor] = useState(1);
  const [newResTableNum, setNewResTableNum] = useState('');

  const queryClient = useQueryClient();

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await api.get('/tables');
      return res.data;
    }
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const res = await api.get('/reservations');
      return res.data;
    }
  });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/reservations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setShowAddReservationModal(false);
      setNewResName('');
      setNewResPhone('');
      toast.success('Reservation Added');
    }
  });

  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => await api.patch(\`/reservations/\${id}/status\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation Updated');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => await api.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings Updated');
    }
  });

  const addTableMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/tables', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table Added');
    }
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => await api.put(\`/tables/\${id}/status\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const clearTableMutation = useMutation({
    mutationFn: async (id: string) => await api.post(\`/tables/\${id}/clear\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table Cleared');
      setSelectedTable(null);
    }
  });`;
content = content.replace(stateOld, stateNew);

// 3. Update Table Status usage (replace setTables usage)
const updateStatusOld = `  const updateTableStatus = (id: string, status: TableStatus) => {
    setTables(tables.map(t => t.id === id ? { ...t, status } : t));
    if (selectedTable?.id === id) {
      setSelectedTable({ ...selectedTable, status });
    }
  };`;
const updateStatusNew = `  const updateTableStatus = (id: string, status: TableStatus) => {
    updateTableStatusMutation.mutate({ id, status });
    if (selectedTable?._id === id) {
      setSelectedTable({ ...selectedTable, status });
    }
  };`;
content = content.replace(updateStatusOld, updateStatusNew);

const clearTableOld = `  const clearTable = (id: string) => {
    setTables(tables.map(t => t.id === id ? { ...t, status: 'Available', currentOrder: undefined } : t));
    setSelectedTable(null);
  };`;
const clearTableNew = `  const clearTable = (id: string) => {
    clearTableMutation.mutate(id);
  };`;
content = content.replace(clearTableOld, clearTableNew);

// 4. Update the "Add Table" Button
const addTableBtnOld = `<button className="px-5 py-2.5 bg-brand-primary text-white rounded-2xl text-xs font-semibold hover:bg-brand-primary/90 transition-all uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} /> Add Table
         </button>`;
const addTableBtnNew = `<button onClick={() => setShowAddTableModal(true)} className="px-5 py-2.5 bg-brand-primary text-white rounded-2xl text-xs font-semibold hover:bg-brand-primary/90 transition-all uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} /> Add Table
         </button>`;
content = content.replace(addTableBtnOld, addTableBtnNew);

// 5. Update Map table ids
content = content.replace(/t\.id/g, 't._id');

// 6. Fix "Advanced Reservations" section
const resSectionOld = `<div className="flex items-center justify-between mb-8">
               <h4 className="text-xl font-black font-display uppercase tracking-tight text-slate-800">Advanced Reservations</h4>
               <button className="px-6 py-2.5 bg-slate-50 text-slate-500 rounded-2xl text-xs font-black border border-slate-100 hover:bg-slate-100 transition-all uppercase tracking-widest">View Archives</button>
            </div>
            <div className="space-y-4">
               {[
                 { name: 'Amit Sharma', guests: 4, time: '19:30', phone: '+91 98XXX XXX54', status: 'Confirmed' },
                 { name: 'Priya Verma', guests: 2, time: '20:15', phone: '+91 88XXX XXX12', status: 'Awaiting' },
                 { name: 'Dr. Mehra', guests: 8, time: '21:00', phone: '+91 70XXX XXX99', status: 'Delayed' },
               ].map((res) => (
                 <div key={res.name} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-brand-primary text-sm border border-slate-100">
                       {res.time}
                    </div>
                    <div className="flex-1">
                       <h6 className="font-bold text-slate-900 group-hover:text-brand-accent transition-colors">{res.name}</h6>
                       <p className="text-xs text-slate-500 font-medium">{res.phone} • {res.guests} Guests</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={\`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider \${
                         res.status === 'Confirmed' ? 'bg-brand-success/10 text-brand-success' : 
                         res.status === 'Awaiting' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-danger/10 text-brand-danger'
                       }\`}>
                          {res.status}
                       </span>
                       <button className="p-3 bg-white text-slate-400 hover:text-brand-success rounded-xl shadow-sm border border-slate-100 transition-all">
                          <CheckCircle2 size={20} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>`;
            
const resSectionNew = `<div className="flex items-center justify-between mb-8">
               <h4 className="text-xl font-semibold font-display uppercase tracking-tight text-slate-800">Advanced Reservations</h4>
               <div className="flex gap-2">
                 <button onClick={() => setShowAddReservationModal(true)} className="px-6 py-2.5 bg-brand-accent text-white rounded-2xl text-xs font-semibold hover:bg-brand-accent/90 transition-all uppercase tracking-widest">Add Reservation</button>
                 <button className="px-6 py-2.5 bg-slate-50 text-slate-500 rounded-2xl text-xs font-semibold border border-slate-100 hover:bg-slate-100 transition-all uppercase tracking-widest">View Archives</button>
               </div>
            </div>
            <div className="space-y-4">
               {(reservations.length > 0 ? reservations : []).map((res: any) => (
                 <div key={res._id || res.name} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-semibold text-brand-primary text-sm border border-slate-100">
                       {res.time}
                    </div>
                    <div className="flex-1">
                       <h6 className="font-bold text-slate-900 group-hover:text-brand-accent transition-colors">{res.name}</h6>
                       <p className="text-xs text-slate-500 font-medium">{res.phone} • {res.guests} Guests {res.tableNumber ? \`• Table \${res.tableNumber}\` : ''} {res.floor ? \`• Floor \${res.floor}\` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={\`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider \${
                         res.status === 'Confirmed' ? 'bg-brand-success/10 text-brand-success' : 
                         res.status === 'Awaiting' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-danger/10 text-brand-danger'
                       }\`}>
                          {res.status}
                       </span>
                       {res.status !== 'Confirmed' && (
                         <button onClick={() => updateReservationMutation.mutate({ id: res._id, status: 'Confirmed' })} className="p-3 bg-white text-slate-400 hover:text-brand-success rounded-xl shadow-sm border border-slate-100 transition-all">
                            <CheckCircle2 size={20} />
                         </button>
                       )}
                    </div>
                 </div>
               ))}
               {reservations.length === 0 && (
                 <div className="text-center py-8 text-slate-400 font-semibold text-sm">No reservations found.</div>
               )}
            </div>`;

content = content.replace(resSectionOld, resSectionNew);


// 7. System Settings toggles
const sysOld = `<div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-200">Smart Mapping</p>
                        <p className="text-[10px] text-slate-400 font-bold">Auto-allocate sessions</p>
                     </div>
                     <div className="w-12 h-6 bg-brand-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-200">KDS Webhook</p>
                        <p className="text-[10px] text-slate-400 font-bold">Push updates to kitchen</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>`;
const sysNew = `<div onClick={() => updateSettingsMutation.mutate({ smartMapping: !settingsData?.smartMapping })} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">Smart Mapping</p>
                        <p className="text-[10px] text-slate-400 font-bold">Auto-allocate sessions</p>
                     </div>
                     <div className={\`w-12 h-6 rounded-full relative transition-colors \${settingsData?.smartMapping ? 'bg-brand-accent' : 'bg-white/10 border border-white/10'}\`}>
                        <div className={\`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all \${settingsData?.smartMapping ? 'right-1 bg-white' : 'left-1 bg-slate-400'}\`} />
                     </div>
                  </div>
                  <div onClick={() => updateSettingsMutation.mutate({ kdsWebhook: !settingsData?.kdsWebhook })} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">KDS Webhook</p>
                        <p className="text-[10px] text-slate-400 font-bold">Push updates to kitchen</p>
                     </div>
                     <div className={\`w-12 h-6 rounded-full relative transition-colors \${settingsData?.kdsWebhook ? 'bg-brand-accent' : 'bg-white/10 border border-white/10'}\`}>
                        <div className={\`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all \${settingsData?.kdsWebhook ? 'right-1 bg-white' : 'left-1 bg-slate-400'}\`} />
                     </div>
                  </div>`;
content = content.replace(sysOld, sysNew);

// 8. Add Modals at the end
const endOld = `      </div>
    </div>
  );
};`;
const endNew = `      </div>
      
      <AnimatePresence>
         {showAddTableModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                 onClick={() => setShowAddTableModal(false)}
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10"
               >
                  <h3 className="text-3xl font-semibold text-slate-900 mb-8">New Table</h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Table Identifier</label>
                        <input type="text" placeholder="e.g. 15, V1, T10" value={newTableIdentifier} onChange={e => setNewTableIdentifier(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-semibold text-xl" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Guest Capacity</label>
                        <select value={newTableCapacity} onChange={e => setNewTableCapacity(Number(e.target.value))} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-semibold text-xl">
                           <option value={2}>2 Seater</option>
                           <option value={4}>4 Seater</option>
                           <option value={6}>6 Seater</option>
                           <option value={8}>8 Seater (Royal)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Floor Assignment</label>
                        <div className="flex gap-2">
                           <button onClick={() => setNewTableFloor(1)} className={\`flex-1 py-4 \${newTableFloor===1 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'} rounded-2xl font-semibold text-xs uppercase tracking-widest\`}>Ground</button>
                           <button onClick={() => setNewTableFloor(2)} className={\`flex-1 py-4 \${newTableFloor===2 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'} rounded-2xl font-semibold text-xs uppercase tracking-widest\`}>Terrace</button>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-4 mt-10">
                     <button onClick={() => setShowAddTableModal(false)} className="flex-1 py-4 font-semibold text-slate-400">DISCARD</button>
                     <button 
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
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {showAddReservationModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                 onClick={() => setShowAddReservationModal(false)}
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
               >
                  <h3 className="text-2xl font-semibold text-slate-900 mb-8">New Reservation</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Customer Name</label>
                        <input type="text" value={newResName} onChange={e => setNewResName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg" />
                     </div>
                     <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Phone</label>
                        <input type="text" value={newResPhone} onChange={e => setNewResPhone(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg" />
                     </div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Floor</label>
                          <select value={newResFloor} onChange={e => setNewResFloor(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg">
                             <option value={1}>Ground</option>
                             <option value={2}>Terrace</option>
                          </select>
                       </div>
                       <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Seats</label>
                          <input type="number" min={1} value={newResGuests} onChange={e => setNewResGuests(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg" />
                       </div>
                     </div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Table Number</label>
                          <input type="text" value={newResTableNum} onChange={e => setNewResTableNum(e.target.value)} placeholder="e.g. T4" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg" />
                       </div>
                       <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Time</label>
                          <input type="time" value={newResTime} onChange={e => setNewResTime(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg" />
                       </div>
                     </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button onClick={() => setShowAddReservationModal(false)} className="flex-1 py-4 font-semibold text-slate-400">DISCARD</button>
                     <button 
                        onClick={() => {
                           if (!newResName || !newResPhone) return toast.error('Name and phone required');
                           createReservationMutation.mutate({ 
                             name: newResName, 
                             phone: newResPhone, 
                             guests: newResGuests, 
                             time: newResTime,
                             floor: newResFloor,
                             seats: newResGuests,
                             tableNumber: newResTableNum
                           });
                        }}
                        disabled={createReservationMutation.isPending}
                        className="flex-[2] py-4 bg-brand-accent text-white font-semibold rounded-2xl shadow-xl shadow-brand-accent/20"
                     >
                        {createReservationMutation.isPending ? 'ADDING...' : 'CONFIRM SEATING'}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};`;
content = content.replace(endOld, endNew);

content = content.replace(/font-black/g, 'font-semibold');

fs.writeFileSync(tablesFile, content);
console.log('Successfully patched all tables.');
