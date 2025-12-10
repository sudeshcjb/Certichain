import React, { useState, useEffect } from 'react';
import { Block, CertificateData } from '../types';
import { calculateHash } from '../utils/crypto';
import { Link2, AlertTriangle, ShieldCheck, Edit, Save } from 'lucide-react';

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

  const handleDateChange = (dateString: string) => {
      if (!dateString) return; // Prevent crash on empty input
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
  // A block is "broken" in the chain view if the stored previousHash doesn't match the actual previous block's hash
  const isLinkBroken = prevBlock ? prevBlock.hash !== block.previousHash : false;
  const isError = !isValid || isLinkBroken || !isHashValid;

  return (
    <div className={`relative flex-shrink-0 w-80 p-4 rounded-xl border-2 transition-all duration-500 ${
      isError 
        ? 'border-red-500 bg-red-50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
        : block.isTampered 
            ? 'border-orange-400 bg-orange-50 shadow-md' 
            : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
    }`}>
      
      {/* Tampered Badge - Shows if data was manually edited, even if hash is valid (re-mined) */}
      {block.isTampered && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-20 flex items-center gap-1 whitespace-nowrap">
            <AlertTriangle size={10} /> DATA TAMPERED
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Block #{block.index}
        </span>
        <div className="flex space-x-2">
            {!block.isGenesis && (
                 <button 
                 onClick={() => setIsEditing(!isEditing)}
                 className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                 title="Simulate Attack (Tamper Data)"
               >
                 {isEditing ? <span className="text-xs font-bold text-blue-600">Cancel</span> : <Edit size={14} />}
               </button>
            )}
           {!isError ? (
             <ShieldCheck size={16} className="text-emerald-500" />
           ) : (
             <AlertTriangle size={16} className="text-red-500" />
           )}
        </div>
      </div>

      {/* Data Section */}
      <div className="space-y-3 mb-4">
        {isEditing ? (
            <div className="space-y-2">
                 <input 
                    type="text" 
                    value={editData.studentName}
                    onChange={(e) => setEditData({...editData, studentName: e.target.value})}
                    placeholder="Student Name"
                    className="w-full text-sm border p-1 rounded font-mono bg-yellow-50 border-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                 <input 
                    type="text" 
                    value={editData.university}
                    onChange={(e) => setEditData({...editData, university: e.target.value})}
                    placeholder="University"
                    className="w-full text-sm border p-1 rounded font-mono bg-yellow-50 border-yellow-300"
                />
                 <input 
                    type="text" 
                    value={editData.degree}
                    onChange={(e) => setEditData({...editData, degree: e.target.value})}
                    placeholder="Degree"
                    className="w-full text-sm border p-1 rounded font-mono bg-yellow-50 border-yellow-300"
                />
                 <input 
                    type="text" 
                    value={editData.gpa}
                    onChange={(e) => setEditData({...editData, gpa: e.target.value})}
                    placeholder="GPA"
                    className="w-full text-sm border p-1 rounded font-mono bg-yellow-50 border-yellow-300"
                />
                 <input 
                    type="date" 
                    value={editData.graduationDate}
                    onChange={(e) => setEditData({...editData, graduationDate: e.target.value})}
                    className="w-full text-sm border p-1 rounded font-mono bg-yellow-50 border-yellow-300"
                />
                 {/* Added Issuance Date Edit Field */}
                 <input 
                    type="datetime-local" 
                    value={editData.issuanceDate ? editData.issuanceDate.slice(0, 16) : ''}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full text-sm border p-1 rounded font-mono bg-yellow-50 border-yellow-300"
                />
                <button 
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-100 text-yellow-800 text-xs font-bold py-1 rounded hover:bg-yellow-200"
                >
                    <Save size={12} /> Inject Malicious Data
                </button>
            </div>
        ) : (
            <div className={`p-2 rounded text-sm space-y-1 ${block.isTampered && !isError ? 'bg-orange-100/50' : 'bg-slate-50'}`}>
                <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">Student</span>
                    <span className="font-medium text-slate-700">{block.data.studentName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">University</span>
                    <span className="font-medium text-slate-700 text-right truncate ml-2">{block.data.university}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">Degree</span>
                    <span className="font-medium text-slate-700">{block.data.degree}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">GPA</span>
                    <span className="font-medium text-slate-700">{block.data.gpa}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">Graduated</span>
                    <span className="font-medium text-slate-700">{block.data.graduationDate}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 mt-1">
                    <span className="text-slate-400 text-[10px]">Issued</span>
                    <span className="font-medium text-slate-500 text-[10px]">{new Date(block.data.issuanceDate).toLocaleString()}</span>
                </div>
            </div>
        )}
      </div>

      {/* Hash Details */}
      <div className="space-y-2 text-[10px] font-mono text-slate-500">
        <div>
          <div className="uppercase text-xs text-slate-400 mb-0.5">Previous Hash</div>
          <div className={`truncate p-1 rounded ${isLinkBroken ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-100'}`}>
            {block.previousHash}
          </div>
        </div>
        
        <div>
          <div className="uppercase text-xs text-slate-400 mb-0.5">Current Hash (Stored)</div>
          <div className="truncate bg-slate-100 p-1 rounded">{block.hash}</div>
        </div>
        
        {/* Visual cue for calculated vs stored */}
        {!isHashValid && (
             <div className="mt-1">
                <div className="uppercase text-xs text-red-500 mb-0.5">Calculated Hash (Actual)</div>
                <div className="truncate bg-red-100 text-red-800 p-1 rounded animate-pulse">
                    {localHash}
                </div>
                <div className="mt-2 text-center">
                    <button 
                        onClick={() => onMine(block.index)}
                        className="w-full py-1 px-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Re-Mine (Fix Hash)
                    </button>
                </div>
           </div>
        )}

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
            <span>Nonce: {block.nonce}</span>
            <span className="text-slate-300 text-[10px]">Mined: {new Date(block.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Connection Line */}
      <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-slate-300 z-0"></div>
      <div className={`absolute top-1/2 -right-8 p-1 rounded-full z-10 ${isValid && !isLinkBroken ? 'bg-slate-50 text-slate-300' : 'bg-red-100 text-red-500'}`}>
         {isValid && !isLinkBroken ? <Link2 size={16} /> : <AlertTriangle size={16} />}
      </div>
    </div>
  );
};

export default BlockCard;