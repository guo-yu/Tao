var fs = require('fs'),
    watch = require('watch'),
    connect = require('connect');

var Server = function(dir) {
    this.configs = {
        dir: dir ? dir : __dirname,
        port: 3001,
        format: 'dev',
        hidden: false
    };
    this.server = connect();
    this.server.use(connect.logger(this.configs.format));
    this.server.use(connect.static(this.configs.dir, { hidden: this.configs.hidden }));
    this.server.use(connect.directory(this.configs.dir, { hidden: this.configs.hidden }));
};

Server.prototype.watch = function(callback) {
    watch.createMonitor(this.configs.dir, function(monitor) {
        monitor.on("created", function(f, stat) {
            callback(f, 'created', stat);
        });
        monitor.on("changed", function(f, curr, prev) {
            callback(f, 'changed', {
                curr: curr,
                prev: prev
            });
        });
        monitor.on("removed", function(f, stat) {
            callback(f, 'removed', stat);
        });
    });
};

Server.prototype.run = function(port, callback) {
    this.server.listen(port && !isNaN(parseInt(port, 10)) ? parseInt(port, 10) : this.configs.port, function() {
        if (callback && typeof(callback) === 'function') callback();
    });
};

exports = module.exports = Server;