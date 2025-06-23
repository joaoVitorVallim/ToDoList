import { useEffect, useState } from 'react';
import './css/Notification.css';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: <CheckCircle size={22} />,
  error: <XCircle size={22} />,
  info: <Info size={22} />,
  warning: <AlertTriangle size={22} />,
};

const Notification = ({ notification, onRemove }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(notification.id), 300); // Wait for animation
    }, notification.duration || 3000);

    return () => clearTimeout(timer);
  }, [notification, onRemove]);

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div className={`notification ${notification.type} ${exiting ? 'exit' : ''}`}>
      <div className="notification-icon">{icons[notification.type] || <Info size={22} />}</div>
      <p className="notification-message">{notification.message}</p>
      <button onClick={handleRemove} className="notification-close-btn" title="Fechar">
        <X size={20} />
      </button>
    </div>
  );
};

export default Notification; 