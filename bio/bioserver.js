/**
 * Created by noamc on 11/23/15.
 */

const util = require('util');
const EventEmitter = require('events');
var BioStream = require("./biolib.js").BioStream;
var binaryServer = require('binaryjs').BinaryServer;

exports.Bio = Bio;

function Bio(port) {
    EventEmitter.call(this);

    var _this = this;
    var server = binaryServer({port: port});

    server.on('connection', function (client) {
        var bioConnection = new BioConnection(client);
        _this.emit("connection",bioConnection);
    });
}

function BioConnection(client){
    EventEmitter.call(this);

    var _this = this;
    client.on('stream', function (stream, meta) {
        var bioS = new BioStream(stream,meta);
        _this.emit("stream",bioS);
    });
}

util.inherits(Bio, EventEmitter);
util.inherits(BioConnection, EventEmitter);
