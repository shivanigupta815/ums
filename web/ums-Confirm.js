(function () {

  const style = document.createElement('style');
  style.textContent = `
    #umsConfirmOverlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s ease;
      pointer-events: none;
    }
    #umsConfirmOverlay.active {
      opacity: 1; pointer-events: all;
    }
    #umsConfirmBox {
      background: linear-gradient(145deg, #0f0a28, #1a1040);
      border: 1px solid rgba(167,139,250,0.3);
      border-radius: 18px;
      padding: 0;
      min-width: 340px;
      max-width: 440px;
      width: 90%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2);
      transform: scale(0.85) translateY(20px);
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
      opacity: 0;
      overflow: hidden;
    }
    #umsConfirmOverlay.active #umsConfirmBox {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    #umsConfirmIcon {
      display: flex; align-items: center; justify-content: center;
      padding: 28px 0 16px;
      font-size: 3rem; line-height: 1;
    }
    #umsConfirmContent {
      padding: 0 28px 24px; text-align: center;
    }
    #umsConfirmTitle {
      font-size: 1.2rem; font-weight: 800;
      color: #e9d5ff; margin-bottom: 8px; letter-spacing: -0.3px;
    }
    #umsConfirmMessage {
      font-size: 0.9rem; color: #94a3b8;
      line-height: 1.55; margin-bottom: 0;
    }
    #umsConfirmDivider {
      height: 1px; background: rgba(167,139,250,0.15);
    }
    #umsConfirmButtons { display: flex; gap: 0; }
    #umsConfirmButtons button {
      flex: 1; padding: 14px 20px; border: none;
      font-size: 0.92rem; font-weight: 700; cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      letter-spacing: 0.2px;
    }
    #umsConfirmButtons button:active { transform: scale(0.97); }
    #umsCancelBtn {
      background: rgba(255,255,255,0.05); color: #94a3b8;
      border-right: 1px solid rgba(167,139,250,0.15) !important;
      border-radius: 0 0 0 18px;
    }
    #umsCancelBtn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
    #umsOkBtn { border-radius: 0 0 18px 0; }
    #umsOkBtn.type-danger  { background: linear-gradient(135deg,#dc2626,#991b1b); color:#fff; }
    #umsOkBtn.type-warning { background: linear-gradient(135deg,#d97706,#92400e); color:#fff; }
    #umsOkBtn.type-info    { background: linear-gradient(135deg,#2563eb,#1e3a8a); color:#fff; }
    #umsOkBtn.type-success { background: linear-gradient(135deg,#16a34a,#14532d); color:#fff; }
    #umsOkBtn.type-danger:hover  { background: linear-gradient(135deg,#ef4444,#b91c1c); }
    #umsOkBtn.type-warning:hover { background: linear-gradient(135deg,#f59e0b,#b45309); }
    #umsOkBtn.type-info:hover    { background: linear-gradient(135deg,#3b82f6,#1d4ed8); }
    #umsOkBtn.type-success:hover { background: linear-gradient(135deg,#22c55e,#15803d); }
    .umsicon-danger  { filter: drop-shadow(0 0 12px rgba(239,68,68,0.5)); }
    .umsicon-warning { filter: drop-shadow(0 0 12px rgba(245,158,11,0.5)); }
    .umsicon-info    { filter: drop-shadow(0 0 12px rgba(59,130,246,0.5)); }
    .umsicon-success { filter: drop-shadow(0 0 12px rgba(34,197,94,0.5)); }
  `;
  document.head.appendChild(style);

  // ── ✅ KEY FIX: DOMContentLoaded ka wait karo ──────────────────────────────
  function init() {
    // Remove existing overlay if any (prevent duplicates)
    const existing = document.getElementById('umsConfirmOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'umsConfirmOverlay';
    overlay.innerHTML = `
      <div id="umsConfirmBox" role="dialog" aria-modal="true">
        <div id="umsConfirmIcon"></div>
        <div id="umsConfirmContent">
          <div id="umsConfirmTitle"></div>
          <div id="umsConfirmMessage"></div>
        </div>
        <div id="umsConfirmDivider"></div>
        <div id="umsConfirmButtons">
          <button id="umsCancelBtn">Cancel</button>
          <button id="umsOkBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const iconMap = { danger:'🗑️', warning:'⚠️', info:'ℹ️', success:'✅' };
    let _resolve = null;

    function closePopup(result) {
      overlay.classList.remove('active');
      if (_resolve) { _resolve(result); _resolve = null; }
    }

    document.getElementById('umsCancelBtn').addEventListener('click', function() {
      closePopup(false);
    });
    document.getElementById('umsOkBtn').addEventListener('click', function() {
      closePopup(true);
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closePopup(false);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closePopup(false);
    });

    window.umsConfirm = function(options) {
      options = options || {};
      const type        = options.type        || 'danger';
      const title       = options.title       || 'Are you sure?';
      const message     = options.message     || 'This action cannot be undone.';
      const confirmText = options.confirmText || 'Confirm';
      const cancelText  = options.cancelText  || 'Cancel';

      document.getElementById('umsConfirmIcon').innerHTML =
        '<span class="umsicon-' + type + '">' + (iconMap[type] || '❓') + '</span>';
      document.getElementById('umsConfirmTitle').textContent   = title;
      document.getElementById('umsConfirmMessage').textContent = message;
      document.getElementById('umsCancelBtn').textContent      = cancelText;

      const okBtn = document.getElementById('umsOkBtn');
      okBtn.textContent = confirmText;
      okBtn.className   = 'type-' + type;

      overlay.classList.add('active');

      return new Promise(function(resolve) {
        _resolve = resolve;
      });
    };

    window.umsConfirmDelete = function(itemName) {
      return window.umsConfirm({
        type:        'danger',
        title:       'Delete ' + (itemName || 'this record') + '?',
        message:     'This action is permanent and cannot be undone.',
        confirmText: '🗑 Yes, Delete',
        cancelText:  'Cancel'
      });
    };

    window.umsConfirmApprove = function(itemName) {
      return window.umsConfirm({
        type:        'success',
        title:       'Approve ' + (itemName || 'this request') + '?',
        message:     'The requester will be notified by email.',
        confirmText: '✅ Yes, Approve',
        cancelText:  'Cancel'
      });
    };

    window.umsConfirmReject = function(itemName) {
      return window.umsConfirm({
        type:        'warning',
        title:       'Reject ' + (itemName || 'this request') + '?',
        message:     'The requester will be notified by email.',
        confirmText: '❌ Yes, Reject',
        cancelText:  'Cancel'
      });
    };
  }

  // ✅ Body ready hone ka wait — yahi asli fix hai
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();