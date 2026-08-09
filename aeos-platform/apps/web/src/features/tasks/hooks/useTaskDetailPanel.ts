'use client';

import { useState, useCallback } from 'react';
import { useTaskDetail, useTaskMutations } from './useTasks';
import type { TaskStatus, TaskPriority, TaskType } from '../types';

export const STATUS_OPTIONS: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'REVIEW',
  'TESTING',
  'QA',
  'READY_FOR_RELEASE',
  'DEPLOYED',
  'DONE',
  'CANCELLED',
  'ON_HOLD',
];
export const PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const TYPE_OPTIONS: TaskType[] = ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'];
export const RESOLUTION_OPTIONS = [
  'FIXED',
  'WONT_FIX',
  'DUPLICATE',
  'CANNOT_REPRODUCE',
  'INCOMPLETE',
] as const;
export const ENVIRONMENT_OPTIONS = ['DEV', 'STAGING', 'PRODUCTION'] as const;

export const STATUS_COLORS: Record<string, string> = {
  BACKLOG: 'bg-gray-50 text-gray-700 border-gray-200',
  TODO: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  BLOCKED: 'bg-red-50 text-red-700 border-red-200',
  REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
  DONE: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-50 text-gray-400 border-gray-200',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-50 text-gray-600 border-gray-200',
  MEDIUM: 'bg-blue-50 text-blue-600 border-blue-200',
  HIGH: 'bg-orange-50 text-orange-600 border-orange-200',
  URGENT: 'bg-red-50 text-red-600 border-red-200',
};

export const LABEL_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
] as const;

export function getLabelColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function useTaskDetailPanel(taskId: string | null) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity' | 'history'>('comments');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');

  const { data: task, isLoading } = useTaskDetail(taskId);
  const { update, changeStatus } = useTaskMutations();

  const handleSaveTitle = useCallback(() => {
    if (!taskId) return;
    if (editTitle.trim() && editTitle !== task?.title) {
      update.mutate({ taskId, title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  }, [taskId, editTitle, task?.title, update]);

  const startEditingTitle = useCallback(() => {
    if (task) {
      setEditTitle(task.title);
      setIsEditingTitle(true);
    }
  }, [task]);

  const startEditingDescription = useCallback(() => {
    if (task) {
      setEditDescription(task.description || '');
      setIsEditingDescription(true);
    }
  }, [task]);

  const handleSaveDescription = useCallback(() => {
    if (!taskId) return;
    if (editDescription !== (task?.description || '')) {
      update.mutate({ taskId, description: editDescription });
    }
    setIsEditingDescription(false);
  }, [taskId, editDescription, task?.description, update]);

  const handleChangeStatus = useCallback(
    (status: TaskStatus) => {
      if (taskId) changeStatus.mutate({ taskId, status });
    },
    [taskId, changeStatus],
  );

  const handleUpdateField = useCallback(
    (field: Record<string, unknown>) => {
      if (taskId) update.mutate({ taskId, ...field });
    },
    [taskId, update],
  );

  const handleAddLabel = useCallback(() => {
    if (!taskId || !task || !labelInput.trim()) return;
    const newLabels = [...(task.labels ?? []), labelInput.trim().toLowerCase()];
    update.mutate({ taskId, labels: newLabels });
    setLabelInput('');
    setIsAddingLabel(false);
  }, [taskId, task, labelInput, update]);

  const handleRemoveLabel = useCallback(
    (label: string) => {
      if (!taskId || !task) return;
      const newLabels = (task.labels ?? []).filter((l: string) => l !== label);
      update.mutate({ taskId, labels: newLabels });
    },
    [taskId, task, update],
  );

  const isResolved = task?.status === 'DONE' || task?.status === 'CANCELLED';
  const isBug = task?.type === 'BUG';

  const timeProgress = task?.originalEstimate
    ? Math.min(100, Math.round((task.timeSpent / task.originalEstimate) * 100))
    : 0;

  return {
    task,
    isLoading,
    activeTab,
    setActiveTab,
    isEditingTitle,
    editTitle,
    setEditTitle,
    handleSaveTitle,
    startEditingTitle,
    setIsEditingTitle,
    handleChangeStatus,
    handleUpdateField,
    labelInput,
    setLabelInput,
    isAddingLabel,
    setIsAddingLabel,
    handleAddLabel,
    handleRemoveLabel,
    isResolved,
    isBug,
    timeProgress,
    isEditingDescription,
    editDescription,
    setEditDescription,
    handleSaveDescription,
    startEditingDescription,
    setIsEditingDescription,
  };
}
