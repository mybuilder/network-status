/*global Promise*/

export function networkStatus(pingUri) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('GET', pingUri + '?' + +new Date, true);
        req.onload = () => {
            let status = (req.status === 1223) ? 204 : req.status;

            if (status < 100 || status > 599) {
                return reject(new Error('No network connection'));
            }

            resolve(true);
        };
        req.onerror = () => reject(new Error('No network connection'));
        req.send();
    });
}

export function monitorForReConnect({networkStatus, maxRetries, delay: delay = 2000}) {
    return new Promise((resolve, reject) => {
        let numTried = 0;

        setTimeout(function doRetry() {
            return networkStatus()
                .then(reachable => resolve(reachable))
                .catch(() => {
                    numTried++;

                    if (maxRetries && numTried >= maxRetries) {
                        return reject(new Error(`Maximum(${maxRetries}) retries reached`));
                    }

                    setTimeout(doRetry, delay);
                });
        }, delay);
    });
}
