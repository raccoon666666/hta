var Promise = (function() {
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    function Promise(fn) {
        if (!(this instanceof Promise)) return new Promise(fn);
        var self = this;
        self._state = PENDING;
        self._value = null;
        self._deferreds = [];

        function resolve(newValue) {
            if (self._state !== PENDING) return;
            if (newValue && typeof newValue.then === 'function') {
                newValue.then(resolve, reject);
                return;
            }
            self._state = FULFILLED;
            self._value = newValue;
            self._finale();
        }

        function reject(reason) {
            if (self._state !== PENDING) return;
            self._state = REJECTED;
            self._value = reason;
            self._finale();
        }

        if (fn) {
            setTimeout(function() {
                fn(resolve, reject);
            }, 0);
        }
    }

    Promise.prototype.then = function(onFulfilled, onRejected) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var deferred = {
                onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null,
                onRejected: typeof onRejected === 'function' ? onRejected : null,
                resolve: resolve,
                reject: reject
            };
            if (self._state === PENDING) {
                self._deferreds.push(deferred);
            } else {
                setTimeout(function() {
                    self._handle(deferred);
                }, 0);
            }
        });
    };

    Promise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected);
    };

    Promise.prototype._handle = function(deferred) {
        var self = this;
        var cb = self._state === FULFILLED ? deferred.onFulfilled : deferred.onRejected;
        if (!cb) {
            if (self._state === FULFILLED) {
                deferred.resolve(self._value);
            } else {
                deferred.reject(self._value);
            }
            return;
        }
        var ret;
        try {
            ret = cb(self._value);
        } catch (e) {
            deferred.reject(e);
            return;
        }
        if (ret && typeof ret.then === 'function') {
            ret.then(deferred.resolve, deferred.reject);
        } else {
            deferred.resolve(ret);
        }
    };

    Promise.prototype._finale = function() {
        var self = this;
        var len = self._deferreds.length;
        for (var i = 0; i < len; i++) {
            (function(deferred) {
                setTimeout(function() {
                    self._handle(deferred);
                }, 0);
            })(self._deferreds[i]);
        }
        self._deferreds = null;
    };

    Promise.resolve = function(value) {
        return new Promise(function(resolve) { resolve(value); });
    };

    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) { reject(reason); });
    };

    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            var results = [];
            var remaining = 0;
            var len = 0;
            for (var k in promises) {
                if (promises.hasOwnProperty(k)) len++;
            }
            if (len === 0) {
                resolve(results);
                return;
            }
            remaining = len;
            for (var key in promises) {
                if (!promises.hasOwnProperty(key)) continue;
                (function(idx) {
                    var p = promises[idx];
                    if (p && typeof p.then === 'function') {
                        p.then(function(val) {
                            results[idx] = val;
                            remaining--;
                            if (remaining === 0) resolve(results);
                        }, reject);
                    } else {
                        results[idx] = p;
                        remaining--;
                        if (remaining === 0) resolve(results);
                    }
                })(key);
            }
        });
    };

    Promise.race = function(promises) {
        return new Promise(function(resolve, reject) {
            for (var k in promises) {
                if (!promises.hasOwnProperty(k)) continue;
                var p = promises[k];
                if (p && typeof p.then === 'function') {
                    p.then(resolve, reject);
                } else {
                    resolve(p);
                }
            }
        });
    };

    return Promise;
})();
