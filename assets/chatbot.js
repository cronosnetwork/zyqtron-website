(() => {
  const KB_URL = '/assets/knowledge.json';

  const css = `
  .zyqtron-chat-btn{position:fixed;right:18px;bottom:18px;z-index:9999;background:#10b981;color:#0b0b0b;border:0;border-radius:9999px;padding:12px 14px;font-weight:800;letter-spacing:.3px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.55)}
  .zyqtron-chat-btn:hover{filter:brightness(1.05)}
  .zyqtron-chat-panel{position:fixed;right:18px;bottom:76px;z-index:9999;width:min(420px,calc(100vw - 36px));height:560px;max-height:calc(100vh - 120px);background:#0a0a0a;border:1px solid #1f2937;border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.6);display:none}
  .zyqtron-chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #1f2937;background:#070707}
  .zyqtron-chat-title{font-weight:900;color:#e5e7eb}
  .zyqtron-chat-sub{font-size:12px;color:#9ca3af;margin-top:2px}
  .zyqtron-chat-close{background:transparent;border:0;color:#9ca3af;font-size:20px;cursor:pointer;padding:6px 8px;border-radius:10px}
  .zyqtron-chat-close:hover{background:#111827;color:#e5e7eb}
  .zyqtron-chat-body{padding:14px;height:calc(560px - 120px);max-height:calc(100vh - 240px);overflow:auto}
  .zyqtron-msg{margin:10px 0;display:flex}
  .zyqtron-msg.you{justify-content:flex-end}
  .zyqtron-bubble{max-width:85%;padding:10px 12px;border-radius:14px;line-height:1.35}
  .zyqtron-bubble.bot{background:#111827;border:1px solid #1f2937;color:#e5e7eb}
  .zyqtron-bubble.you{background:#10b981;color:#04120c;font-weight:700}
  .zyqtron-chiprow{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .zyqtron-chip{background:#0b1220;border:1px solid #1f2937;color:#e5e7eb;border-radius:9999px;padding:8px 10px;font-size:12px;cursor:pointer}
  .zyqtron-chip:hover{border-color:#10b981}
  .zyqtron-chat-footer{padding:10px 12px;border-top:1px solid #1f2937;display:flex;gap:8px;background:#070707}
  .zyqtron-input{flex:1;background:#0b0b0b;border:1px solid #1f2937;border-radius:12px;padding:10px 12px;color:#e5e7eb;outline:none}
  .zyqtron-input:focus{border-color:#10b981}
  .zyqtron-send{background:#10b981;border:0;border-radius:12px;padding:10px 12px;font-weight:900;cursor:pointer}
  .zyqtron-send:hover{filter:brightness(1.05)}
  `;

  function injectCSS() {
    if (document.getElementById('zyqtron-chat-css')) return;
    const style = document.createElement('style');
    style.id = 'zyqtron-chat-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v);
    });
    children.forEach(c => n.appendChild(c));
    return n;
  }

  const state = {
    kb: null,
    opened: false
  };

  function scoreModule(mod, text) {
    const t = text.toLowerCase();
    let score = 0;
    (mod.keywords || []).forEach(kw => {
      if (t.includes(kw.toLowerCase())) score += 3;
    });
    if (t.includes(mod.id)) score += 2;
    return score;
  }

  function pickAnswer(text) {
    const t = text.toLowerCase().trim();
    const kb = state.kb;
    if (!kb) {
      return { msg: "Je charge ma base de connaissances… réessayez dans 2 secondes.", chips: [] };
    }

    // Small talk / routing
    if (/(bonjour|salut|hello|yo)/.test(t)) {
      return { msg: `Bonjour 👋 Je suis l'assistant Zyqtron. Dites-moi votre besoin (cyber, licensing, web/SEO, audit, etc.).`, chips: defaultChips() };
    }

    if (/(contact|email|devis|rdv|rendez|appel)/.test(t)) {
      return { msg: `Pour un contact rapide : ${kb.brand.contactEmail}. Donnez 3 lignes : contexte, objectif, urgence (oui/non).`, chips: defaultChips() };
    }

    // Find best module
    let best = null;
    let bestScore = 0;
    kb.modules.forEach(m => {
      const s = scoreModule(m, t);
      if (s > bestScore) { bestScore = s; best = m; }
    });

    if (best && bestScore >= 3) {
      return {
        msg: `Je pense que ça relève de **${best.title}**.\n\n${best.summary}\n\n👉 ${best.cta}`,
        chips: [
          { label: "Voir les services", value: "Quels sont vos services ?" },
          { label: "Demander un diagnostic", value: "Je veux un diagnostic" },
          { label: "Contact", value: "Contact" }
        ]
      };
    }

    if (/(services|offres|pôles|modules)/.test(t)) {
      const list = kb.modules.map(m => `• ${m.title}`).join('\n');
      return { msg: `Voici nos modules principaux :\n${list}\n\nDites-moi lequel vous concerne ou décrivez votre situation.`, chips: defaultChips() };
    }

    return { msg: "OK. Décrivez : 1) votre contexte, 2) l'objectif, 3) la contrainte principale, 4) l'urgence (oui/non).", chips: defaultChips() };
  }

  function defaultChips() {
    return [
      { label: "Cybersécurité", value: "J'ai un besoin cyber" },
      { label: "Licensing (THKL)", value: "Je veux licencier un savoir-faire" },
      { label: "Audit Web / SEO", value: "Audit web et SEO" },
      { label: "Contact", value: "Contact" }
    ];
  }

  function addMsg(body, who, text) {
    const msg = el('div', { class: `zyqtron-msg ${who}` }, [
      el('div', { class: `zyqtron-bubble ${who}`, html: text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') })
    ]);
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function addChips(body, chips, onPick) {
    if (!chips || !chips.length) return;
    const row = el('div', { class: 'zyqtron-chiprow' });
    chips.forEach(c => {
      const b = el('button', { class: 'zyqtron-chip', type: 'button' });
      b.textContent = c.label;
      b.addEventListener('click', () => onPick(c.value));
      row.appendChild(b);
    });
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  async function loadKB() {
    if (state.kb) return state.kb;
    try {
      const res = await fetch(KB_URL, { cache: 'force-cache' });
      state.kb = await res.json();
      return state.kb;
    } catch (e) {
      console.warn('Zyqtron KB load failed', e);
      return null;
    }
  }

  function mount() {
    injectCSS();

    const btn = el('button', { class: 'zyqtron-chat-btn', type: 'button', 'aria-label': 'Ouvrir le chat Zyqtron' });
    btn.textContent = 'Assistant';

    const panel = el('div', { class: 'zyqtron-chat-panel', role: 'dialog', 'aria-modal': 'false' });
    const header = el('div', { class: 'zyqtron-chat-header' }, [
      el('div', {}, [
        el('div', { class: 'zyqtron-chat-title' , html: 'ZYQTRON<span style="color:#10b981">.</span> Assistant' }),
        el('div', { class: 'zyqtron-chat-sub', html: 'Réponses rapides • sans collecte de données' })
      ]),
      (() => {
        const c = el('button', { class: 'zyqtron-chat-close', type: 'button', 'aria-label': 'Fermer' });
        c.textContent = '×';
        c.addEventListener('click', () => toggle(false));
        return c;
      })()
    ]);

    const body = el('div', { class: 'zyqtron-chat-body' });
    const footer = el('div', { class: 'zyqtron-chat-footer' });
    const input = el('input', { class: 'zyqtron-input', placeholder: 'Décrivez votre besoin…', type: 'text' });
    const send = el('button', { class: 'zyqtron-send', type: 'button' });
    send.textContent = 'Envoyer';

    function handle(text) {
      if (!text) return;
      addMsg(body, 'you', text);
      const a = pickAnswer(text);
      addMsg(body, 'bot', a.msg);
      addChips(body, a.chips, (v) => handle(v));
    }

    send.addEventListener('click', () => {
      const t = input.value;
      input.value = '';
      handle(t);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send.click();
    });

    footer.appendChild(input);
    footer.appendChild(send);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);

    function toggle(open) {
      state.opened = open;
      panel.style.display = open ? 'block' : 'none';
      if (open && body.childElementCount === 0) {
        addMsg(body, 'bot', "Bonjour 👋 Je suis l'assistant Zyqtron. Que voulez-vous analyser ou sécuriser ?");
        addChips(body, defaultChips(), (v) => handle(v));
      }
      if (open) input.focus();
    }

    btn.addEventListener('click', async () => {
      if (!state.kb) await loadKB();
      toggle(!state.opened);
    });

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // Expose minimal API for debugging
    window.ZyqtronChat = { open: () => btn.click() };

    // Preload KB
    loadKB();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
