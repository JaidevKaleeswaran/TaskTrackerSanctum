import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Building {
  id: string;
  name: string;
  level: number;
  health: number; // 0-100
  current_problems: string[];
}

interface GameState {
  currency: number;
  village_status: number; // 0-100 overall health
  buildings: Building[];
  inventory: { farms: number; stores: number; guard_towers: number };
  lastTaskCompletedAt: number | null;
  activeInvasion: { cost: number, message: string } | null;
  villageName: string;

  // Actions
  earnCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean; // Returns true if successful
  damageBuilding: (id: string, amount: number) => void;
  healBuilding: (id: string, amount: number) => void;
  addBuildingProblem: (id: string, problem: string) => void;
  resolveBuildingProblem: (id: string, problemIndex: number, cost: number) => boolean;
  upgradeBuilding: (id: string, cost: number) => boolean;
  purchaseUpgrade: (type: keyof GameState['inventory'], cost: number) => boolean;
  setLastTaskCompletedAt: (timestamp: number) => void;
  triggerInvasion: () => void;
  resolveInvasion: (pay: boolean) => void;
  setVillageName: (name: string) => void;
  resetGame: () => void;
  attemptRaid: (difficulty: 'easy' | 'medium' | 'hard') => { success: boolean; message: string };
  forceSpawnProblem: () => void;
}

