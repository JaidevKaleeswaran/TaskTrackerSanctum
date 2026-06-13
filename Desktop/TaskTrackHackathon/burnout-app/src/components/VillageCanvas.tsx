'use client';

import { useState, useRef } from 'react';
import { useGameStore, Building } from '@/store/useGameStore';
import { ShieldAlert, Wrench, ArrowUpCircle, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VillageCanvas() {
  const { buildings, inventory, resolveBuildingProblem, upgradeBuilding, healBuilding, currency } = useGameStore();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const triggerShake = (id: string) => {
    setShakeId(id);
    setTimeout(() => setShakeId(null), 300);
  };

  const getBuildingState = (health: number) => {
    if (health > 75) return 'healthy';
    if (health > 30) return 'damaged';
    return 'critical';
  };

  const handleRepair = (b: Building) => {
    if (b.health >= 100) {
      alert(`${b.name} is already at full HP!`);
      return;
    }
    if (currency < 25) {
      triggerShake('repair');
      return;
    }
    healBuilding(b.id, 25);
    useGameStore.getState().spendCurrency(25); 
  };

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  const minBuildingLevel = buildings.length > 0 ? Math.min(...buildings.map(b => b.level)) : 1;
  const minInventoryCount = Math.min(inventory.farms, inventory.stores, inventory.guard_towers);

  let currentStageImage = "/assets/village_base.png";
  if (minInventoryCount >= 3 && minBuildingLevel >= 3) {
    currentStageImage = "/assets/village_stage_3.png";
  } else if (minInventoryCount >= 2 && minBuildingLevel >= 2) {
    currentStageImage = "/assets/village_stage_2.png";
  } else if (minInventoryCount >= 1) {
    currentStageImage = "/assets/village_stage_1.png";
  }

  return (
    <div className="relative w-full h-[620px] bg-[#111119] bg-[linear-gradient(to_right,#1a1a26_1px,transparent_1px),linear-gradient(to_bottom,#1a1a26_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
      {/* Corner HUD labels */}
      <div className="absolute top-3 left-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none select-none">
        Aegis Tactical Monitor v2.1 // Live
      </div>
      <div className="absolute top-3 right-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none select-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Sync: Active
      </div>
      <div className="absolute bottom-3 left-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none select-none">
        Sector: Village Center
      </div>
      <div className="absolute bottom-3 right-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none select-none">
        Lock: Engaged
      </div>

      <style>{`
        @keyframes wander-1 {
          0% { transform: translate(0px, 0px); }
          33% { transform: translate(15px, -10px); }
          66% { transform: translate(-10px, 15px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander-2 {
          0% { transform: translate(0px, 0px); }
          33% { transform: translate(-15px, 10px); }
          66% { transform: translate(10px, -15px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes wander-3 {
          0% { transform: translate(0px, 0px); }
          33% { transform: translate(10px, 15px); }
          66% { transform: translate(-15px, -10px); }
          100% { transform: translate(0px, 0px); }
        }
      `}</style>
      
      {/* Locked Map Container - 1:1 aspect ratio ensures building coordinates never shift or drift */}
      <div className="relative aspect-square h-[95%] max-h-full mx-auto flex items-center justify-center">
        <img 
          src={currentStageImage} 
          alt="Village Map Stage" 
          className="w-full h-full object-cover rounded-xl border border-gray-800 pointer-events-none select-none transition-opacity duration-1000 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          draggable="false"
        />

        {buildings.flatMap((b) => {
          const state = getBuildingState(b.health);
          const totalCount = inventory[b.id as keyof typeof inventory];
          
          if (totalCount === 0) return [];
          
          // Decide how many dots to show. 1 dot per 2 buildings, max 5 dots.
          const numDots = Math.min(5, Math.ceil(totalCount / 2));
          const dots = [];

          const expansionPositions: Record<string, { top: string, left: string }[]> = {
            farms: [
              { top: '30%', left: '25%' },
              { top: '38%', left: '18%' },
              { top: '22%', left: '32%' },
              { top: '45%', left: '15%' },
              { top: '15%', left: '40%' }
            ],
            stores: [
              { top: '45%', left: '55%' },
              { top: '52%', left: '65%' },
              { top: '38%', left: '45%' },
              { top: '60%', left: '75%' },
              { top: '30%', left: '35%' }
            ],
            guard_towers: [
              { top: '60%', left: '30%' },
              { top: '70%', left: '20%' },
              { top: '50%', left: '40%' },
              { top: '80%', left: '10%' },
              { top: '40%', left: '50%' }
            ]
          };

          for (let i = 0; i < numDots; i++) {
            const isLastDot = i === numDots - 1;
            const countForThisDot = isLastDot ? totalCount - (i * 2) : 2;
            const pos = expansionPositions[b.id]?.[i] || { top: '50%', left: '50%' };
            const uniqueId = `${b.id}-${i}`;

            dots.push(
              <div 
                key={uniqueId}
                className="absolute z-10"
                style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
              >
                <div style={{ animation: `wander-${(i % 3) + 1} ${10 + i * 2}s infinite alternate ease-in-out` }}>
                  <div
                    className="transition-transform hover:scale-105 cursor-pointer flex flex-col items-center group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBuildingId(b.id);
                    }}
                  >
                    {/* Floating Notification Textboxes (Only show problems on the primary dot) */}
                    {i === 0 && b.current_problems.length > 0 && (
                      <div className={`absolute bottom-full mb-2 bg-red-950/90 border border-red-500 rounded-lg p-3 shadow-[0_0_15px_rgba(239,68,68,0.3)] w-48 text-center z-50 ${shakeId === `fix-${b.id}` ? 'animate-error-shake' : 'animate-bounce'}`}>
                        <ShieldAlert className="text-red-500 mx-auto mb-1" size={20} />
                        <p className="text-white text-xs font-bold mb-2">{b.current_problems[0]}</p>
                        <button 
                          onClick={(evt) => {
                            evt.stopPropagation();
                            if (!resolveBuildingProblem(b.id, 0, 50)) {
                              triggerShake(`fix-${b.id}`);
                            }
                          }}
                          className="w-full bg-red-500 hover:bg-red-400 text-black text-xs font-bold py-1 rounded"
                        >
                          Fix (50 💰)
                        </button>
                      </div>
                    )}

                    {/* Interaction Marker */}
                    <div className="mt-8 flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${state === 'healthy' ? 'bg-green-500' : state === 'damaged' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded mt-1 whitespace-nowrap backdrop-blur-sm">
                        {b.name} (x{countForThisDot})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return dots;
        })}
      </div>

      {/* Building Details Modal */}
      {selectedBuilding && (
        <div className="absolute top-4 right-4 w-80 bg-black/90 backdrop-blur-md border border-gray-800 rounded-xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{selectedBuilding.name}</h3>
              <p className="text-gray-400 text-xs">Level {selectedBuilding.level}</p>
            </div>
            <button 
              onClick={() => setSelectedBuildingId(null)}
              className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Health Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-gray-400">Structural Integrity</span>
                <span className={selectedBuilding.health > 70 ? 'text-green-500' : selectedBuilding.health > 30 ? 'text-yellow-500' : 'text-red-500'}>
                  {selectedBuilding.health}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${selectedBuilding.health > 70 ? 'bg-green-500' : selectedBuilding.health > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${selectedBuilding.health}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
              <button 
                onClick={() => handleRepair(selectedBuilding)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all ${shakeId === 'repair' ? 'animate-error-shake bg-red-950/30 border-red-500/50 text-red-500' : 'bg-gray-900/50 border-gray-700/50 hover:bg-gray-800 text-gray-300'}`}
              >
                <Wrench size={14} />
                <span className="text-xs font-bold text-white">Repair</span>
              </button>
              <button 
                onClick={() => {
                  if (!upgradeBuilding(selectedBuilding.id, 200)) {
                    triggerShake('upgrade');
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all ${shakeId === 'upgrade' ? 'animate-error-shake bg-red-950/30 border-red-500/50 text-red-500' : 'bg-accent/10 border-accent/20 hover:bg-accent/20 text-accent'}`}
              >
                <ArrowUpCircle size={14} />
                <span className="text-xs font-bold text-white">Lvl Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
