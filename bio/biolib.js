/**
 * Created by noamc on 11/23/15.
 */


var BasicEmitter = require("./basic-emitter.js").BasicEmitter;

(function(exports){
    var _reqIds = {};

    exports.BioStream = BioStream;

    function BioStream(bStream,meta){
        BasicEmitter(this,BioStream);

        var that = this;
        this.packet = new BioPacket(bStream,function(head,data){
            var id=head.id;
            that.trigger(head.e,head.m,data,function(arg, cb){
                that.call("@callback?",{id:id,data:arg,e:head.e},new Uint8Array(0),cb);
            });
        });

        this.call = function (event, meta, data, cb) {
            function pack(data, head, cb) {
                if(!data.buffer && !(data instanceof Array))
                    throw "Please send TypedArray or Array. Use: `Bio.toTypeArray(data,type,cb)` to convert your ArrayBuffer or Blob.";

                var arrToSend =(data instanceof Array)?data:Array.prototype.slice.call(data);

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
                bStream.write(buf);
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
                onPacket(head,tmp.slice(headerLen+1,headerLen + head.l+1));
                tmp = null;
                head = null;
                headerLen=0;
            }
        })
    }

})(exports||window);