# BinaryIO
BinaryJS with callbacks 

Server:
```javascript
var bio = require("./bio.js").Bio;

var server = new bio(9009);

server.on("connection", function (client) {
    client.on("Hi", function (meta, buf, cb) {
        console.log(meta);
        console.log(buf.length);
        cb({Hello: "Friend"});
    });
    client.on("Whats Up?", function (meta, buf, cb) {
        console.log(meta);
        console.log(buf.length);
        cb({Hi: "Hello to you to!"});
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

      var int32 = new Float64Array(7);
      int32[0] = 12;
      int32[6] = 100;

      var stream = bio.stream({something: 123});
      stream.call({
          event: "Hi",
          data: uint8,
          meta: {meta: 1}
      }, function (args) {
          console.log(args);
      });

      stream.call({
          event: "Whats Up?",
          data: int32,
          meta: {meta: 2}
      }, function (args) {
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
