import { useState, useRef, useEffect, useContext } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useSocket();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setIsOpen(false); 
    const refreshState = { refreshId: new Date().getTime() };

    if (user?.role === 'STUDENT') {
        navigate('/my-applications', { state: refreshState });
    } else {
        navigate('/recruiter-dashboard', { state: refreshState });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all relative outline-none ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'}`}
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        
        {/* Red Dot Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                // Clean Empty State
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">You're all caught up!</p>
                  <p className="text-xs text-gray-500 mt-1">No new notifications right now.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex gap-4 items-start ${
                      !notif.isRead ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Proper Icons based on Type */}
                    <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                      notif.type === 'error' ? 'bg-red-50 text-red-500' :
                      notif.type === 'success' ? 'bg-green-50 text-green-500' : 
                      'bg-blue-50 text-blue-500'
                    }`}>
                      {notif.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                       notif.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 mt-1.5">
                        {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>

                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0 shadow-sm shadow-blue-400" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;