const INITIAL_BUILDINGS: Building[] = [
  { id: 'farms', name: 'Hydro-Farms', level: 1, health: 100, current_problems: [] },
  { id: 'stores', name: 'General Stores', level: 1, health: 100, current_problems: [] },
  { id: 'guard_towers', name: 'Guard Towers', level: 1, health: 100, current_problems: [] }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currency: 0,
      village_status: 100,
      buildings: INITIAL_BUILDINGS,
      inventory: { farms: 0, stores: 0, guard_towers: 0 },
      lastTaskCompletedAt: null,
      activeInvasion: null,
      villageName: 'Neo-Village',

      resetGame: () => set({
        currency: 0,
        village_status: 100,
        buildings: INITIAL_BUILDINGS,
        inventory: { farms: 0, stores: 0, guard_towers: 0 },
        lastTaskCompletedAt: null,
        activeInvasion: null,
        villageName: 'Neo-Village',
      }),

      setVillageName: (name) => set({ villageName: name }),

      triggerInvasion: () => set((state) => {
        // Base cost + scaling based on village size
        const size = state.inventory.farms + state.inventory.stores + state.inventory.guard_towers;
        const baseCost = 200 + (size * 100);
        
        // Guard towers give a massive discount to defend
        const discount = state.inventory.guard_towers * 50;
        const finalCost = Math.max(50, baseCost - discount);
        
        return {
          activeInvasion: {
            message: `A horde of raiders is attacking! They demand ${finalCost} Gold, or they will sack the village!`,
            cost: finalCost
          }
        };
      }),

      resolveInvasion: (pay) => set((state) => {
        if (!state.activeInvasion) return state;
        
        if (pay && state.currency >= state.activeInvasion.cost) {
          // Success: Paid them off or defended
          return {
            currency: state.currency - state.activeInvasion.cost,
            activeInvasion: null
          };
        } else {
          // Failure: Surrender (lose all gold, massive damage to buildings, level down one building)
          const damagedBuildings = state.buildings.map(b => ({
            ...b,
            health: Math.max(0, b.health - 60) // -60 HP to everything
          }));
          
          // Randomly downgrade one building by 1 level (minimum level 1)
          const targetIndex = Math.floor(Math.random() * damagedBuildings.length);
          damagedBuildings[targetIndex].level = Math.max(1, damagedBuildings[targetIndex].level - 1);
          
          return {
            currency: 0, // Lose all gold
            buildings: damagedBuildings,
            activeInvasion: null
          };
        }
      }),

      earnCurrency: (amount) => set((state) => ({ currency: state.currency + amount })),
      
      spendCurrency: (amount) => {
        const state = get();
        if (state.currency >= amount) {
          set({ currency: state.currency - amount });
          return true;
        }
        return false;
      },

      purchaseUpgrade: (type, cost) => {
        const state = get();
        if (state.currency >= cost) {
          set({ 
            currency: state.currency - cost,
            inventory: { ...state.inventory, [type]: state.inventory[type] + 1 }
          });
          return true;
        }
        return false;
      },

      damageBuilding: (id, amount) => set((state) => ({
        buildings: state.buildings.map(b => 
          b.id === id ? { ...b, health: Math.max(0, b.health - amount) } : b
        )
      })),

      healBuilding: (id, amount) => set((state) => ({
        buildings: state.buildings.map(b => 
          b.id === id ? { ...b, health: Math.min(100, b.health + amount) } : b
        )
      })),

      addBuildingProblem: (id, problem) => set((state) => ({
        buildings: state.buildings.map(b => 
          b.id === id && !b.current_problems.includes(problem)
            ? { ...b, current_problems: [...b.current_problems, problem] } 
            : b
        )
      })),

      resolveBuildingProblem: (id, problemIndex, cost) => {
        const state = get();
        if (state.currency >= cost) {
          set((s) => ({
            currency: s.currency - cost,
            buildings: s.buildings.map(b => 
              b.id === id 
                ? { 
                    ...b, 
                    health: Math.min(100, b.health + 20), // Resolving a problem gives a health bump
                    current_problems: b.current_problems.filter((_, i) => i !== problemIndex) 
                  } 
                : b
            )
          }));
          return true;
        }
        return false;
      },

      upgradeBuilding: (id, cost) => {
        const state = get();
        if (state.currency >= cost) {
          set((s) => ({
            currency: s.currency - cost,
            buildings: s.buildings.map(b => 
              b.id === id ? { ...b, level: b.level + 1, health: 100 } : b
            )
          }));
          return true;
        }
        return false;
      },

      setLastTaskCompletedAt: (timestamp) => set({ lastTaskCompletedAt: timestamp }),

      attemptRaid: (difficulty) => {
        const state = get();
        const pop = state.inventory.farms + state.inventory.stores;
        const defense = state.inventory.guard_towers;
        
        let baseChance = 0;
        let reward = 0;
        let risk = 0;

        if (difficulty === 'easy') { baseChance = 70; reward = 200; risk = 50; }
        else if (difficulty === 'medium') { baseChance = 40; reward = 500; risk = 150; }
        else { baseChance = 10; reward = 1500; risk = 400; }

        // Boost chance: 2% per pop, 10% per guard tower
        let chance = baseChance + (pop * 2) + (defense * 10);
        chance = Math.min(95, chance); // Cap at 95%

        const roll = Math.random() * 100;
        const success = roll <= chance;

        if (success) {
          set({ currency: state.currency + reward });
          return { success: true, message: `Victory! You looted ${reward} 💰.` };
        } else {
          set({ currency: Math.max(0, state.currency - risk) });
          // Damage all buildings slightly on failed raid
          const damagedBuildings = state.buildings.map(b => ({
            ...b,
            health: Math.max(0, b.health - 20)
          }));
          set({ buildings: damagedBuildings });
          return { success: false, message: `Defeat! You lost ${Math.min(state.currency, risk)} 💰 and buildings took 20 DMG.` };
        }
      },

      forceSpawnProblem: () => {
        const state = get();
        if (state.buildings.length === 0) return;
        const targetIndex = Math.floor(Math.random() * state.buildings.length);
        const b = state.buildings[targetIndex];
        
        const problems = ["Structural Damage", "Pest Infestation", "Supply Shortage", "Equipment Breakdown"];
        const p = problems[Math.floor(Math.random() * problems.length)];
        
        if (!b.current_problems.includes(p)) {
          set((s) => ({
            buildings: s.buildings.map((bdg, i) => 
              i === targetIndex ? { ...bdg, current_problems: [...bdg.current_problems, p], health: Math.max(0, bdg.health - 30) } : bdg
            )
          }));
        }
      },
    }),
    {
      name: 'village-game-storage' // Persist to local storage for now until Firestore is hooked up
    }
  )
);
