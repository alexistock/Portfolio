/* ==========================================================================
   1. VARIABLES D'ÉTAT GLOBALES
   ========================================================================== */
let matrixColor = "#0044ff"; // Bleu par défaut (Présentation)
let matrixChars = "01";       // Symboles par défaut

/* ==========================================================================
   2. FONCTIONS GLOBALES (Partagées)
   ========================================================================== */

// --- Gestion du Reveal au scroll (Apparition des éléments) ---
function initReveal() {
    const revealElements = document.querySelectorAll('.reveal, .bio-card, .glitch-text, .stat-item, .sae-card, .ac-item');
    
    const handleReveal = () => {
        revealElements.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleReveal);
    handleReveal();
}

// --- Navigation : Scroll & Style du Header ---
function initNavigation() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// --- Matrix Background Dynamique ---
function initMatrix() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(5, 5, 5, 0.2)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = matrixColor; 
        ctx.font = fontSize + "px monospace";
        
        for (let i = 0; i < drops.length; i++) {
            const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 50);
}

// --- Changeur de thème au scroll (Observer) ---
function initBackgroundChanger() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                switch(entry.target.id) {
                    case 'presentation': 
                        matrixColor = "#0044ff"; 
                        matrixChars = "01"; 
                        break;
                    case 'admin-reseaux': 
                        matrixColor = "#27c93f"; 
                        matrixChars = "192.168.ROOT"; 
                        break;
                    case 'connecter-usagers': 
                        matrixColor = "#00d4ff"; 
                        matrixChars = "📶 ToIP...CONNECTING...DATA...SSID"; 
                        break;
                    case 'outils-rt': 
                        matrixColor = "#ffa500"; 
                        matrixChars = "{ } => if() else print();"; 
                        break;
                    case 'si-securise': 
                        matrixColor = "#007bff"; 
                        matrixChars = "SHIELD_ENCRYPT_THREAT_SCAN_101010"; 
                        break;
                    case 'surveiller-si': 
                        matrixColor = "#27c93f"; 
                        matrixChars = "LOG_DETECT_ALERT_SCAN_PENTEST_777"; 
                        break;
                    case 'alternance': 
                        matrixColor = "#ff6600"; 
                        matrixChars = "CONSTELLIUM_ALUMINIUM_INFRA_24/7"; 
                        break;
                    case 'traces': 
                        matrixColor = "#888"; 
                        matrixChars = "DIR_LS_PWD_FILE_01"; 
                        break;
                }
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => observer.observe(s));
}

/* ==========================================================================
   3. LOGIQUE DE L'EXPLORATEUR DE TRACES (SAE)
   ========================================================================== */

