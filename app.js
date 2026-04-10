// -------------------------------
// Device Detection Logic
// -------------------------------
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1) || (window.innerWidth <= 768);
}

function checkDeviceAccess() {
    const desktopFallback = document.getElementById('desktop-fallback');
    const mobileApp = document.getElementById('mobile-app');
    
    // For local testing in browser, we can mock or force allow if needed, 
    // but we'll stick to strict width & user-agent checking as requested.
    if (!isMobileDevice()) {
        desktopFallback.classList.remove('hidden');
        mobileApp.classList.add('hidden');
    } else {
        desktopFallback.classList.add('hidden');
        mobileApp.classList.remove('hidden');
        
        // Initialize Icons
        lucide.createIcons();
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', checkDeviceAccess);
// Also run on resize to adapt immediately if testing responsive mode
window.addEventListener('resize', checkDeviceAccess);


// -------------------------------
// State & Data
// -------------------------------
const productsData = {
    1: {
        title: "ساعة آبل نسخة TU",
        img: "images/TU Apple Watch.jpg",
        timer: "الفرز بعد 2 يوم و 6 ساعة"
    },
    2: {
        title: "صندوق عشوائي",
        img: "images/box.png",
        timer: "الفرز بعد 5 يوم و 12 ساعة"
    },
    3: {
        title: "تيشرت TU حصري",
        img: "images/tshirt.webp",
        timer: "الفرز بعد 1 يوم و 4 ساعة"
    }
};

let currentGuessProductId = null;


// -------------------------------
// History & State Management
// -------------------------------
history.replaceState({ view: 'view-main' }, "", "#view-main");

window.addEventListener('popstate', (event) => {
    // Close overlays if open
    const activeOverlays = document.querySelectorAll('.overlay.active');
    if (activeOverlays.length > 0) {
        activeOverlays.forEach(overlay => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        });
        // Push state back to prevent falling back a view
        history.pushState({ view: getCurrentViewId() }, "", window.location.hash);
        return;
    }

    if (event.state && event.state.view) {
        switchView(event.state.view, false); // false to not push state again
        
        // Handle theme changing based on history state
        if (event.state.view === 'view-main') {
            document.body.classList.remove('theme-d360');
            document.body.classList.remove('theme-mobily');
            document.getElementById('header-d360-logo').classList.add('hidden');
            if (document.getElementById('header-mobily-logo')) {
                document.getElementById('header-mobily-logo').classList.add('hidden');
            }
            document.getElementById('header-tu-logo').classList.remove('hidden');
        } else if (event.state.view === 'view-event-intro' || event.state.view === 'view-products') {
            document.body.classList.add('theme-d360');
            document.body.classList.remove('theme-mobily');
            document.getElementById('header-tu-logo').classList.add('hidden');
            if (document.getElementById('header-mobily-logo')) {
                document.getElementById('header-mobily-logo').classList.add('hidden');
            }
            document.getElementById('header-d360-logo').classList.remove('hidden');
        } else if (event.state.view === 'view-mobily-intro') {
            document.body.classList.add('theme-mobily');
            document.body.classList.remove('theme-d360');
            document.getElementById('header-tu-logo').classList.add('hidden');
            document.getElementById('header-d360-logo').classList.add('hidden');
            document.getElementById('header-mobily-logo').classList.remove('hidden');
        }
    }
});

function getCurrentViewId() {
    const active = document.querySelector('.active-view');
    return active ? active.id : 'view-main';
}

function switchView(viewId, pushToHistory = true) {
    if (pushToHistory) {
        history.pushState({ view: viewId }, "", `#${viewId}`);
    }

    // Hide all views
    document.querySelectorAll('.view').forEach(el => {
        el.classList.remove('active-view');
        setTimeout(() => el.classList.add('hidden'), 300); // Wait for fade out
    });
    
    // Show target view
    setTimeout(() => {
        const target = document.getElementById(viewId);
        if(target) {
            target.classList.remove('hidden');
            target.classList.add('active-view');
        }
    }, 300);
}

// Flow 2: Click "إطلاع على الحدث" -> Open D360 Event Intro
function goToEvent() {
    switchView('view-event-intro');
    
    // Switch Theme & Header
    document.body.classList.remove('theme-mobily');
    document.body.classList.add('theme-d360');
    document.getElementById('header-tu-logo').classList.add('hidden');
    if (document.getElementById('header-mobily-logo')) {
        document.getElementById('header-mobily-logo').classList.add('hidden');
    }
    document.getElementById('header-d360-logo').classList.remove('hidden');
}

function goToMobilyEvent() {
    switchView('view-mobily-intro');
    
    // Switch Theme & Header
    document.body.classList.remove('theme-d360');
    document.body.classList.add('theme-mobily');
    document.getElementById('header-tu-logo').classList.add('hidden');
    document.getElementById('header-d360-logo').classList.add('hidden');
    document.getElementById('header-mobily-logo').classList.remove('hidden');
}

function resetToHome() {
    switchView('view-main');
    
    // Revert Theme
    document.body.classList.remove('theme-d360');
    document.body.classList.remove('theme-mobily');
    
    // Revert Headers
    document.getElementById('header-d360-logo').classList.add('hidden');
    if (document.getElementById('header-mobily-logo')) {
        document.getElementById('header-mobily-logo').classList.add('hidden');
    }
    document.getElementById('header-tu-logo').classList.remove('hidden');
}


// -------------------------------
// Popups & Interactions
// -------------------------------

function openPopup(id) {
    document.getElementById(id).classList.remove('hidden');
    // small delay to allow display:block to apply before animating opacity
    setTimeout(() => {
        document.getElementById(id).classList.add('active');
    }, 10);
}

function closePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove('active');
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 300); // match css transition
}

