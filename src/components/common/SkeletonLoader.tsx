import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-6 w-32 bg-slate-700/60 rounded-md"></div>
      <div className="h-5 w-20 bg-slate-700/60 rounded-full"></div>
    </div>
    <div className="grid grid-cols-3 gap-4 py-2">
      <div className="space-y-2">
        <div className="h-4 w-16 bg-slate-700/60 rounded"></div>
        <div className="h-6 w-24 bg-slate-700/60 rounded"></div>
      </div>
      <div className="space-y-2 text-center">
        <div className="h-3 w-12 mx-auto bg-slate-700/60 rounded"></div>
        <div className="h-0.5 w-full bg-slate-700/60 my-2"></div>
      </div>
      <div className="space-y-2 text-right">
        <div className="h-4 w-16 ml-auto bg-slate-700/60 rounded"></div>
        <div className="h-6 w-24 ml-auto bg-slate-700/60 rounded"></div>
      </div>
    </div>
    <div className="h-10 w-full bg-slate-700/60 rounded-xl"></div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="w-full bg-slate-800/40 rounded-2xl border border-slate-700/50 p-4 animate-pulse space-y-3">
    <div className="h-8 bg-slate-700/50 rounded-lg w-full mb-4"></div>
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-12 bg-slate-700/30 rounded-lg w-full"></div>
    ))}
  </div>
);