function initProjectExplorer() {
    const folderData = {
        'sae501': [
            { name: 'Dashboard_LoRa.png', type: 'img', src: 'fichier/000000065391.png' },
            { name: 'Architecture_IoT.png', type: 'img', src: 'fichier/SAE_5.01_Schéma.png' }
        ],
        'sae301': [
            { name: 'Applications Téléphones.png', type: 'img', src: 'fichier/SAE3.01/Applications Téléphones.png' },
            { name: 'code utiliser.png', type: 'img', src: 'fichier/SAE3.01/code utiliser.png' }
        ],
        'sae302': [
            { name: 'SAE3.02.zip', type: 'zip', src: 'fichier/SAE3.02/SAE3.02.zip' }
        ],
        'sae303': [
            { name: 'Rapport FAI.pdf', type: 'pdf', src: 'fichier/SAE3.03/Rapport FAI.pdf' }
        ],
        'sae304': [
            { name: 'Challenge p1.png', type: 'img', src: 'fichier/SAE3.04/Challenge p1.png' },
            { name: 'classement.png', type: 'img', src: 'fichier/SAE3.04/classement.png' }
        ],
        'sae101': [
            { name: 'Presentation.pptx', type: 'doc', src: 'fichier/SAE101/Les attaques par ingénierie sociale - Presentation.pptx' }
        ],
        'sae102': [
            { name: 'Adressage IP et Vlan.pdf', type: 'pdf', src: 'fichier/SAE102/Adressage IP et Vlan.pdf' },
            { name: 'Config_Switch.txt', type: 'doc', src: 'fichier/SAE102/Configuration Commutateur.txt' }
        ],
        'sae103': [
            { name: 'Heatmap_Wifi.png', type: 'img', src: 'fichier/SAE_1.03_2.PNG.png' },
            { name: 'Signal.png', type: 'img', src: 'fichier/SAE_1.03.PNG.png' }
        ],
        'sae104': [
            { name: 'Acceuil.html', type: 'doc', src: 'fichier/SAE104/Acceuil.html' },
            { name: 'E-réputation.pdf', type: 'pdf', src: 'fichier/SAE104/Amélioration de mon\'identité numérique et E-réputation.pdf' }
        ],
        'sae105': [
            { name: 'Attaque_MITM.py', type: 'doc', src: 'fichier/SAE105/Attaque_homme_du_milieu.py' },
            { name: 'resultat.txt', type: 'doc', src: 'fichier/SAE105/resultat.txt' }
        ],
        'sae202': [
            { name: 'Branchement_Tinkercad.png', type: 'img', src: 'fichier/SAE202/Branchement tinkercad .png' },
            { name: 'code_arduino1.txt', type: 'doc', src: 'fichier/SAE202/code_arduino1.txt' }
        ],
        'sae203': [
            { name: 'fiche_personnelle.pdf', type: 'pdf', src: 'fichier/SAE203/fiche_personelle.pdf' },
            { name: 'firstproject.zip', type: 'zip', src: 'fichier/SAE203/firstproject.zip' }
        ],
        'sae204': [
            { name: 'Alexis_STOCK_SAE2_04.docx', type: 'doc', src: 'fichier/SAE204/Alexis_STOCK_SAE2_04.docx' },
            { name: 'script_collecte.py', type: 'doc', src: 'fichier/SAE204/script_collecte.py' }
        ],
    };

    const folderItems = document.querySelectorAll('.folder-item');
    const contentView = document.getElementById('folder-content');
    const placeholder = document.getElementById('explorer-placeholder');

    function displayFolderContent(folderId) {
        if(placeholder) placeholder.style.display = 'none';
        contentView.style.display = 'grid';
        contentView.innerHTML = '';

        const files = folderData[folderId];

        if (!files || files.length === 0) {
            contentView.innerHTML = '<p style="color:#666; grid-column: 1/-1; text-align:center;">Dossier vide ou fichiers non répertoriés.</p>';
            return;
        }

        files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-card reveal active';
            
            let icon = '<i class="far fa-file file-icon"></i>';
            if (file.type === 'pdf') icon = '<i class="fas fa-file-pdf file-icon" style="color: #ff3e3e;"></i>';
            else if (file.type === 'img') icon = '<i class="fas fa-file-image file-icon" style="color: #4facfe;"></i>';
            else if (file.type === 'zip') icon = '<i class="fas fa-file-archive file-icon" style="color: #ffca28;"></i>';
            else if (file.type === 'doc') icon = '<i class="fas fa-file-word file-icon" style="color: #2b579a;"></i>';

            fileDiv.innerHTML = `
                <a href="${file.src}" target="_blank" style="text-decoration:none; color:inherit;">
                    ${icon}
                    <span class="file-name">${file.name}</span>
                </a>
            `;
            contentView.appendChild(fileDiv);
        });
    }

    folderItems.forEach(item => {
        item.addEventListener('click', () => {
            folderItems.forEach(f => f.classList.remove('active'));
            item.classList.add('active');
            displayFolderContent(item.getAttribute('data-folder'));
        });
    });
}

/* ==========================================================================
   4. AUTRES FONCTIONS SPÉCIFIQUES
   ========================================================================== */

function initTypewriter() {
    const textElement = document.getElementById('typewriter');
    if (!textElement) return;

    const phrases = ["BUT Réseaux & Télécoms", "Cybersécurité", "Administration Système", "Réseaux Industriels"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    type();
}

function toggleSAE(header) {
    const card = header.parentElement;
    card.classList.toggle('active');
}

/* ==========================================================================
   5. INITIALISATION (DOM Ready)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMatrix();
    initReveal();
    initBackgroundChanger();
    initTypewriter();
    initProjectExplorer(); // Lancement de l'explorateur
});
