/**
 * Created by noamc on 11/23/15.
 */
Bio._reqIds = {};

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

function BioStream(bStream,meta){
    BasicEmitter(this,BioStream);

    var that = this;
    this.packet = new BioPacket(bStream,function(head,data){
        var id=head.id;
        that.trigger(head.e,head.m,data,function(arg, cb){
            that.call("_callback",{id:id,data:arg,e:head.e},new Uint8Array(0),cb);
        });
    });

    this.call = function (event, meta, data, cb) {
        function pack(data, head, cb) {
            if(!data.buffer)
                throw "Please send typed array. Use: `Bio.toTypeArray(data,type,cb)` to convert your ArrayBuffer or Blob.";

            head.l = data.length;
            var header = toByteArray(JSON.stringify(head));
            header.unshift(header.length);

            var totalLength = data.length + header.length;

            totalLength += (8-(totalLength % 8))

            var rtn = new data.constructor(totalLength);

            for (var i = 0; i < header.length; i++)
                rtn[i] = header[i];

            for (var i = 0; i < data.length; i++)
                rtn[header.length+i] = data[i];

            cb(Array.prototype.slice.call(rtn));

            function toByteArray(str) {
                var bytes = [];
                for (var i = 0; i < str.length; ++i)
                    bytes.push(str.charCodeAt(i));

                return bytes;
            }
        }

        function getNextReqId(){
            var next = 0;

            for(var i in Bio._reqIds) {
                if (Bio._reqIds.hasOwnProperty(i)) {
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
            Bio._reqIds[id] = cb;
            head.id=id;
        }

        pack(data, head, function (buf) {
            bStream.write(buf);
        });
    }

    this.on("_callback",function(meta,data,cb){
        if(typeof meta.id === "undefined")
            return;

        Bio._reqIds[meta.id](meta.data,that);

        delete Bio._reqIds[meta.id];

        cb({fin:meta.e});
    });
}

function BasicEmitter(target,type){
    if (target.constructor != type)
        throw "Please constract "+type.name+" with new operator.";

    target._listeners = {};
    target.on = function(e,cb){
        target.trigger("newListener",e,cb);

        if(!target._listeners[e])
            target._listeners[e] = [];
        target._listeners[e].push({fun:cb});
    }
    
    target.trigger=function(){
        var args = toArray(arguments);

        var e = args[0];

        if(target._listeners [e]) {
            var apply = args.slice(1);
            for (var i = 0; i < target._listeners[e].length;i++){
                target._listeners[e][i].fun.apply(null,apply);
            }
        }
    }

    target.listenerCount = function(e){
        if(!target._listeners [e])
            return 0;

        return target._listeners[e].length;
    }

    function toArray(obj){
        var rtn = [];
        for(var key in obj)
        {
            if (!obj.hasOwnProperty(key))
                continue;

            var index = parseInt(key);
            rtn[index] = obj[key];
        }
        return rtn;
    }
}