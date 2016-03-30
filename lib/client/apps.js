//Apps.js: Client for the zendesk API.
'use strict';

var util                = require('util'),
    Client              = require('./client').Client,
    getAppJobStatuses   = require('./helpers').getAppJobStatuses,
    interval            = 500,
    maxAttempts         = 20,
Apps = exports.Apps     = function (options) {
    Client.call(this, options);
};

// Inherit from Client base object
util.inherits(Apps, Client);

// ====================================== List Owned Apps
Apps.prototype.owned = function(cb) {
    this.request('GET', ['apps', 'owned'],  cb);
};

// ====================================== Get Information About App
Apps.prototype.show = function(appId, cb) {
    this.request('GET', ['apps', appId],  cb);
};

// ====================================== Upload a new app package
Apps.prototype.upload = function (file, appOptions, cb) {
    var self = this;

    this.requestUploadApp(['apps', 'uploads'], file, appOptions, function(err, req, result) {
        if (err) {
            return cb(err);
        }

        delete self.options.formData;
        appOptions['upload_id'] = result.id;

        self.request('POST', ['apps'], appOptions, function(err, req, result) {
            if (err) {
                return cb(err);
            }

            getAppJobStatuses({
                username:  self.options.get('username'),
                token: self.options.get('token'),
                remoteUri: self.options.get('remoteUri') + '/apps'
            }, result.job_id, interval, maxAttempts, cb);
        });
    });
};

// ====================================== Delete an App
Apps.prototype.delete = function (token, cb) {
  this.request('DELETE', ['apps', token],  cb);
};

// ====================================== List App installations
Apps.prototype.installations = function (cb) {
  this.request('GET', ['apps', 'installations'],  cb);
};

// ====================================== Install an App
Apps.prototype.install = function (options, cb) {
  this.request('POST', ['apps', 'installations'], options, cb);
};
