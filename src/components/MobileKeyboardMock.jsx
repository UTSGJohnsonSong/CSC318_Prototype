const row1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const row2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
const row3 = ["z", "x", "c", "v", "b", "n", "m"];

export default function MobileKeyboardMock({ visible }) {
  if (!visible) return null;

  return (
    <div className="mobile-keyboard-mock" aria-hidden="true">
      <div className="keyboard-row keyboard-row-1">
        {row1.map((key) => (
          <span key={key} className="keyboard-key">
            {key}
          </span>
        ))}
      </div>
      <div className="keyboard-row keyboard-row-2">
        {row2.map((key) => (
          <span key={key} className="keyboard-key">
            {key}
          </span>
        ))}
      </div>
      <div className="keyboard-row keyboard-row-3">
        <span className="keyboard-key keyboard-mod-key" aria-label="shift">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 4L5.3 10.7C4.8 11.2 5.2 12 5.9 12H9V19C9 19.6 9.4 20 10 20H14C14.6 20 15 19.6 15 19V12H18.1C18.8 12 19.2 11.2 18.7 10.7L12 4Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {row3.map((key) => (
          <span key={key} className="keyboard-key">
            {key}
          </span>
        ))}
        <span className="keyboard-key keyboard-mod-key" aria-label="delete">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10.2 5H18C19.1 5 20 5.9 20 7V17C20 18.1 19.1 19 18 19H10.2C9.5 19 8.8 18.7 8.3 18.2L4.3 13.2C3.6 12.5 3.6 11.5 4.3 10.8L8.3 5.8C8.8 5.3 9.5 5 10.2 5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M11 10L16 15M16 10L11 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div className="keyboard-row keyboard-row-4">
        <span className="keyboard-key keyboard-mod-key keyboard-num-key">123</span>
        <span className="keyboard-key keyboard-mod-key keyboard-emoji-key">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
            <path d="M8.2 14.4C9.2 15.8 10.4 16.5 12 16.5C13.6 16.5 14.8 15.8 15.8 14.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className="keyboard-key keyboard-space-key">space</span>
        <span className="keyboard-key keyboard-send-key">send</span>
      </div>
      <div className="keyboard-toolbar-row">
        <span className="keyboard-toolbar-icon" aria-label="switch keyboard">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 12H20.5M12 3.5C14.4 5.8 15.8 8.8 15.8 12C15.8 15.2 14.4 18.2 12 20.5M12 3.5C9.6 5.8 8.2 8.8 8.2 12C8.2 15.2 9.6 18.2 12 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="keyboard-toolbar-icon" aria-label="voice input">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="4" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M6.5 11.5V12C6.5 15 8.9 17.5 12 17.5C15.1 17.5 17.5 15 17.5 12V11.5M12 17.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
