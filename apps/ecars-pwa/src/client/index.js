import '@lwc/synthetic-shadow';
import UxApp from 'ux/app';

const availableFeature = detectFeatures();
const isNotCompatibleBrowser = Object.keys(availableFeature).some(
    (feature) => !availableFeature[feature]
);

if (isNotCompatibleBrowser) {
    unsupportedErrorMessage(availableFeature);
} else {
    customElements.define('ux-app', UxApp.CustomElementConstructor);

    if ('serviceWorker' in navigator) {
        // Register service worker after page load event to avoid delaying critical requests for the
        // initial page load.
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    if (reg.installing) {
                        console.log('Service worker installing');
                    } else if (reg.waiting) {
                        console.log('Service worker installed');
                    } else if (reg.active) {
                        console.log('Service worker active');
                    }
                    if (Notification.permission === 'denied') {
                        console.log('The user has blocked notifications.');
                    }
                })
                .catch((regError) => {
                    console.log(
                        'Error on service worker registration: ' + regError
                    );
                });
        });
    }
}

function detectFeatures() {
    return {
        'Service Worker': 'serviceWorker' in navigator,
        'Push Manager': 'PushManager' in window
    };
}

function unsupportedErrorMessage() {
    const { outdated } = window;
    outdated.style.display = 'unset';

    let message = `This browser doesn't support all the required features`;

    message += `<ul>`;
    for (const [name, available] of Object.entries(availableFeature)) {
        message += `<li><b>${name}:<b> ${available ? '✅' : '❌'}</li>`;
    }
    message += `</ul>`;

    // eslint-disable-next-line @lwc/lwc/no-inner-html
    outdated.querySelector('.unsupported_message').innerHTML = message;
}
