import { prisma } from '../db/client.js';

export async function logAuditEvent(params: {
  action: string;
  performedBy?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        performedBy: params.performedBy || null,
        details: params.details || {},
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // If DB is offline or mock mode, log to console safely
    console.warn(`[AUDIT LOG] ${params.action} by ${params.performedBy || 'ANONYMOUS'}:`, params.details);
  }
}
