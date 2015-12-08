Network status
--------------

Allows checking the network status and re-connect.

Requires ES6 Promises

## Network status

From network `networkStatus` returns the current network state by giving a uri to ping e.g. `favicon.ico`.

```javascript
networkStatus('/favicon.ico')
    .then(isReachable)
    .catch(notReachable);
```

If the network connection is lost you can create a monitor for re-connection.

```javascript
let networkStatusFavicon = () => networkStatus('/favicon.ico');

networkStatusFaviconIco()
    .then(isReachable)
    .catch(error => {
        // update the UI to notify the user about lost network connection

        return monitorForReConnect({
            networkStatus: networkStatusFavicon,
            maxRetries: 100});
    })
    .then(() => {
        // update the UI, connection has been restored
    })
    .catch(error => {
        // maximum retries reached
    });
```

* `networkStatus` must be a function without arguments
* `maxRetries` if is set to 0 or `undefined` it will try forever (default: `undefined`)
* `delay` how long should be between network pings in milliseconds (default: `2000`)
