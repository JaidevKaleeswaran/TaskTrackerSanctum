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
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)] gap-6 w-full max-w-[1600px] mx-auto pt-4 pb-8 relative">
      
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

      {/* Master Control Panel (Left Side UI) */}
      <aside className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Status Header Panel */}
        <div className="bg-surface rounded-2xl p-6 border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -z-0" />
          
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-1 relative z-10">
              <input 
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-black border border-accent text-white font-bold px-2 py-1 rounded outline-none w-full"
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
                className="text-accent hover:text-white font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1 relative z-10 group cursor-pointer" onClick={() => { setTempName(villageName); setIsEditingName(true); }}>
              <h1 className="text-3xl font-black text-white tracking-tight">{villageName}</h1>
              <Sparkles size={16} className="text-gray-500 group-hover:text-accent transition-colors" />
            </div>
          )}

          <p className="text-gray-400 font-medium mb-6 relative z-10">Population: {(inventory.farms * 10) + (inventory.stores * 5)}</p>
          
          <div className="flex justify-between items-end mb-2 relative z-10">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overall Health</span>
            <span className={`text-xl font-black ${villageHealthPercent > 70 ? 'text-green-500' : villageHealthPercent > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
              {villageHealthPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full transition-all duration-1000 ${villageHealthPercent > 70 ? 'bg-green-500' : villageHealthPercent > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} 
              style={{ width: `${villageHealthPercent}%` }} 
            />
          </div>

          <button 
            onClick={handleConsultGameMaster}
            disabled={isConsulting}
            className={`w-full ${isConsulting ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-600 hover:bg-purple-500 text-white'} border border-purple-500 text-xs font-bold py-3 rounded-xl transition-colors mb-6 shadow-[0_0_15px_rgba(147,51,234,0.3)]`}
          >
            {isConsulting ? "Game Master is thinking..." : "Consult AI Game Master"}
          </button>

          <div className="space-y-3">
            {buildings.map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Building2 size={14} className="text-gray-500" />
                  <span>{b.name} <span className="text-gray-600 text-xs">(Lvl {b.level})</span></span>
                </div>
                <span className={`font-bold ${b.health > 70 ? 'text-green-500' : b.health > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {b.health} HP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Currency Panel */}
        <div className="bg-black rounded-2xl p-6 border border-accent/20 shadow-[0_0_15px_rgba(255,215,0,0.1)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Treasury</span>
            <div className="text-4xl font-black text-white mt-1">{currency} <span className="text-2xl opacity-50">💰</span></div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => useGameStore.getState().resetGame()}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-500 text-xs font-bold px-3 py-2 rounded-lg border border-red-500/50 transition-colors"
            >
              Reset All
            </button>
            <button 
              onClick={() => forceSpawnProblem()}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-500 text-xs font-bold px-3 py-2 rounded-lg border border-red-500/50 transition-colors"
            >
              Test Problem
            </button>
            <button 
              onClick={() => useGameStore.getState().earnCurrency(100000)}
              className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 text-xs font-bold px-3 py-2 rounded-lg border border-yellow-500/50 transition-colors"
            >
              +Dev Cash
            </button>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Coins size={28} />
            </div>
          </div>
        </div>

        {/* Upgrade Shop */}
        <div className="bg-surface rounded-2xl p-6 border border-gray-800 shadow-xl flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Home className="text-blue-400" size={20} /></div>
            <h2 className="text-xl font-bold text-white tracking-tight">Upgrade Shop</h2>
          </div>

          <div className="space-y-4">
            {/* Farm Upgrade */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2"><Factory size={16} className="text-green-400"/> Hydro-Farm</h3>
                  <p className="text-xs text-gray-500 mt-1">Increases village max capacity.</p>
                </div>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">Owned: {inventory.farms}</span>
              </div>
              <button 
                onClick={() => handlePurchase('farms', 150)}
                className={`w-full mt-3 flex items-center justify-between p-2 rounded bg-gray-800/50 hover:bg-gray-800 border transition-colors ${shakeId === 'buy-farms' ? 'animate-error-shake border-red-500 bg-red-950/30' : 'border-gray-700'}`}
              >
                <span className="text-sm font-bold text-white">+1 Farm</span>
                <span className={`text-sm font-bold ${currency >= 150 ? 'text-accent' : 'text-red-500'}`}>150 💰</span>
              </button>
            </div>

            {/* Store Upgrade */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2"><Eye size={16} className="text-yellow-400"/> General Store</h3>
                  <p className="text-xs text-gray-500 mt-1">Generates passive income.</p>
                </div>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">Owned: {inventory.stores}</span>
              </div>
              <button 
                onClick={() => handlePurchase('stores', 300)}
                className={`w-full mt-3 flex items-center justify-between p-2 rounded bg-gray-800/50 hover:bg-gray-800 border transition-colors ${shakeId === 'buy-stores' ? 'animate-error-shake border-red-500 bg-red-950/30' : 'border-gray-700'}`}
              >
                <span className="text-sm font-bold text-white">+1 Store</span>
                <span className={`text-sm font-bold ${currency >= 300 ? 'text-accent' : 'text-red-500'}`}>300 💰</span>
              </button>
            </div>

            {/* Tower Upgrade */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2"><Sword size={16} className="text-red-400"/> Guard Tower</h3>
                  <p className="text-xs text-gray-500 mt-1">Reduces raid damage & demands.</p>
                </div>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">Owned: {inventory.guard_towers}</span>
              </div>
              <button 
                onClick={() => handlePurchase('guard_towers', 500)}
                className={`w-full mt-3 flex items-center justify-between p-2 rounded bg-gray-800/50 hover:bg-gray-800 border transition-colors ${shakeId === 'buy-guard_towers' ? 'animate-error-shake border-red-500 bg-red-950/30' : 'border-gray-700'}`}
              >
                <span className="text-sm font-bold text-white">+1 Tower</span>
                <span className={`text-sm font-bold ${currency >= 500 ? 'text-accent' : 'text-red-500'}`}>500 💰</span>
              </button>
            </div>
          </div>
        </div>

        {/* War Room / Raiding Map */}
        <div className="bg-red-950/20 rounded-2xl p-6 border border-red-900/50 shadow-xl flex-1 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg"><Sword className="text-red-400" size={20} /></div>
            <h2 className="text-xl font-bold text-white tracking-tight">War Room</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">Launch raids against other villages. Win probability scales with your Population and Guard Towers.</p>
          
          <div className="space-y-4">
            {/* Easy Raid */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold">Small Settlement</h3>
                  <p className="text-xs text-gray-500 mt-1">Low Risk / Low Reward</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400 font-bold">+200 💰</p>
                  <p className="text-xs text-red-500 font-bold">-50 💰</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const result = attemptRaid('easy');
                  setRaidResult(result);
                }}
                className="w-full mt-3 p-2 rounded bg-red-900/30 hover:bg-red-900/50 border border-red-900 transition-colors text-sm font-bold text-white"
              >
                Launch Raid
              </button>
            </div>

            {/* Medium Raid */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold">Fortified Town</h3>
                  <p className="text-xs text-gray-500 mt-1">Medium Risk / Medium Reward</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400 font-bold">+500 💰</p>
                  <p className="text-xs text-red-500 font-bold">-150 💰</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const result = attemptRaid('medium');
                  setRaidResult(result);
                }}
                className="w-full mt-3 p-2 rounded bg-red-900/30 hover:bg-red-900/50 border border-red-900 transition-colors text-sm font-bold text-white"
              >
                Launch Raid
              </button>
            </div>

            {/* Hard Raid */}
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold">The Citadel</h3>
                  <p className="text-xs text-gray-500 mt-1">High Risk / High Reward</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400 font-bold">+1500 💰</p>
                  <p className="text-xs text-red-500 font-bold">-400 💰</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const result = attemptRaid('hard');
                  setRaidResult(result);
                }}
                className="w-full mt-3 p-2 rounded bg-red-900/30 hover:bg-red-900/50 border border-red-900 transition-colors text-sm font-bold text-white"
              >
                Launch Raid
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Visual Engine (Right Side Canvas) */}
      <main className="flex-1 min-h-[600px] relative">
        <VillageCanvas />
      </main>
    </div>
  );
}
