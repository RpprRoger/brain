(function( $, factory ) {
    
    if ( typeof module === 'object' && typeof module.exports === 'object' ) {
        // For CommonJS and CommonJS-like environments where a proper window is present,
        module.exports = function( $ ) {
            //factory;
            var plugin = $.fn.pen = factory( $, window );
            // return a function which will add this plugin to the element/selector passed
            return function( selector, context ) {
                var args = Array.prototype.slice.call( arguments ),
                    options = args.pop(),
                    $el;

                if( typeof options !== 'object' ) {
                    $el = $( selector, context ).pen();
                } else {
                    $el = plugin.apply( $, args ).pen( options );
                }

                return $el.data('pen');
            };
        };
    } else if( $ ) {
        $.fn.pen = factory( $, window );
    } else {
        throw 'this plugin depends on jQuery';
    }

})( window.jQuery, function( $, window, undefined ) {
    var defaults = {
        type: 'square',
        css: {},
        name: 'pen',
        minSheep: 1,
        maxSheep: 5,
        targetFPS: 30
    };
    var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function( fn ) { return fn(); };

    function Pen( element, options ) {
        var $this = $(element);

        this.options = $.extend( true, {}, defaults, options );

        this.element = $this;

        this.init();

        return this;
    }

    Pen.prototype.init = function() {
        this.element
            .css( this.options.css )
            .css( 'border-radius', this.options.type === 'circle' ? '50%' : '0' )
            .addClass( this.options.name );

        this.lastLoop = Date.now();
        this.targetCycleTime = 1000 / this.options.targetFPS;
        this.running = false;

        this.loop = this.bind('loop');

        this.run();
    };

    Pen.prototype.bind = function( fn, context ) {
        var func = typeof fn === 'function' ? fn : this[ fn ];

        context = context || this;
        if( Function.prototype.bind ) {
            return func.bind( context );
        }
        return function() {
            return func.apply( context, arguments );
        };
    };

    Pen.prototype.run = function() {
        this.running = this.loop();
        return this.running;
    };
    Pen.prototype.stop = function() {
        clearTimeout( this.running );
    };

    Pen.prototype.loop = function loop() {
        var self = this;
        var start = Date.now();
        var delta = start - this.lastLoop;
        var doTimeout;

        this.lastLoop = start;

        this.element.triggerHandler('tick', [ delta ]);

        // calculate how long we've been running so we can see how long to wait for the next tick
        doTimeout = this.targetCycleTime - (Date.now() - start);

        this.running = setTimeout(function() {
            _requestAnimationFrame(self.loop);
        }, Math.max( 0, doTimeout ) );

        return this.running;
    };

    Pen.prototype.addBrain = function( opts ) {
        var $sheep = this.sheep().appendTo( this.element );

        $sheep.brain( opts );

        return $sheep;
    };

    Pen.prototype.drawPixel = function( top, left ) {
        this.element.append( $('<div>').css({
            position: 'absolute',
            top: top,
            left: left,
            height: '1px',
            width: '1px',
            background: 'red'
        }) );
    };

    Pen.prototype.sheep = function( type ) {
        var $sheep = $('<div>')
            .attr('data-type', type || 1)
            .attr('data-direction', 'up')
            .attr('data-animation', 1);

        //$sheep.append( $wool );

        return $sheep;
    };

    return function( options ) {
        var args = Array.prototype.slice.call( arguments, 1 );

        function doPluginAction() {

            var pen = $.data( this, 'pen' );

            if( !pen ) {
                $.data( this, 'pen', new Pen( this, options ) );
            } else {
                return pen[options].apply( pen, args );
            }

            return this;
        };

        return this.length > 1 ? this.each( doPluginAction ) : doPluginAction.call( this[0] );
    };

});