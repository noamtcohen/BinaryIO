/**
 * Created by noamc on 11/24/15.
 */

(function(exports){
    exports.BasicEmitter = function(target,type){
        if(target.constructor != type)
            throw "Please construct " + type.name + " with new keyword";

        target._listeners = {};
        target.on = function(e,cb){
            target.trigger("newListener",e,cb);

            if(!target._listeners[e])
                target._listeners[e] = [];
            target._listeners[e].unshift({fun:cb});
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
})(exports||window);