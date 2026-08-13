"use client";

import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Loader2 size={28} className="animate-spin mb-3 text-emerald-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <AlertTriangle size={28} className="mb-3 text-amber-500" />
      <p className="text-sm font-medium text-gray-700 mb-1">
        Could not load data
      </p>
      <p className="text-xs text-gray-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  message = "No records found.",
  actionLabel,
  onAction,
}: {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <Inbox size={28} className="mb-3 text-gray-300" />
      <p className="text-sm text-gray-400">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function PageState({
  loading,
  error,
  onRetry,
  empty,
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  empty: boolean;
  children: React.ReactNode;
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (empty) return <EmptyState />;
  return <>{children}</>;
}
