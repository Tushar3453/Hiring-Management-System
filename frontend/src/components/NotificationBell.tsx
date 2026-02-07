import { useState, useRef, useEffect, useContext } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
        className="p-2 rounded-full hover:bg-gray-100 transition relative text-gray-600 hover:text-blue-600"
      >
        <Bell className="w-6 h-6" />
        
        {/* Red Dot Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <span className="text-xs font-medium text-gray-500">{unreadCount} unread</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications yet 💤
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 flex gap-3 ${
                    !notif.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Icon based on Type */}
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                     notif.type === 'error' ? 'bg-red-500' :
                     notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  
                  <div>
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;