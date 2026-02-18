/* ==========================================================================
   1. ÉTAT GLOBAL MATRIX
   ========================================================================== */

const matrixState = {
    targetColor:  [0, 68, 255],
    currentColor: [0, 68, 255],
    chars: '01',
    isVisible: true,
};

/* ==========================================================================
   2. UTILITAIRES
   ========================================================================== */

/** Hex (#rrggbb) → [r, g, b] */
function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
        : [0, 68, 255];
}

/** Interpolation linéaire */
const lerp = (a, b, t) => a + (b - a) * t;

/** Debounce — évite les appels en rafale */
function debounce(fn, delay = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/* ==========================================================================
   3. REVEAL AU SCROLL — IntersectionObserver (zéro coût au scroll)
   ========================================================================== */

function initReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Arrêt de l'observation une fois révélé → pas de re-check inutile
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(
        '.reveal, .bio-card, .glitch-text, .stat-item, .sae-card, .ac-card, .mission-entry, .alt-stat-item'
    ).forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. NAVIGATION — header + lien actif synchronisé au scroll
   ========================================================================== */

function initNavigation() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    // Header scrolled
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Scroll smooth au clic
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ✅ Lien actif synchro au scroll — plus de désynchronisation si l'utilisateur scrolle à la main
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            });
        },
        { threshold: 0.35 }
    );

    document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
}

/* ==========================================================================
   5. MATRIX BACKGROUND
   ========================================================================== */

function initMatrix() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ✅ FONT_SIZE déclaré une seule fois (était dupliqué avant)
    const FONT_SIZE = 13;
    let columns, drops, columnSpeeds;

    function setup() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        columns      = Math.floor(canvas.width / FONT_SIZE);
        drops        = Array.from({ length: columns }, () => Math.random() * -canvas.height);
        // Vitesse variable par colonne → effet organique
        columnSpeeds = Array.from({ length: columns }, () => 0.4 + Math.random() * 0.6);
    }

    // ✅ Debounce resize → évite les recréations en rafale
    window.addEventListener('resize', debounce(setup), { passive: true });
    setup();

    let lastTime = 0;
    const INTERVAL = 1000 / 20; // 20 FPS cible

    function draw(timestamp) {
        if (!matrixState.isVisible) {
            requestAnimationFrame(draw);
            return;
        }

        const delta = timestamp - lastTime;
        if (delta < INTERVAL) {
            requestAnimationFrame(draw);
            return;
        }
        lastTime = timestamp - (delta % INTERVAL);

        // Lerp couleur — transition douce entre sections
        matrixState.currentColor = matrixState.currentColor.map((c, i) =>
            lerp(c, matrixState.targetColor[i], 0.08)
        );
        const [r, g, b] = matrixState.currentColor.map(Math.round);

        ctx.fillStyle = 'rgba(5, 5, 5, 0.12)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.font = `${FONT_SIZE}px monospace`;

        for (let i = 0; i < columns; i++) {
            const char = matrixState.chars[Math.floor(Math.random() * matrixState.chars.length)];
            ctx.fillText(char, i * FONT_SIZE, drops[i]);
            if (drops[i] > canvas.height && Math.random() > 0.975) {
                drops[i] = Math.random() * -100;
            }
            drops[i] += FONT_SIZE * columnSpeeds[i];
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    // Pause CPU/batterie si onglet caché
    document.addEventListener('visibilitychange', () => {
        matrixState.isVisible = !document.hidden;
    });
}

/* ==========================================================================
   6. THÈME MATRIX PAR SECTION
   ========================================================================== */

function initBackgroundChanger() {
    const themeMap = {
        'presentation':      { color: '#0044ff', chars: '01' },
        'admin-reseaux':     { color: '#27c93f', chars: '192.168.ROOT' },
        'connecter-usagers': { color: '#00d4ff', chars: 'SSID.ToIP.DATA' },
        'outils-rt':         { color: '#ffa500', chars: '{ } => if() else' },
        'si-securise':       { color: '#007bff', chars: 'ENCRYPT.THREAT.101' },
        'surveiller-si':     { color: '#27c93f', chars: 'LOG.DETECT.ALERT' },
        'alternance':        { color: '#ff6600', chars: 'INFRA.ALUMINIUM.24/7' },
        'traces':            { color: '#888888', chars: 'LS.PWD.DIR.FILE' },
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const theme = themeMap[entry.target.id];
            if (!theme) return;
            matrixState.targetColor = hexToRgb(theme.color);
            matrixState.chars = theme.chars;
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
}

/* ==========================================================================
   7. ACCORDION SAE — délégation d'événement (remplace les onclick inline)
   ========================================================================== */

function initAccordion() {
    document.querySelector('main')?.addEventListener('click', (e) => {
        const header = e.target.closest('.sae-header');
        if (!header) return;

        const card = header.parentElement;
        if (!card?.classList.contains('sae-card')) return;

        // Exclure les headers de missions alternance (contenu statique visible)
        if (card.querySelector('.sae-content-visible')) return;

        card.classList.toggle('active');
    });
}

// Rétro-compatibilité avec les onclick="toggleSAE(this)" existants dans le HTML
function toggleSAE(header) {
    const card = header.parentElement;
    if (card) card.classList.toggle('active');
}

/* ==========================================================================
   8. TYPEWRITER
   ========================================================================== */

function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
        'BUT Réseaux & Télécoms',
        'Cybersécurité',
        'Administration Système',
        'Réseaux Industriels',
    ];

    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;

    function type() {
        const current = phrases[phraseIndex];
        charIndex += isDeleting ? -1 : 1;
        el.textContent = current.substring(0, charIndex);

        let delay = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === current.length) {
            isDeleting = true;
            delay = 2000; // pause avant effacement
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 500;
        }

        setTimeout(type, delay);
    }

    type();
}

