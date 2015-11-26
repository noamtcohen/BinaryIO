/**
 * Created by noamc on 11/23/15.
 */

const util = require('util');
const EventEmitter = require('events');
var BioStream = require("../shared/biolib.js").BioStream;
var binaryServer = require('binaryjs').BinaryServer;

exports.Bio = Bio;

function Bio(opt) {
    EventEmitter.call(this);

    var _this = this;
    var server = binaryServer({port: opt.port});

    server.on('connection', function (client) {
        var bioConnection = new BioConnection(client,{packetSize:opt.packetSize});
        _this.emit("connection",bioConnection);
    });
}

function BioConnection(client,opt){
    EventEmitter.call(this);

    var _this = this;
    client.on('stream', function (stream, meta) {
        var bioS = new BioStream(stream,opt);
        _this.emit("stream",bioS);
    });
}

util.inherits(Bio, EventEmitter);
util.inherits(BioConnection, EventEmitter);
