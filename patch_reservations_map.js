import fs from 'fs';
import path from 'path';

const tablesFile = path.resolve('Frontend/src/views/businessAdmin/Tables.tsx');
let content = fs.readFileSync(tablesFile, 'utf8');

const staticMapOld = `               {[
                 { name: 'Amit Sharma', guests: 4, time: '19:30', phone: '+91 98XXX XXX54', status: 'Confirmed' },
                 { name: 'Priya Verma', guests: 2, time: '20:15', phone: '+91 88XXX XXX12', status: 'Awaiting' },
                 { name: 'Dr. Mehra', guests: 8, time: '21:00', phone: '+91 70XXX XXX99', status: 'Delayed' },
               ].map((res) => (
                 <div key={res.name} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-semibold text-brand-primary text-sm border border-slate-100">
                       {res.time}
                    </div>
                    <div className="flex-1">
                       <h6 className="font-bold text-slate-900 group-hover:text-brand-accent transition-colors">{res.name}</h6>
                       <p className="text-xs text-slate-500 font-medium">{res.phone} • {res.guests} Guests</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={\`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider \${
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
               ))}`;

const dynamicMapNew = `               {(reservations.length > 0 ? reservations : []).map((res: any) => (
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
                         <button onClick={() => updateReservationMutation?.mutate({ id: res._id, status: 'Confirmed' })} className="p-3 bg-white text-slate-400 hover:text-brand-success rounded-xl shadow-sm border border-slate-100 transition-all">
                            <CheckCircle2 size={20} />
                         </button>
                       )}
                    </div>
                 </div>
               ))}
               {reservations.length === 0 && (
                 <div className="text-center py-8 text-slate-400 font-semibold text-sm">No reservations found.</div>
               )}`;

if (content.includes(staticMapOld)) {
  content = content.replace(staticMapOld, dynamicMapNew);
  fs.writeFileSync(tablesFile, content);
  console.log('Successfully replaced static reservations map.');
} else {
  console.log('Could not find static reservations map to replace.');
}