/* ==========================================================================
   9. EXPLORATEUR DE TRACES
   ========================================================================== */

function initProjectExplorer() {
    const folderData = {
        sae501: [
            { name: 'main.py',                   type: 'code', src: 'fichier/SAE5.01/main.py' },
        ],
        sae502: [
            { name: 'Projet.zip',                type: 'zip',  src: 'fichier/SAE5.02/Projet.zip' },
        ],
        sae503: [
            { name: 'DocStormShield.pdf',         type: 'pdf',  src: 'fichier/SAE5.03/DocStormShield.pdf' },
        ],
        sae401: [
            { name: 'Présentation.pdf',           type: 'pdf',  src: 'fichier/SAE4.01/Présentation.pdf' },
        ],
        sae301: [
            { name: 'Applications Téléphones.png',type: 'img',  src: 'fichier/SAE3.01/Applications Téléphones.png' },
            { name: 'code utiliser.png',          type: 'img',  src: 'fichier/SAE3.01/code utiliser.png' },
        ],
        sae302: [
            { name: 'SAE3.02.zip',               type: 'zip',  src: 'fichier/SAE3.02/SAE3.02.zip' },
        ],
        sae303: [
            { name: 'Rapport FAI.pdf',            type: 'pdf',  src: 'fichier/SAE3.03/Rapport FAI.pdf' },
        ],
        sae304: [
            { name: 'Challenge p1.png',           type: 'img',  src: 'fichier/SAE3.04/Challenge p1.png' },
            { name: 'classement.png',             type: 'img',  src: 'fichier/SAE3.04/classement.png' },
        ],
        sae202: [
            { name: 'Branchement_Tinkercad.png',  type: 'img',  src: 'fichier/SAE202/Branchement tinkercad .png' },
            { name: 'code_arduino1.txt',          type: 'code', src: 'fichier/SAE202/code_arduino1.txt' },
        ],
        sae203: [
            { name: 'fiche_personnelle.pdf',      type: 'pdf',  src: 'fichier/SAE203/fiche_personelle.pdf' },
            { name: 'firstproject.zip',           type: 'zip',  src: 'fichier/SAE203/firstproject.zip' },
        ],
        sae204: [
            { name: 'Alexis_STOCK_SAE2_04.docx', type: 'docx', src: 'fichier/SAE204/Alexis_STOCK_SAE2_04.docx' },
            { name: 'script_collecte.py',         type: 'code', src: 'fichier/SAE204/script_collecte.py' },
        ],
        sae101: [
            { name: 'Presentation.pptx',          type: 'pptx', src: 'fichier/SAE101/Les attaques par ingénierie sociale - Presentation.pptx' },
        ],
        sae102: [
            { name: 'Adressage IP et Vlan.pdf',   type: 'pdf',  src: 'fichier/SAE102/Adressage IP et Vlan.pdf' },
            { name: 'Config_Switch.txt',          type: 'code', src: 'fichier/SAE102/Configuration Commutateur.txt' },
        ],
        sae103: [
            { name: 'Heatmap_Wifi.png',           type: 'img',  src: 'fichier/SAE_1.03_2.PNG.png' },
            { name: 'Signal.png',                 type: 'img',  src: 'fichier/SAE_1.03.PNG.png' },
        ],
        sae104: [
            { name: 'Acceuil.html',               type: 'code', src: 'fichier/SAE104/Acceuil.html' },
            { name: 'E-réputation.pdf',           type: 'pdf',  src: "fichier/SAE104/Amélioration de mon'identité numérique et E-réputation.pdf" },
        ],
        sae105: [
            { name: 'Attaque_MITM.py',            type: 'code', src: 'fichier/SAE105/Attaque_homme_du_milieu.py' },
            { name: 'resultat.txt',               type: 'code', src: 'fichier/SAE105/resultat.txt' },
        ],
    };

    const iconMap = {
        pdf:  { icon: 'fa-file-pdf',        color: '#ff3e3e' },
        img:  { icon: 'fa-file-image',      color: '#4facfe' },
        zip:  { icon: 'fa-file-archive',    color: '#ffca28' },
        code: { icon: 'fa-file-code',       color: '#27c93f' },
        pptx: { icon: 'fa-file-powerpoint', color: '#ff6600' },
        docx: { icon: 'fa-file-word',       color: '#2b579a' },
    };

    const contentView = document.getElementById('folder-content');
    const placeholder = document.getElementById('explorer-placeholder');
    if (!contentView) return;

    function renderFolder(folderId) {
        placeholder?.style.setProperty('display', 'none');
        contentView.style.display = 'grid';

        const files = folderData[folderId] ?? [];

        if (files.length === 0) {
            contentView.innerHTML = '<p style="color:#555;grid-column:1/-1;text-align:center;">Dossier vide.</p>';
            return;
        }

        // ✅ DocumentFragment → un seul reflow DOM au lieu de N insertions
        const fragment = document.createDocumentFragment();
        files.forEach(({ name, type, src }) => {
            const { icon, color } = iconMap[type] ?? { icon: 'fa-file', color: '#aaa' };
            const card = document.createElement('div');
            card.className = 'file-card reveal active';
            // ✅ encodeURI — gère les espaces et accents dans les chemins de fichiers
            card.innerHTML = `
                <a href="${encodeURI(src)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">
                    <i class="fas ${icon} file-icon" style="color:${color};"></i>
                    <span class="file-name">${name}</span>
                </a>`;
            fragment.appendChild(card);
        });

        contentView.innerHTML = '';
        contentView.appendChild(fragment);
    }

    // ✅ Délégation sur le sidebar → un seul listener pour tous les folder-items
    document.querySelector('.explorer-sidebar')?.addEventListener('click', (e) => {
        const item = e.target.closest('.folder-item');
        if (!item) return;
        document.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
        item.classList.add('active');
        renderFolder(item.dataset.folder);
    });
}

/* ==========================================================================
   10. INITIALISATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMatrix();
    initReveal();
    initBackgroundChanger();
    initTypewriter();
    initAccordion();
    initProjectExplorer();
});