// Auth Popup
function closeAuth() {
    closePopup('auth-popup');
}

// Rules Popup
function openRulesPopup() {
    openPopup('rules-popup');
}

function acceptRules() {
    closePopup('rules-popup');
    // Proceed to Products View
    switchView('view-products');
}

// Guessing Product Popup
function openProduct(id) {
    currentGuessProductId = id;
    const prod = productsData[id];
    
    if(prod) {
        document.getElementById('guess-prod-img').src = prod.img;
        document.getElementById('guess-prod-title').innerText = prod.title;
        document.querySelector('#guess-popup .small-cnt').innerHTML = `<i data-lucide="timer"></i> ${prod.timer}`;
        
        // re-init icons as DOM changed
        lucide.createIcons();
        openPopup('guess-popup');
    }
}

function submitGuess() {
    const guessInput = document.getElementById('guess-price').value;
    if(!guessInput || isNaN(guessInput)) {
        alert('الرجاء إدخال مبلغ صحيح'); // Keeping alert for simple validation natively, but we can change this easily later if requested
        return;
    }
    
    closePopup('guess-popup');
    document.getElementById('guess-price').value = ''; // clear input
    
    // Show loading popup
    setTimeout(() => {
        openPopup('loading-popup');
        
        // Wait 3 seconds, then show success popup
        setTimeout(() => {
            closePopup('loading-popup');
            setTimeout(() => {
                openPopup('success-popup');
            }, 300); // Wait for loading out-animation
        }, 3000);
    }, 400); // Wait for guess popup out-animation
}

// Success Popup & D360 Forms
function showIdSubmission() {
    document.getElementById('success-buttons').classList.add('hidden');
    document.getElementById('submit-id-section').classList.remove('hidden');
}

function sendId() {
    const d360Id = document.getElementById('d360-id').value;
    if(!d360Id) {
        alert('الرجاء إدخال المعرف');
        return;
    }
    
    // Switch from alert to Native Popup
    closePopup('success-popup');
    
    setTimeout(() => {
        lucide.createIcons();
        openPopup('final-popup');
    }, 400);
    
    // Reset view for future actions
    setTimeout(() => {
        document.getElementById('success-buttons').classList.remove('hidden');
        document.getElementById('submit-id-section').classList.add('hidden');
        document.getElementById('d360-id').value = '';
        document.getElementById('d360-email').value = '';
    }, 400);
}

function openDownloadPopup() {
    closePopup('success-popup');
    setTimeout(() => {
        lucide.createIcons();
        openPopup('download-popup');
    }, 400);
}
