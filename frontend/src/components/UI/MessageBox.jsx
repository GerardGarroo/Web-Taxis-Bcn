import React, { useState, useEffect } from 'react';

/**
 * MessageBox Component
 *
 * A reusable UI component to display various types of messages (success, error, info).
 * It supports automatic dismissal after a set duration and manual dismissal.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.message - The message text to display.
 * @param {'success' | 'error' | 'info'} [props.type='info'] - The type of message, which determines styling.
 * @param {number} [props.duration=5000] - Duration in milliseconds after which the message automatically hides. Set to 0 for no auto-hide.
 * @param {function} props.onClose - Callback function to execute when the message is closed (manually or automatically).
 */
const MessageBox = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true); // State to control message visibility

  // Determine Tailwind CSS classes based on message type
  let bgColorClass = 'bg-blue-100 border-blue-400 text-blue-700'; // Default info
  let icon = 'ℹ️'; // Default info icon

  switch (type) {
    case 'success':
      bgColorClass = 'bg-green-100 border-green-400 text-green-700';
      icon = '✅';
      break;
    case 'error':
      bgColorClass = 'bg-red-100 border-red-400 text-red-700';
      icon = '❌';
      break;
    case 'info':
    default:
      bgColorClass = 'bg-blue-100 border-blue-400 text-blue-700';
      icon = 'ℹ️';
      break;
  }

  // Effect to handle automatic dismissal
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false); // Hide message
        if (onClose) onClose(); // Execute onClose callback if provided
      }, duration);
      return () => clearTimeout(timer); // Cleanup timer on component unmount or dependency change
    }
  }, [duration, onClose]); // Rerun effect if duration or onClose changes

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      role="alert" // ARIA role for accessibility
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg border-l-4 ${bgColorClass} flex items-center space-x-3 transition-opacity duration-300 ease-out`}
    >
      <div className="flex-shrink-0 text-xl">{icon}</div> {/* Icon for message type */}
      <div className="flex-grow font-medium text-sm sm:text-base">
        {message} {/* The message content */}
      </div>
      <button
        onClick={() => {
          setIsVisible(false); // Hide message on manual click
          if (onClose) onClose(); // Execute onClose callback
        }}
        className="ml-4 px-2 py-1 rounded-full text-lg hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
        aria-label="Cerrar mensaje" // Accessibility label for close button
      >
        &times; {/* Times symbol for close button */}
      </button>
    </div>
  );
};

export default MessageBox;
