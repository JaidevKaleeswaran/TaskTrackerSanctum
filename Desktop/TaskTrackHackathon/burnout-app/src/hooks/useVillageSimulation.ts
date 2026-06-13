'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

const DEGRADATION_INTERVAL_MS = 60 * 1000; // Check every 60 seconds
const DEGRADATION_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours without a task = degradation

const GENERIC_PROBLEMS = [
  "Rats in the basement",
  "Leaky roof",
  "Vandalism",
  "Power outage",
  "Supply chain disruption"
];

export function useVillageSimulation() {
  const { lastTaskCompletedAt, damageBuilding, addBuildingProblem, buildings } = useGameStore();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastTaskCompletedAt) return;

      const timeSinceLastTask = Date.now() - lastTaskCompletedAt;

      // If it's been more than 2 hours since they completed a task...
      if (timeSinceLastTask > DEGRADATION_THRESHOLD_MS) {
        // Randomly damage a building
        const randomBuildingIndex = Math.floor(Math.random() * buildings.length);
        const targetId = buildings[randomBuildingIndex].id;
        
        damageBuilding(targetId, 5); // 5 damage per tick over the threshold

        // Small chance to spawn a generic problem if they are really slacking
        if (Math.random() > 0.8) {
          const randomProblem = GENERIC_PROBLEMS[Math.floor(Math.random() * GENERIC_PROBLEMS.length)];
          addBuildingProblem(targetId, `${randomProblem} (Cost: 15💰)`);
        }
      }
    }, DEGRADATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [lastTaskCompletedAt, buildings, damageBuilding, addBuildingProblem]);
}
