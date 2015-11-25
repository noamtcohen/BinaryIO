/**
 * Created by noamc on 11/23/15.
 */

var BasicEmitter = require("./basic-emitter.js").BasicEmitter;

(function(exports){
    var _reqIds = {};

    exports.BioStream = BioStream;

    function BioStream(bStream,opt){
        BasicEmitter(this,BioStream);

        var that = this;

        var bioPack = new BioPacket(bStream);
        bioPack.on("packet",function(head,data){
            var id=head.id;
            that.emit(head.e,head.m,data,function(arg, cb){
                that.call("@callback?",{id:id,data:arg,e:head.e},new Uint8Array(0),cb);
            });
        });

        this.call = function (event, meta, data, cb) {
            function pack(data, head, cb) {
                if(!knownType(data))
                    throw "Please convert your Blob/ArrayBuffer/Buffer to a TypedArray/Array";

                var arrToSend;
                if(data instanceof Array)
                    arrToSend = data;
                else if(data.buffer)
                    arrToSend = Array.prototype.slice.call(data);
                else
                    arrToSend =[data];

                head.l = arrToSend.length;
                var header = toByteArray(JSON.stringify(head));
                header.unshift(header.length);

                Array.prototype.unshift.apply(arrToSend,header);

                cb(arrToSend);

                function toByteArray(str) {
                    var bytes = [];
                    for (var i = 0; i < str.length; ++i)
                        bytes.push(str.charCodeAt(i));

                    return bytes;
                }
            }

            function knownType(data){
                if(data instanceof ArrayBuffer)
                    return false;
                if(typeof Blob !== 'undefined' && data instanceof Blob)
                    return false;
                if(typeof Buffer !== 'undefined' && data instanceof Buffer)
                    return false;

                return true;
            }

            function getNextReqId(){
                var next = 0;

                for(var i in _reqIds) {
                    if (_reqIds.hasOwnProperty(i)) {
                        var id = parseInt(i);
                        if (next <= id)
                            next = id + 1;
                    }
                }

                return next;
            }

            var head ={e: event, m: meta};
            if(cb){
                var id = getNextReqId();
                _reqIds[id] = cb;
                head.id=id;
            }

            pack(data, head, function (buf) {
                for(var i=0;i<buf.length;i+=opt.packetSize) {
                    var sub = buf.slice(i,i+opt.packetSize);
                    bStream.write(sub);
                }
            });
        }

        this.on("@callback?",function(meta,data,cb){
            if(typeof meta.id === "undefined")
                return;

            _reqIds[meta.id](meta.data,that);

            delete _reqIds[meta.id];

            cb({fin:meta.e});
        });
    }

    function BioPacket(stream,onPacket){
        BasicEmitter(this,BioPacket);

        var tmp;
        var headerLen;
        var head;

        var that = this;
        stream.on("data", function (data) {
            if (!tmp) {
                tmp = data;
                headerLen = tmp[0];
            }
            else {
                tmp = tmp.concat(data);
            }

            if (!head && tmp.length > headerLen) {
                var header = new Array(headerLen);
                for (var i = 0; i < headerLen; i++)
                    header[i] = tmp[i + 1];

                var json=String.fromCharCode.apply(this,header);
                head = JSON.parse(json);
            }

            if (head && tmp.length > (headerLen + head.l)) {
                that.emit("packet",head,tmp.slice(headerLen+1,headerLen + head.l+1));
                tmp = null;
                head = null;
                headerLen=0;
            }
        })
    }

})(exports||window);