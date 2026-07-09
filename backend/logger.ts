import { query } from './db';

export const logEvent = async (action: string, entity_type: string | null = null, entity_id: string | null = null, details: any = {}) => {
  try {
    await query(
      'INSERT INTO system_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)',
      [action, entity_type, entity_id, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to log event:', error);
  }
};
