/**
 * Created by noamc on 11/23/15.
 */

const util = require('util');
const EventEmitter = require('events');

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
        _this.emit("stream",stream,meta);

        var tmp;
        var headerLen;
        var head;
        stream.on("data", function (data) {
            if (!tmp) {
                tmp = data;
                headerLen = tmp[0];
            }
            else {
                tmp = tmp.concat(data);
            }

            if (!head && tmp.length >= headerLen) {
                var header = new Array(headerLen);
                for (var i = 0; i < headerLen; i++)
                    header[i] = data[i + 1];

                head = JSON.parse(String.fromCharCode.apply(this,header));
            }

            if (head && tmp.length > (headerLen + head.l)) {
                var id = head.id;
                _this.emit(head.e,head.m,tmp.slice(headerLen+1,headerLen + head.l+1),function(args){
                    client.createStream({id: id, data: args});
                });
                tmp = null;
                head = null;
                headerLen=0;
            }
        })
    });
}

util.inherits(Bio, EventEmitter);
util.inherits(BioConnection, EventEmitter);
