'use client';

import { useGameStore } from '@/store/useGameStore';
import { Shield, Home, Factory, Eye, Sword, AlertTriangle, Building2, Coins, Sparkles } from 'lucide-react';
import VillageCanvas from '@/components/VillageCanvas';
import { useState } from 'react';

export default function GameTab() {
  const { currency, village_status, inventory, purchaseUpgrade, triggerInvasion, activeInvasion, resolveInvasion, buildings, villageName, attemptRaid, forceSpawnProblem } = useGameStore();
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [raidResult, setRaidResult] = useState<{ success: boolean; message: string } | null>(null);

  const triggerShake = (id: string) => {
    setShakeId(id);
    setTimeout(() => setShakeId(null), 300);
  };

  const villageHealthPercent = Math.max(0, Math.min(100, village_status));

  const handlePurchase = (type: 'farms' | 'stores' | 'guard_towers', cost: number) => {
    if (currency < cost) {
      triggerShake(`buy-${type}`);
      return;
    }
    purchaseUpgrade(type, cost);
  };

  const handleConsultGameMaster = async () => {
    setIsConsulting(true);
    try {
      // 1. Fetch Tasks (Using mock tasks for demonstration since Firebase isn't fully hooked up for reading yet)
      const mockTasks = [
        { title: "Finished Hackathon Code", priority: "High", timeSpent: 180 },
        { title: "Reviewed PRs", priority: "Medium", timeSpent: 45 }
      ];

      // 2. Summarize Agent
      const sumRes = await fetch('/api/agent/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: mockTasks })
      });
      const sumData = await sumRes.json();
      
      // 3. Game Master Agent
      const gmRes = await fetch('/api/agent/gamemaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: sumData.summary, currency, inventory })
      });
      const gmData = await gmRes.json();
      
      // 4. Act on AI Decision
      if (gmData.type === 'crisis') {
        useGameStore.setState({ 
          activeInvasion: { message: gmData.message, cost: gmData.costOrRewardAmount || 200 }
        });
      } else if (gmData.type === 'reward') {
        useGameStore.getState().earnCurrency(gmData.costOrRewardAmount || 150);
        alert(`🎁 Game Master Reward: ${gmData.message}`);
      } else {
        alert(`🕊️ Game Master: ${gmData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Game Master failed to respond.");
    } finally {
      setIsConsulting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pt-4 pb-8 relative">
      
      {/* INVASION MODAL OVERLAY */}
      {activeInvasion && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-bounce">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Village Invaded!</h2>
            <p className="text-red-200 text-lg mb-8 font-medium">{activeInvasion.message}</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  if (currency >= activeInvasion.cost) {
                    resolveInvasion(true);
                  } else {
                    triggerShake('invasion-pay');
                  }
                }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  currency >= activeInvasion.cost 
                    ? 'bg-accent text-black hover:bg-yellow-400' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                } ${shakeId === 'invasion-pay' ? 'animate-error-shake border border-red-500' : ''}`}
              >
                Pay Raiders ({activeInvasion.cost} 💰)
              </button>
              
              <button 
                onClick={() => resolveInvasion(false)}
                className="w-full py-4 bg-transparent border-2 border-red-500 text-red-500 rounded-xl font-bold text-lg hover:bg-red-500 hover:text-white transition-all"
              >
                Surrender (Lose all Gold & Damage Village)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAID RESULT OVERLAY */}
      {raidResult && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className={`border-2 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 ${raidResult.success ? 'bg-green-950/90 border-green-500' : 'bg-red-950/90 border-red-500'}`}>
            <h2 className={`text-3xl font-black mb-2 uppercase tracking-widest ${raidResult.success ? 'text-green-500' : 'text-red-500'}`}>
              {raidResult.success ? 'Raid Successful' : 'Raid Failed'}
            </h2>
            <p className="text-white text-lg mb-8 font-medium">{raidResult.message}</p>
            <button 
              onClick={() => setRaidResult(null)}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-gray-800 text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Side-by-Side Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-stretch">
        
        {/* Left Column: Visual Map (Top) & Status + Raids Panels (Bottom) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Visual Engine (Top Canvas) */}
          <main className="w-full h-[480px] relative">
            <VillageCanvas />
          </main>

          {/* Subgrid of Control Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Column 1: Aegis Status & Buildings */}
            <div className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between h-[230px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -z-0 pointer-events-none" />
              
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mb-1 relative z-10">
                    <input 
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-black border border-accent text-white font-bold px-2 py-0.5 rounded outline-none w-full text-base"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          useGameStore.getState().setVillageName(tempName);
                          setIsEditingName(false);
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        useGameStore.getState().setVillageName(tempName);
                        setIsEditingName(false);
                      }}
                      className="text-accent hover:text-white font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1 relative z-10 group cursor-pointer" onClick={() => { setTempName(villageName); setIsEditingName(true); }}>
                    <h1 className="text-xl font-black text-white tracking-tight">{villageName}</h1>
                    <Sparkles size={14} className="text-gray-500 group-hover:text-accent transition-colors" />
                  </div>
                )}

                <p className="text-gray-400 font-semibold text-[10px] mb-2 relative z-10">Population: {(inventory.farms * 10) + (inventory.stores * 5)}</p>
                
                <div className="flex justify-between items-end mb-1 relative z-10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Overall Health</span>
                  <span className={`text-sm font-black ${villageHealthPercent > 70 ? 'text-green-500' : villageHealthPercent > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {villageHealthPercent}%
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-1000 ${villageHealthPercent > 70 ? 'bg-green-500' : villageHealthPercent > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${villageHealthPercent}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-gray-800/80 pt-3 flex-1 overflow-y-auto custom-scrollbar">
                {buildings.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Building2 size={12} className="text-gray-500" />
                      <span>{b.name} <span className="text-gray-600 text-[9px]">(Lvl {b.level})</span></span>
                    </div>
                    <span className={`font-mono font-bold ${b.health > 70 ? 'text-green-500' : b.health > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {b.health} HP
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleConsultGameMaster}
                disabled={isConsulting}
                className={`w-full mt-3 ${isConsulting ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-600 hover:bg-purple-500 text-white'} border border-purple-500 text-[10px] font-bold py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)]`}
              >
                {isConsulting ? "Game Master is thinking..." : "Consult AI Game Master"}
              </button>
            </div>

            {/* Column 3: War Room (Raids) */}
            <div className="bg-red-950/10 rounded-2xl p-5 border border-red-900/30 shadow-xl flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex items-center gap-2 mb-1 border-b border-red-900/20 pb-1.5">
                  <Sword className="text-red-400" size={14} />
                  <h2 className="text-sm font-bold text-white tracking-tight">War Room</h2>
                </div>
                <p className="text-[10px] text-gray-400 mb-2 leading-normal font-medium">
                  Raid other settlements. Win rate scales with population and Guard Towers.
                </p>
                
                <div className="space-y-1.5">
                  {/* Easy Raid */}
                  <div className="bg-black/50 rounded-lg p-1.5 border border-gray-900 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-white truncate">Small Settlement</h4>
                      <p className="text-[9px] text-gray-500">Chance: 40% base</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-green-400 font-bold block">+200g</span>
                      <span className="text-[8px] text-red-500 font-bold block">-50g</span>
                    </div>
                    <button 
                      onClick={() => setRaidResult(attemptRaid('easy'))}
                      className="px-2 py-1 rounded bg-red-900/20 hover:bg-red-900/40 border border-red-900/40 text-[10px] font-bold text-white shrink-0 transition-colors"
                    >
                      Raid
                    </button>
                  </div>

                  {/* Medium Raid */}
                  <div className="bg-black/50 rounded-lg p-1.5 border border-gray-900 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-white truncate">Fortified Town</h4>
                      <p className="text-[9px] text-gray-500">Chance: 20% base</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-green-400 font-bold block">+500g</span>
                      <span className="text-[8px] text-red-500 font-bold block">-150g</span>
                    </div>
                    <button 
                      onClick={() => setRaidResult(attemptRaid('medium'))}
                      className="px-2 py-1 rounded bg-red-900/20 hover:bg-red-900/40 border border-red-900/40 text-[10px] font-bold text-white shrink-0 transition-colors"
                    >
                      Raid
                    </button>
                  </div>

                  {/* Hard Raid */}
                  <div className="bg-black/50 rounded-lg p-1.5 border border-gray-900 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-white truncate">The Citadel</h4>
                      <p className="text-[9px] text-gray-500">Chance: 5% base</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-green-400 font-bold block">+1500g</span>
                      <span className="text-[8px] text-red-500 font-bold block">-400g</span>
                    </div>
                    <button 
                      onClick={() => setRaidResult(attemptRaid('hard'))}
                      className="px-2 py-1 rounded bg-red-900/20 hover:bg-red-900/40 border border-red-900/40 text-[10px] font-bold text-white shrink-0 transition-colors"
                    >
                      Raid
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Treasury & Upgrade Shop */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="bg-surface rounded-2xl p-5 border border-gray-800 shadow-xl flex flex-col justify-between h-full min-h-[734px]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
                <div>
                  <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Treasury</span>
                  <div className="text-2xl font-black text-white mt-0.5">{currency} <span className="text-lg opacity-50">💰</span></div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => useGameStore.getState().resetGame()}
                    className="bg-red-500/10 hover:bg-red-500/25 text-red-500 text-[9px] font-bold px-2 py-1 rounded border border-red-500/20 transition-colors"
                    title="Reset Game"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => forceSpawnProblem()}
                    className="bg-red-500/10 hover:bg-red-500/25 text-red-500 text-[9px] font-bold px-2 py-1 rounded border border-red-500/20 transition-colors"
                    title="Test Crises"
                  >
                    Test
                  </button>
                  <button 
                    onClick={() => useGameStore.getState().earnCurrency(5000)}
                    className="bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-500 text-[9px] font-bold px-2 py-1 rounded border border-yellow-500/20 transition-colors"
                  >
                    +Dev
                  </button>
                </div>
              </div>

              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5"><Home size={13} className="text-blue-400" /> Upgrade Shop</h3>
              
              <div className="space-y-3">
                {/* Farm Upgrade */}
                <div className="bg-black/40 rounded-xl p-3 border border-gray-900/60 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5"><Factory size={13} className="text-green-400"/> Hydro-Farm</h4>
                    <p className="text-[10px] text-gray-500">Raises population max by 10.</p>
                  </div>
                  <button 
                    onClick={() => handlePurchase('farms', 150)}
                    className={`px-3 py-1.5 rounded bg-gray-900 border text-xs font-bold transition-all shrink-0 ${shakeId === 'buy-farms' ? 'animate-error-shake border-red-500 bg-red-950/30' : 'border-gray-800 hover:border-gray-700'}`}
                  >
                    <span className={`mr-2 font-mono ${currency >= 150 ? 'text-accent' : 'text-red-500'}`}>150 💰</span>
                    <span className="text-gray-400 text-[10px]">Buy ({inventory.farms})</span>
                  </button>
                </div>

                {/* Store Upgrade */}
                <div className="bg-black/40 rounded-xl p-3 border border-gray-900/60 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5"><Eye size={13} className="text-yellow-400"/> General Store</h4>
                    <p className="text-[10px] text-gray-500">Passive yields: 15g per store / min.</p>
                  </div>
                  <button 
                    onClick={() => handlePurchase('stores', 300)}
                    className={`px-3 py-1.5 rounded bg-gray-900 border text-xs font-bold transition-all shrink-0 ${shakeId === 'buy-stores' ? 'animate-error-shake border-red-500 bg-red-950/30' : 'border-gray-800 hover:border-gray-700'}`}
                  >
                    <span className={`mr-2 font-mono ${currency >= 300 ? 'text-accent' : 'text-red-500'}`}>300 💰</span>
                    <span className="text-gray-400 text-[10px]">Buy ({inventory.stores})</span>
                  </button>
                </div>

                {/* Tower Upgrade */}
                <div className="bg-black/40 rounded-xl p-3 border border-gray-900/60 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5"><Sword size={13} className="text-red-400"/> Guard Tower</h4>
                    <p className="text-[10px] text-gray-500">Defenses +5% raid chance.</p>
                  </div>
                  <button 
                    onClick={() => handlePurchase('guard_towers', 500)}
                    className={`px-3 py-1.5 rounded bg-gray-900 border text-xs font-bold transition-all shrink-0 ${shakeId === 'buy-guard_towers' ? 'animate-error-shake border-red-500 bg-red-950/30' : 'border-gray-800 hover:border-gray-700'}`}
                  >
                    <span className={`mr-2 font-mono ${currency >= 500 ? 'text-accent' : 'text-red-500'}`}>500 💰</span>
                    <span className="text-gray-400 text-[10px]">Buy ({inventory.guard_towers})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resource Production & Benefits */}
            <div className="border-t border-gray-800/80 pt-4 mt-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Resource Multipliers</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/50 p-2 rounded-lg border border-gray-900 text-center">
                  <span className="text-[8px] text-gray-500 block uppercase font-mono">Max Pop</span>
                  <span className="text-xs font-bold text-green-400 font-mono">+{(inventory.farms * 10) + (inventory.stores * 5)}</span>
                </div>
                <div className="bg-black/50 p-2 rounded-lg border border-gray-900 text-center">
                  <span className="text-[8px] text-gray-500 block uppercase font-mono">Gold Gen</span>
                  <span className="text-xs font-bold text-yellow-400 font-mono">+{inventory.stores * 15}g/m</span>
                </div>
                <div className="bg-black/50 p-2 rounded-lg border border-gray-900 text-center">
                  <span className="text-[8px] text-gray-500 block uppercase font-mono">Raid Buff</span>
                  <span className="text-xs font-bold text-red-400 font-mono">+{inventory.guard_towers * 5}%</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
