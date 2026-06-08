import React from 'react';
import { LifeBuoy, MessageSquare, Clock } from 'lucide-react';

export const Support: React.FC = () => {
  return (
    <div className="p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 font-display truncate">Support Tickets</h1>
        <p className="text-slate-500 mt-2 font-medium break-words">Handle inquiries and bugs from tenant businesses.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
           <LifeBuoy className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-2 truncate">Inbox Zero!</h3>
        <p className="text-slate-500 max-w-md mx-auto break-words">There are currently no open support tickets. Your platform is running smoothly and all tenants are happy.</p>
      </div>
    </div>
  );
};
