import { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Send,
  Facebook,
  ExternalLink
} from 'lucide-react';
import './ShareModal.css';

// SVG Icon for X (Twitter)
function TwitterXIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareModal({
  isOpen,
  onClose,
  title = 'Share',
  text = 'Check this out on GETSY!',
  url = window.location.href,
  entityType = 'item'
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fullShareText = `${text} • Discover on GETSY:`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(fullShareText);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} color="#25D366" />,
      color: '#25D366',
      bg: 'rgba(37, 211, 102, 0.12)',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText + ' ' + url)}`
    },
    {
      name: 'Telegram',
      icon: <Send size={20} color="#229ED9" />,
      color: '#229ED9',
      bg: 'rgba(34, 158, 217, 0.12)',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'X / Twitter',
      icon: <TwitterXIcon size={18} />,
      color: '#ffffff',
      bg: 'rgba(255, 255, 255, 0.1)',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} color="#1877F2" />,
      color: '#1877F2',
      bg: 'rgba(24, 119, 242, 0.12)',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }
  ];

  const handleSocialClick = (shareUrl) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <div className="share-modal-overlay" onClick={onClose} id="share-modal-overlay">
      <div
        className="share-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-heading"
        id="share-modal"
      >
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-modal-title-row">
            <div className="share-modal-icon-badge">
              <Share2 size={18} color="var(--primary, #10b981)" />
            </div>
            <div>
              <h3 className="share-modal-heading" id="share-modal-heading">
                Share {entityType === 'shop' ? 'Shop' : 'Product'}
              </h3>
              <p className="share-modal-subtitle">{title}</p>
            </div>
          </div>
          <button
            type="button"
            className="share-modal-close"
            onClick={onClose}
            aria-label="Close share modal"
            id="share-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="share-modal-options-grid">
          {shareOptions.map((opt) => (
            <button
              key={opt.name}
              type="button"
              className="share-option-btn"
              onClick={() => handleSocialClick(opt.url)}
              id={`share-btn-${opt.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <div className="share-option-icon" style={{ backgroundColor: opt.bg, color: opt.color }}>
                {opt.icon}
              </div>
              <span className="share-option-name">{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="share-modal-copy-section">
          <label className="share-copy-label">Or share direct link</label>
          <div className="share-copy-input-wrap">
            <input
              type="text"
              readOnly
              value={url}
              className="share-copy-input"
              onClick={(e) => e.target.select()}
              id="share-copy-link-input"
            />
            <button
              type="button"
              className={`share-copy-btn ${copied ? 'share-copy-btn--copied' : ''}`}
              onClick={handleCopyLink}
              id="share-copy-link-btn"
            >
              {copied ? (
                <>
                  <Check size={15} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
