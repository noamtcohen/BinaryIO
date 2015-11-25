# BinaryIO
BinaryJS with callbacks 

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
            console.log(data);
            cb({what:"cb from client",x:args.x+1});
        });
    });

    stream.call("Whats Up?",{foo:"bar"},f64,function (args,bioS) {
        console.log(args);
    });

    stream.call("string array",{},[1.2,2.10,3.12,"a","b","c"],function (args,bioS) {
        console.log(args);
    });
});
```

Server:
```javascript
var bio = require("./bioserver.js").Bio;

var server = new bio(9009);

server.on("connection", function (client) {
    client.on("stream",function(stream){

        stream.on("Hi", function (meta, buf, cb) {
            console.log(meta);
            console.log(buf);
            cb({Hello: "Friend",x:meta.x+1},function(args,bioStream){
                var int8 = new Int8Array([1,2,3,10]);
                bioStream.call("client?",{z:"foo"},int8,function(args){
                    console.log(args);
                });
            });
        });

        stream.on("Whats Up?", function (meta, buf, cb) {
            console.log(buf);
            cb({Hi: "Hello to you too!"},function(args,bioStream){

            });
        });
        stream.on("string array", function (meta, buf, cb) {
            console.log(buf);
            cb({array: "got it"},function(args,bioStream){

            });
        });
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


Event names that start with "@" and end with "?" (like: "@callback?") are reserved.
