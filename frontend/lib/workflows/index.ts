/**
 * WORKFLOW HOOKS INDEX
 * Central export point for all workflow implementations
 */

export { useSiswaWorkflow } from './siswa-workflow';
export { useGuruWorkflow } from './guru-workflow';
export { useAdminWorkflow } from './admin-workflow';

export type { SiswaWorkflow, GuruWorkflow, AdminWorkflow } from '@/types/workflow';
