import React from 'react';
import { X, Bell, CheckCheck, Trash2, Calendar, Music, Sparkles } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 w-full max-w-sm bg-[#121218] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d12]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#ff2a6d]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Live Push Notifications
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-80 overflow-y-auto divide-y divide-white/5 p-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-400">
            No new notifications at this moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-xl transition-colors ${
                n.read ? 'bg-transparent text-neutral-400' : 'bg-white/5 text-white'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#ff2a6d]/15 text-[#ff2a6d] mt-0.5 shrink-0">
                  {n.type === 'event' && <Calendar className="w-3.5 h-3.5" />}
                  {n.type === 'music' && <Music className="w-3.5 h-3.5" />}
                  {n.type === 'system' && <Sparkles className="w-3.5 h-3.5" />}
                  {n.type === 'booking' && <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold truncate text-neutral-200">{n.title}</h4>
                    <span className="text-[10px] text-neutral-400">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-[#0d0d12] text-[11px]">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}

    </div>
  );
};
