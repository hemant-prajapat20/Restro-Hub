import fs from 'fs';
import path from 'path';

const tablesFile = path.resolve('Frontend/src/views/businessAdmin/Tables.tsx');
let content = fs.readFileSync(tablesFile, 'utf8');

// Inject new state variables for floor and table number
const statesToFind = `  const [newResTime, setNewResTime] = useState('19:00');`;
const newStatesStr = `  const [newResTime, setNewResTime] = useState('19:00');
  const [newResFloor, setNewResFloor] = useState(1);
  const [newResTableNum, setNewResTableNum] = useState('');`;

if (content.includes(statesToFind) && !content.includes('newResFloor')) {
  content = content.replace(statesToFind, newStatesStr);
}

// Fix System Controls static block
const settingsOld = `<div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">Smart Mapping</p>
                        <p className="text-[10px] text-slate-400 font-bold">Auto-allocate sessions</p>
                     </div>
                     <div className="w-12 h-6 bg-brand-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">KDS Webhook</p>
                        <p className="text-[10px] text-slate-400 font-bold">Push updates to kitchen</p>
                     </div>
                     <div className="w-12 h-6 bg-slate-700 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                     </div>
                  </div>`;

const settingsNew = `<div onClick={() => updateSettingsMutation?.mutate({ smartMapping: !settingsData?.smartMapping })} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">Smart Mapping</p>
                        <p className="text-[10px] text-slate-400 font-bold">Auto-allocate sessions</p>
                     </div>
                     <div className={\`w-12 h-6 rounded-full relative transition-colors \${settingsData?.smartMapping ? 'bg-brand-accent' : 'bg-white/10 border border-white/10'}\`}>
                        <div className={\`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all \${settingsData?.smartMapping ? 'right-1 bg-white' : 'left-1 bg-slate-400'}\`} />
                     </div>
                  </div>
                  <div onClick={() => updateSettingsMutation?.mutate({ kdsWebhook: !settingsData?.kdsWebhook })} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                     <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-200">KDS Webhook</p>
                        <p className="text-[10px] text-slate-400 font-bold">Push updates to kitchen</p>
                     </div>
                     <div className={\`w-12 h-6 rounded-full relative transition-colors \${settingsData?.kdsWebhook ? 'bg-brand-accent' : 'bg-white/10 border border-white/10'}\`}>
                        <div className={\`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all \${settingsData?.kdsWebhook ? 'right-1 bg-white' : 'left-1 bg-slate-400'}\`} />
                     </div>
                  </div>`;

if (content.includes(settingsOld)) {
  content = content.replace(settingsOld, settingsNew);
}

// Inject Add Reservation Modal before the final div
const endOfFileTarget = `      </div>
    </div>
  );
};`;

const addResModal = `      </div>

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
                  <h3 className="text-2xl font-semibold text-slate-900 mb-8">New Reservation / Walk-in</h3>
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
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Seats (Guests)</label>
                          <input type="number" min={1} value={newResGuests} onChange={e => setNewResGuests(Number(e.target.value))} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-lg" />
                       </div>
                     </div>
                     <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2">Seat / Table Number</label>
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
                        disabled={createReservationMutation?.isPending}
                        className="flex-[2] py-4 bg-brand-accent text-white font-semibold rounded-2xl shadow-xl shadow-brand-accent/20"
                     >
                        {createReservationMutation?.isPending ? 'ADDING...' : 'CONFIRM SEATING'}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};`;

if (content.includes(endOfFileTarget) && !content.includes('showAddReservationModal && (')) {
  content = content.replace(endOfFileTarget, addResModal);
}

fs.writeFileSync(tablesFile, content);
console.log('Fixed Reservations modal and UI details');
