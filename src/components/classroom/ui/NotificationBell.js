import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';

export function NotificationBell() {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(() => {
    notificationsApi
      .list({ limit: 15 })
      .then((res) => {
        setItems(res.data || []);
        setUnreadCount(res.unreadCount ?? 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-black dark:text-white"
        aria-label={bg ? 'Известия' : 'Notifications'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-[70vh] overflow-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white">
                {bg ? 'Известия' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white"
                >
                  {bg ? 'Прочети всички' : 'Mark all read'}
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-neutral-500 px-2 py-4 font-['Manrope']">
                {bg ? 'Няма известия' : 'No notifications'}
              </p>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`px-2 py-2 rounded-lg text-sm font-['Manrope'] ${
                    n.read ? 'opacity-70' : 'bg-stone-50 dark:bg-zinc-800'
                  }`}
                >
                  {n.link ? (
                    <Link
                      to={n.link}
                      onClick={() => {
                        if (!n.read) markRead(n._id);
                        setOpen(false);
                      }}
                      className="block text-black dark:text-white hover:underline"
                    >
                      <div className="font-medium">{n.title}</div>
                      {n.body && <div className="text-xs text-neutral-500 mt-0.5">{n.body}</div>}
                    </Link>
                  ) : (
                    <div>
                      <div className="font-medium text-black dark:text-white">{n.title}</div>
                      {n.body && <div className="text-xs text-neutral-500 mt-0.5">{n.body}</div>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
