/**
 * Created by noamc on 11/22/15.
 */

function Bio(url,onOpen) {
    var client = new BinaryClient(url);

    client.on("open",onOpen);

    client.on("stream",function(stream,meta){
        Bio._reqIds[meta.id](meta.data,stream);

        delete Bio._reqIds[meta.id];
    });

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
        var cnt = 0;
        for(var i in Bio._reqIds)
            if (Bio._reqIds.hasOwnProperty(i))
                cnt+=1;

        return cnt;
    }

    return {
        stream: function (meta) {
            var bStream = client.createStream(meta);
            return {
                call: function (event,data,meta, cb) {

                    var id = getNextReqId();

                    Bio._reqIds[id] = cb;

                    var head ={e: event, m: meta, id: id};

                    pack(data, head, function (buf) {
                        bStream.write(buf);
                    });
                }
            }
        },
        end:function(){
            client.end();
        }
    }
}

Bio._reqIds = {};

Bio.toTypeArray = function(data,type,onConverted){
    if(data instanceof Blob){
        blobToAb(data,function(ar){
            onConverted(new type(ar));
        });
        return;
    }

    if(data instanceof ArrayBuffer)
        onConverted(new type(data));

    function blobToAb(blob, cb) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            cb(this.result);
        };
        fileReader.readAsArrayBuffer(blob);
    }
}
