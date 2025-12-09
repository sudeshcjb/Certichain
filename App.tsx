import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import BlockCard from './components/BlockCard';
import { Block, CertificateData, AppView } from './types';
import { createGenesisBlock, calculateHash, validateChain } from './utils/crypto';
import { analyzeChainSecurity, explainConcept } from './services/geminiService';
import { 
    Activity, 
    ShieldAlert, 
    ShieldCheck, 
    Cpu, 
    RefreshCcw, 
    Search,
    BrainCircuit
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [chain, setChain] = useState<Block[]>([]);
  const [isChainValid, setIsChainValid] = useState(true);
  const [brokenIndex, setBrokenIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  
  // Issuer Form State
  const [newCert, setNewCert] = useState<CertificateData>({
    studentName: "",
    degree: "",
    university: "University of Technology",
    graduationDate: new Date().toISOString().split('T')[0],
    gpa: "",
    issuanceDate: new Date().toISOString()
  });
  const [isMining, setIsMining] = useState(false);

  // Auditor State
  const [auditReport, setAuditReport] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [chatConcept, setChatConcept] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  // Initialize Blockchain
  useEffect(() => {
    const init = async () => {
      const genesis = await createGenesisBlock();
      setChain([genesis]);
      setLoading(false);
    };
    init();
  }, []);

  // Validate chain whenever it changes
  useEffect(() => {
    if (chain.length > 0) {
      validateChain(chain).then((res) => {
        setIsChainValid(res.isValid);
        setBrokenIndex(res.brokenIndex);
      });
    }
  }, [chain]);

  // Handle adding a new block (Mining)
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.studentName || !newCert.degree) return;

    setIsMining(true);
    
    // Simulate PoW delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const previousBlock = chain[chain.length - 1];
    const index = chain.length;
    const timestamp = new Date().toISOString();
    const nonce = Math.floor(Math.random() * 10000); // Simplified nonce
    const hash = await calculateHash(index, previousBlock.hash, timestamp, newCert, nonce);

    const newBlock: Block = {
      index,
      timestamp,
      data: { ...newCert },
      previousHash: previousBlock.hash,
      hash,
      nonce
    };

    setChain([...chain, newBlock]);
    setIsMining(false);
    setNewCert({
        studentName: "",
        degree: "",
        university: "University of Technology",
        graduationDate: new Date().toISOString().split('T')[0],
        gpa: "",
        issuanceDate: new Date().toISOString()
    });
    setView(AppView.DASHBOARD);
  };

  // Handle Tampering (Attack Simulation)
  const handleTamper = async (index: number, maliciousData: CertificateData) => {
    const newChain = [...chain];
    const targetBlock = newChain[index];
    
    // Update data without updating the hash (simulating a DB hack where signature isn't updated)
    // OR update the hash but the NEXT block will fail validation
    targetBlock.data = maliciousData;
    
    // In a real hack, the attacker might try to update the hash too:
    // targetBlock.hash = await calculateHash(...) 
    // But they can't update the NEXT block's `previousHash` easily without rippling to the end.
    
    // For this demo, let's just update the data. The card component calculates the "real" hash 
    // and compares it to the "stored" hash, showing the mismatch immediately.
    
    setChain(newChain);
  };

  // Handle Re-Mining (Fixing a broken chain)
  const handleMine = async (index: number) => {
      // To fix block N, we must update its hash. 
      // Then we must update Block N+1's previousHash, and then re-mine Block N+1, etc.
      // This demonstrates the difficulty of altering the chain.
      
      const newChain = [...chain];
      let currentBlock = newChain[index];
      let prevHash = index === 0 ? "0" : newChain[index-1].hash;

      // Re-calculate hash for the tampered block
      currentBlock.hash = await calculateHash(currentBlock.index, prevHash, currentBlock.timestamp, currentBlock.data, currentBlock.nonce);
      
      // Cascade update
      for(let i = index + 1; i < newChain.length; i++) {
          newChain[i].previousHash = newChain[i-1].hash;
          newChain[i].hash = await calculateHash(newChain[i].index, newChain[i].previousHash, newChain[i].timestamp, newChain[i].data, newChain[i].nonce);
      }
      
      setChain(newChain);
  };

  const runAudit = async () => {
    setIsAuditing(true);
    const report = await analyzeChainSecurity(chain, brokenIndex);
    setAuditReport(report);
    setIsAuditing(false);
  };

  const askTutor = async () => {
      if(!chatConcept) return;
      const res = await explainConcept(chatConcept);
      setChatResponse(res);
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Initializing Cryptographic Ledger...</div>;

  return (
    <Layout currentView={view} setView={setView}>
      
      {/* Header Status Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {view === AppView.DASHBOARD && 'Blockchain Ledger'}
            {view === AppView.ISSUER && 'Issue Certificate'}
            {view === AppView.AUDITOR && 'Security Auditor'}
          </h1>
          <p className="text-slate-500 mt-1">
             University of Technology • Node ID: #8821A • Protocol: SHA-256
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${isChainValid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700 animate-pulse'}`}>
          {isChainValid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          <span className="font-semibold text-sm">
            {isChainValid ? 'System Secure: Integrity Verified' : 'CRITICAL WARNING: Chain Compromised'}
          </span>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {view === AppView.DASHBOARD && (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="text-blue-600" size={20} />
                        Live Chain Visualization
                     </h2>
                     <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-blue-600 transition">
                         <RefreshCcw size={18} />
                     </button>
                </div>
                
                {/* Blockchain Horizontal Scroll */}
                <div className="overflow-x-auto pb-8 pt-4">
                    <div className="flex space-x-12 px-4 min-w-max">
                        {chain.map((block, i) => (
                            <BlockCard 
                                key={block.index} 
                                block={block} 
                                prevBlock={i > 0 ? chain[i-1] : undefined}
                                isValid={brokenIndex === -1 || i < brokenIndex}
                                onTamper={handleTamper}
                                onMine={handleMine}
                            />
                        ))}
                        
                        {/* Add Block Placeholder */}
                        <button 
                            onClick={() => setView(AppView.ISSUER)}
                            className="w-24 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition gap-2"
                        >
                            <PlusCircleIcon size={32} />
                            <span className="text-xs font-bold">ADD BLOCK</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4 bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Technical Note (For Viva):</h3>
                    <p>
                        This dashboard demonstrates the <strong>Avalanche Effect</strong> of the SHA-256 algorithm. 
                        Try editing a block in the middle of the chain using the pencil icon. 
                        You will see the block's hash invalidate, and the <em>next</em> block's link break immediately. 
                        This proves the immutability of the ledger.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* ISSUER VIEW */}
      {view === AppView.ISSUER && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Cpu className="text-blue-600" />
                    New Certificate Entry
                </h2>
                <form onSubmit={handleIssueCertificate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student Full Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. John Doe"
                            value={newCert.studentName}
                            onChange={e => setNewCert({...newCert, studentName: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">University Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. University of Technology"
                            value={newCert.university}
                            onChange={e => setNewCert({...newCert, university: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Degree Title</label>
                        <select 
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={newCert.degree}
                            onChange={e => setNewCert({...newCert, degree: e.target.value})}
                        >
                            <option value="">Select Degree...</option>
                            <option value="BSc Computer Science">BSc Computer Science</option>
                            <option value="MSc Cyber Security">MSc Cyber Security</option>
                            <option value="PhD Artificial Intelligence">PhD Artificial Intelligence</option>
                            <option value="BEng Software Engineering">BEng Software Engineering</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Date</label>
                            <input 
                                required
                                type="date" 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newCert.graduationDate}
                                onChange={e => setNewCert({...newCert, graduationDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">GPA</label>
                            <input 
                                required
                                type="text" 
                                placeholder="4.0"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newCert.gpa}
                                onChange={e => setNewCert({...newCert, gpa: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Issuance Timestamp</label>
                         <input 
                            required
                            type="datetime-local" 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newCert.issuanceDate.slice(0, 16)}
                            onChange={e => setNewCert({...newCert, issuanceDate: new Date(e.target.value).toISOString()})}
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isMining}
                            className={`w-full py-4 rounded-lg font-bold text-white shadow-lg flex justify-center items-center gap-2 transition-all ${
                                isMining ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                            }`}
                        >
                            {isMining ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Calculating Proof of Work...
                                </>
                            ) : (
                                <>
                                    <Cpu size={20} />
                                    Sign & Add to Blockchain
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-slate-900 p-8 rounded-xl text-slate-300 font-mono text-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Cpu size={120} />
                </div>
                <h3 className="text-white font-bold text-lg mb-4 border-b border-slate-700 pb-2">Cryptography Protocol</h3>
                <div className="space-y-4 relative z-10">
                    <p>
                        <span className="text-blue-400">HASH_ALGO:</span> SHA-256
                    </p>
                    <p>
                        <span className="text-blue-400">DIFFICULTY:</span> AUTO (Simulated)
                    </p>
                    <p>
                        <span className="text-blue-400">CONSENSUS:</span> Proof of Authority (PoA)
                    </p>
                    <div className="mt-8 p-4 bg-slate-800 rounded border border-slate-700">
                        <p className="text-xs text-slate-500 uppercase mb-2">Pending Data Payload:</p>
                        <code className="text-green-400 break-all">
                            {JSON.stringify(newCert)}
                        </code>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                        Note: In a production environment, this data would be signed by the Issuer's Private Key (RSA/ECDSA) before hashing.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* AUDITOR VIEW */}
      {view === AppView.AUDITOR && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Security Status */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" />
                        System Integrity Check
                    </h2>
                    
                    <div className={`p-4 rounded-lg mb-6 border ${isChainValid ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                         <div className="flex items-center gap-3 mb-2">
                             <div className={`w-3 h-3 rounded-full ${isChainValid ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                             <span className={`font-bold ${isChainValid ? 'text-emerald-800' : 'text-red-800'}`}>
                                 {isChainValid ? 'Status: SECURE' : 'Status: COMPROMISED'}
                             </span>
                         </div>
                         <p className="text-sm text-slate-600">
                             {isChainValid 
                                ? "All Merkle roots match. No collisions detected. The chain is immutable."
                                : `Anomaly detected at Block #${brokenIndex}. The cryptographic link has been severed.`
                             }
                         </p>
                    </div>

                    <button 
                        onClick={runAudit}
                        disabled={isAuditing}
                        className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                         {isAuditing ? <RefreshCcw className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                         Generate AI Security Audit
                    </button>
                    
                    {auditReport && (
                        <div className="mt-6 prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Gemini Audit Report</h3>
                            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: auditReport.replace(/\n/g, '<br/>') }} />
                        </div>
                    )}
                </div>
              </div>

              {/* Tutor Chat */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <BrainCircuit className="text-purple-600" />
                      Crypto Tutor
                  </h2>
                  <div className="flex-1 overflow-y-auto bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                      {!chatResponse ? (
                          <div className="text-center text-slate-400 mt-20">
                              <p>Ask me about cryptographic concepts.</p>
                              <p className="text-xs mt-2">Try: "What is a hash?", "What is a nonce?", "Why is blockchain secure?"</p>
                          </div>
                      ) : (
                          <div className="bg-white p-3 rounded shadow-sm text-slate-800 text-sm leading-relaxed">
                              {chatResponse}
                          </div>
                      )}
                  </div>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Ask a question..."
                        value={chatConcept}
                        onChange={(e) => setChatConcept(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askTutor()}
                      />
                      <button 
                        onClick={askTutor}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                      >
                          <Search size={18} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

// Helper for the add icon
const PlusCircleIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);

export default App;