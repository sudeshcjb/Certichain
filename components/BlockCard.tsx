import React, { useState, useEffect } from 'react';
import { Block, CertificateData } from '../types';
import { calculateHash } from '../utils/crypto';
import { AlertTriangle, ShieldCheck, Edit, Save, ExternalLink, RefreshCcw, Link2Off, Hash, Award, Building, Calendar } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  prevBlock?: Block;
  isValid: boolean;
  onTamper: (index: number, newData: CertificateData) => void;
  onMine: (index: number) => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, prevBlock, isValid, onTamper, onMine }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CertificateData>(block.data);
  const [localHash, setLocalHash] = useState(block.hash);

  // Calculate hash visually to show if it mismatches the stored hash
  useEffect(() => {
    const updateLocalHash = async () => {
        const h = await calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce);
        setLocalHash(h);
    };
    updateLocalHash();
  }, [block]);

  // Sync editData when block data changes externally
  useEffect(() => {
    setEditData(block.data);
  }, [block.data]);

  const handleSave = () => {
    onTamper(block.index, editData);
    setIsEditing(false);
  };

  const handleIssuanceDateChange = (dateString: string) => {
      if (!dateString) return;
      try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
              setEditData({ ...editData, issuanceDate: date.toISOString() });
          }
      } catch (e) {
          console.error("Invalid date");
      }
  };

  const isHashValid = localHash === block.hash;
  const isLinkBroken = prevBlock ? prevBlock.hash !== block.previousHash : false;
  
  // A block is considered in error state if:
  // 1. The chain validation says it's invalid (passed via props) OR
  // 2. The previous hash pointer is broken OR
  // 3. The current hash doesn't match the data
  const isError = !isValid || isLinkBroken || !isHashValid;

  return (
    <div className={`
      group relative flex-shrink-0 w-[340px] rounded-2xl border-2 transition-all duration-300 ease-out transform
      ${isError 
        ? 'border-red-400 bg-red-50 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(239,68,68,0.5)]' 
        : block.isTampered 
            ? 'border-orange-300 bg-orange-50 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)]' 
            : 'border-slate-200 bg-white shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-blue-400'
      }
    `}>
      
      {/* Genesis Badge */}
      {block.isGenesis && (
          <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold tracking-widest rounded-full shadow-md z-20">
              GENESIS BLOCK
          </div>
      )}

      {/* Tampered Badge - Distinct Indicator */}
      {block.isTampered && !block.isGenesis && (
        <div className="absolute -top-3 right-6 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-20 flex items-center gap-1 border border-orange-400">
            <AlertTriangle size={10} className="text-white" /> DATA TAMPERED
        </div>
      )}

      {/* Card Header */}
      <div className={`px-5 py-4 flex justify-between items-center border-b ${isError ? 'border-red-100' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
               #{block.index.toString().padStart(3, '0')}
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {new Date(block.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
            </span>
        </div>
        
        <div className="flex space-x-2">
            {!block.isGenesis && (
                 <button 
                 onClick={() => setIsEditing(!isEditing)}
                 className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                 title="Simulate Attack (Edit Data)"
               >
                 {isEditing ? <span className="text-xs font-bold text-blue-600">CANCEL</span> : <Edit size={16} />}
               </button>
            )}
           <div title={isError ? "Block Invalid" : "Block Verified"}>
                {!isError ? (
                    <ShieldCheck size={20} className="text-emerald-500 drop-shadow-sm" />
                ) : (
                    <AlertTriangle size={20} className="text-red-500 animate-pulse drop-shadow-sm" />
                )}
           </div>
        </div>
      </div>

      {/* Card Body - Content */}
      <div className="p-5 space-y-4">
        {isEditing ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800 mb-2 flex gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>Modifying this data will invalidate the block hash and break the chain.</span>
                </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Student Name</label>
                    <input 
                        type="text" 
                        value={editData.studentName}
                        onChange={(e) => setEditData({...editData, studentName: e.target.value})}
                        className="w-full text-sm border p-2 rounded font-mono bg-white border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">University</label>
                    <input 
                        type="text" 
                        value={editData.university}
                        onChange={(e) => setEditData({...editData, university: e.target.value})}
                        className="w-full text-sm border p-2 rounded font-mono bg-white border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Degree</label>
                         <input 
                            type="text" 
                            value={editData.degree}
                            onChange={(e) => setEditData({...editData, degree: e.target.value})}
                            className="w-full text-sm border p-2 rounded font-mono bg-white border-blue-200 focus:outline-none"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">GPA</label>
                         <input 
                            type="text" 
                            value={editData.gpa}
                            onChange={(e) => setEditData({...editData, gpa: e.target.value})}
                            className="w-full text-sm border p-2 rounded font-mono bg-white border-blue-200 focus:outline-none"
                        />
                     </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Graduation</label>
                    <input 
                        type="date" 
                        value={editData.graduationDate}
                        onChange={(e) => setEditData({...editData, graduationDate: e.target.value})}
                        className="w-full text-sm border p-2 rounded font-mono bg-white border-blue-200 focus:outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Issuance</label>
                    <input 
                        type="datetime-local" 
                        value={editData.issuanceDate ? editData.issuanceDate.slice(0, 16) : ''}
                        onChange={(e) => handleIssuanceDateChange(e.target.value)}
                        className="w-full text-sm border p-2 rounded font-mono bg-white border-blue-200 focus:outline-none"
                    />
                 </div>
            </div>
        ) : (
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                    {block.data.studentName}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                    <Building size={12} className="text-slate-400" />
                    {block.data.university}
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium italic pt-1">
                    <Award size={12} />
                    {block.data.degree}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
                    <div className="text-xs">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">GPA</span>
                        <span className="font-mono text-slate-700 bg-slate-100 px-1.5 rounded inline-block">{block.data.gpa}</span>
                    </div>
                    <div className="text-xs">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Graduated</span>
                        <span className="font-mono text-slate-700">{block.data.graduationDate}</span>
                    </div>
                </div>
                 <div className="text-xs pt-2 flex items-center gap-2">
                    <Calendar size={12} className="text-slate-300" />
                    <span className="font-mono text-slate-400 text-[10px]">
                        Issued: {new Date(block.data.issuanceDate).toLocaleString()}
                    </span>
                </div>
            </div>
        )}
      </div>

      {/* Footer - Cryptography */}
      <div className={`
        px-5 py-4 text-[10px] font-mono border-t rounded-b-xl
        ${isError ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}
      `}>
        <div className="space-y-3">
            
            {/* Previous Hash */}
            <div className="relative group/hash">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Link2Off size={10} className={isLinkBroken ? "text-red-500" : "text-slate-300"} />
                        Prev Hash
                    </span>
                    {isLinkBroken && (
                        <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse">BROKEN LINK</span>
                    )}
                </div>
                
                <div className={`truncate p-1.5 rounded border transition-colors ${
                    isLinkBroken ? "bg-red-100 border-red-200 text-red-700 font-bold" : "bg-white border-slate-200 text-slate-500"
                }`}>
                    {block.previousHash}
                </div>

                {isLinkBroken && prevBlock && (
                     <div className="mt-1 pl-2 border-l-2 border-emerald-300">
                        <span className="block text-[9px] text-emerald-600 font-bold mb-0.5">EXPECTED:</span>
                        <div className="truncate text-emerald-600 font-bold opacity-75">
                            {prevBlock.hash}
                        </div>
                     </div>
                )}
            </div>

            {/* Current Hash */}
            <div>
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Hash size={10} className={!isHashValid ? "text-red-500" : "text-slate-300"} />
                        Block Hash
                    </span>
                    {!isHashValid && (
                        <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold">INVALID</span>
                    )}
                </div>
                <div className={`truncate p-1.5 rounded border transition-colors ${
                    !isHashValid ? "bg-red-100 border-red-200 text-red-700 font-bold" : "bg-white border-slate-200 text-slate-600 font-medium"
                }`}>
                    {block.hash}
                </div>
            </div>
            
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-200/50 mt-2">
                <span className="flex items-center gap-1">Nonce: <span className="text-slate-600">{block.nonce}</span></span>
                <a 
                    href={`https://blockexplorer.com/block/${block.hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:underline transition"
                >
                    Explorer <ExternalLink size={8} />
                </a>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
            {isEditing ? (
                <button 
                    onClick={handleSave}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform active:scale-95"
                >
                    <Save size={14} /> SAVE & TAMPER
                </button>
            ) : isError ? (
                <button 
                    onClick={() => onMine(block.index)}
                    className="w-full py-2.5 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-red-700 hover:shadow-lg transition-all animate-pulse hover:animate-none transform active:scale-95 shadow-red-200"
                >
                    <RefreshCcw size={14} /> RE-MINE (FIX CHAIN)
                </button>
            ) : null}
        </div>
      </div>

    </div>
  );
};

export default BlockCard;