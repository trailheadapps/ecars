let applicationServerPublicKey = null;
let _isSubscribed = false;
let swRegistration = null;

const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

const createSubscription = (subscription, lead, car) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subscription, lead, car })
        };
        fetch('/api/subscription', options).then(function (response) {
            if (!response.ok) {
                reject(new Error('Bad status code from server.'));
            }
            resolve();
        });
    });
};

const deleteSubscription = (subscription) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        };
        fetch('/api/subscription', options).then(function (response) {
            if (!response.ok) {
                reject(new Error('Bad status code from server.'));
            }

            resolve();
        });
    });
};

const isSubscribed = () => {
    return _isSubscribed;
};

const registerServiceWorker = () => {
    navigator.serviceWorker
        .register('/sw.js')
        .then((swReg) => {
            console.log('Service Worker is registered', swReg);
            swRegistration = swReg;
            console.log(swRegistration);
            return swRegistration.pushManager.getSubscription();
        })
        .then((subscription) => {
            _isSubscribed = subscription !== null;
            console.log('Subscribed: ' + _isSubscribed);
        })
        .catch((err) => {
            console.error('Error', err);
        });
};

const subscribe = (lead, car) => {
    return new Promise((resolve, reject) => {
        console.log(swRegistration);
        const applicationServerKey = urlB64ToUint8Array(
            applicationServerPublicKey
        );
        const options = {
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        };
        swRegistration.pushManager
            .subscribe(options)
            .then((subscription) => createSubscription(subscription, lead, car))
            .then(() => {
                console.log('User subscribed successfully');
                _isSubscribed = true;
                resolve();
            })
            .catch((err) => reject(err));
    });
};

const unsubscribe = () => {
    return new Promise((resolve, reject) => {
        let subscription;
        swRegistration.pushManager
            .getSubscription()
            .then(function (subscr) {
                subscription = subscr;
                if (!subscription) {
                    throw new Error('The user is not subscribed');
                } else {
                    return subscription.unsubscribe();
                }
            })
            .then(() => deleteSubscription(subscription))
            .then(() => {
                console.log('User unsubscribed successfully');
                _isSubscribed = false;
                resolve();
            })
            .catch((err) => reject(err));
    });
};

const fetchPublicKey = () => {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    fetch('/api/publickey', options)
        .then((response) => {
            let json = response.json();
            if (!response.ok || !json) {
                console.log('No public key retrieved');
            }
            return json;
        })
        .then((json) => {
            applicationServerPublicKey = json.key;
            console.log(applicationServerPublicKey);
        });
};

fetchPublicKey();
if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
    registerServiceWorker();
} else {
    console.warn('Push messaging is not supported');
}

export { subscribe, unsubscribe, isSubscribed };
