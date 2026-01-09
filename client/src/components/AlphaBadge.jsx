import React from 'react';
import { FiShield } from 'react-icons/fi';

const AlphaBadge = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-yellow-600 px-2 py-0.5 mb-1 mt-2 w-fit rounded text-[10px] font-black uppercase tracking-wider ${className}`}>
      <FiShield size={10} className="fill-yellow-500/20" />
      ALPHA
    </div>
  );
};

export default AlphaBadge;