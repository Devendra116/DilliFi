import crypto from 'crypto';

export function generateStrategyHash(triggers: any[], execution_steps: any[]): string {
  // Create a deterministic object for hashing
  const hashInput = {
    triggers: triggers,
    execution_steps: execution_steps
  };

  // Convert to JSON string with sorted keys for consistency
  const jsonString = JSON.stringify(hashInput, Object.keys(hashInput).sort());

  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256').update(jsonString).digest('hex');

  return hash;
}