# BinaryIO
BinaryJS with callbacks 

Server:
```javascript
var bio = require("./bio.js").Bio;

var server = new bio(9009);

server.on("connection", function (client) {
    client.on("stream",function(stream){

        stream.on("Hi", function (meta, buf, cb) {
            console.log(meta);
            cb({Hello: "Friend",x:meta.x+1},function(args,bioStream){
                console.log(args);
                var int8 = new Int8Array([1,2,3,10]);
                bioStream.call("client?",{z:"foo"},int8,function(args){
                    console.log(args);
                });
            });
        });

        stream.on("Whats Up?", function (meta, buf, cb) {
            console.log(meta);
            cb({Hi: "Hello to you too!"},function(args,bioStream){

            });
        });
    });
});
```
Client:
```javascript
var bio = Bio("ws://localhost:9009", function () {
    var ab = new ArrayBuffer(2);
    var uint8 = new Uint8Array(ab);
    uint8[0] = 10;
    uint8[1] = 11;

    var f64 = new Float64Array(7);
    f64[0] = 12;
    f64[6] = 100;

    var stream = bio.stream({something: 123});
    stream.call("Hi",{m:"hi",x: 1},uint8,function (args,bioS) {
        console.log(args);
        bioS.on("client?",function(meta,data,cb){
            console.log(meta);
            cb({what:"cb from client",x:args.x+1});
        });
    });

    stream.call("Whats Up?",{foo:"bar"},f64,function (args,bioS) {
        console.log(args);
    });
});
```

To conver your Blob or ArrayBuffer before sending use:
```javascript
var b = new Blob([]);
Bio.toTypeArray(b,Uint8Array,function(array){
});
```
type can be and typed array (`Int8Array,
Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array`).
