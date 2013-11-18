var fs = require('fs'),
    watch = require('watch'),
    connect = require('connect'),
    socket = require('socket.io'),
    path = require('path');

var Server = function(config) {
    var self = this;
    this.configs = {};
    this.configs.dir = config.dir ? config.dir : __dirname;
    this.configs.port = config.port && !isNaN(parseInt(config.port, 10)) ? parseInt(config.port, 10) : 3001;
    this.configs.format = 'dev';
    this.configs.hidden = false;
    this.configs.socket = config.socket ? config.socket : false;
    this.configs.type = config.type ? config.type : 'normal';
    this.server = connect();
    this.server.use(connect.logger(this.configs.format));
    this.server.use(connect.static(path.join(this.configs.dir,'/public'), { hidden: this.configs.hidden }));
    if (this.configs.type === 'list') this.server.use(connect.directory(this.configs.dir, { hidden: this.configs.hidden }));
    if (this.configs.socket) this.io = socket.listen(this.configs.port + 1);
    if (this.io) {
        this.io.sockets.on('connection', function (socket) {
            self.socket = socket;
        });
    }
};

Server.prototype.use = function(middleware) {
    this.server.use(middleware);
}

Server.prototype.emit = function(key, value) {
    if (this.socket) this.socket.emit(key, value);
}

Server.prototype.watch = function(callback) {
    var self = this;
    watch.createMonitor(this.configs.dir, function(monitor) {
        monitor.on("created", function(f, stat) {
            callback('created', f, stat);
        });
        monitor.on("changed", function(f, curr, prev) {
            callback('changed', f, {
                curr: curr,
                prev: prev
            });
        });
        monitor.on("removed", function(f, stat) {
            callback('removed', f, stat);
        });
    });
};

Server.prototype.run = function(port, callback) {
    this.server.listen(port && !isNaN(parseInt(port, 10)) ? parseInt(port, 10) : this.configs.port, function() {
        if (callback && typeof(callback) === 'function') callback();
    });
};

exports = module.exports = Server;