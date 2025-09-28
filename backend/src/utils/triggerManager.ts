import axios from "axios";
import * as cron from "node-cron";

export type TriggerType = "time";

export interface TimeTrigger {
  id: string;
  type: TriggerType;
  cron_time: string;   // cron expression, e.g. "*/10 * * * * *"
  endpoint: string;
  strategy_id: string;
  active?: boolean;    // defaults to true
}

const triggers: Map<string, cron.ScheduledTask> = new Map();

// Add a new trigger dynamically
export function addTrigger(trigger: TimeTrigger) {
  if (triggers.has(trigger.id)) {
    console.warn(`Trigger ${trigger.id} already exists. Skipping.`);
    return;
  }

  const task = cron.schedule(trigger.cron_time, async () => {
    console.log(`⏰ Trigger fired: ${trigger.id}`);

    try {
      await axios.post(trigger.endpoint, {
        triggerId: trigger.id,
        strategyId: trigger.strategy_id
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ Error calling endpoint for ${trigger.id}:`, err.message);
      } else {
        console.error(`❌ Error calling endpoint for ${trigger.id}:`, err);
      }
    }
  });

  triggers.set(trigger.id, task);
  console.log(`✅ Trigger ${trigger.id} added and scheduled`);
}

// Remove a trigger dynamically
export function removeTrigger(triggerId: string) {
  const task = triggers.get(triggerId);
  if (task) {
    task.stop();
    triggers.delete(triggerId);
    console.log(`🛑 Trigger ${triggerId} stopped and removed`);
  } else {
    console.warn(`Trigger ${triggerId} not found`);
  }
}

// List active triggers
export function listTriggers() {
  return Array.from(triggers.keys());
}
