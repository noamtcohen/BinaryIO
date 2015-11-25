/**
 * Created by noamc on 11/24/15.
 */

(function(exports){
    exports.BasicEmitter = function(target,type){
        if(target.constructor != type)
            throw "Please construct " + type.name + " with new keyword";

        target._listeners = {};
        target.on = function(e,cb,once){
            target.emit("newListener",e,cb);

            if(!target._listeners[e])
                target._listeners[e] = [];
            target._listeners[e].unshift({fun:cb,once:once||false});
        }

        target.once = function(e,cb){
            target.on(e,cb,true);
        }

        target.emit=function(){
            var args = toArray(arguments);

            var e = args[0];

            if(target._listeners [e]) {
                var toApply = args.slice(1);
                for (var i = target._listeners[e].length-1; i>=0;i--){
                    var eInfo=target._listeners[e][i];
                    eInfo.fun.apply(null,toApply);
                    if(eInfo.once)
                        target._listeners[e].slice(i,1);
                }
            }
        }

        target.listenerCount = function(e){
            if(!target._listeners [e])
                return 0;

            return target._listeners[e].length;
        }

        target.listenerCount = function(e){
            if(target._listeners[e])
                return target._listeners[e].length;
            return 0;
        }

        target.removeAllListeners = function(e){
            for(var i=0;i< e.length;i++)
                delete target._listener[e[i]];
        }

        target.removeListener = function(e,cb){
            if(target._listeners[e]) {
                for(var i=0;i<target._listeners[e].length;i++) {
                    if(target._listeners[e][i].fun == cb) {
                        target._listeners[e].slice(i,1);
                        target.emit("removeListener",e,cb);
                    }
                }
            }
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
})(exports||window);