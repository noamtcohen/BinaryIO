/**
 * Created by noamc on 11/22/15.
 */

function Bio(url,opt,onOpen) {
    BasicEmitter(this,Bio);

    var client = new BinaryClient(url);

    var that = this;
    client.on("open",function(){
        that.trigger("open");
    });

    this.createStream=function(meta) {
        var bStream = client.createStream(meta);
        return new BioStream(bStream,opt)
    };
}

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