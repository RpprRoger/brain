(function( $, factory ) {
    
    if ( typeof module === "object" && typeof module.exports === "object" ) {
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
                    $el = $.apply( $, args ).pen( options );
                }

                return $el.data('pen');
            };
        };
    } else if( $ ) {
        $.fn.pen = factory( $, window );
    } else {
        throw 'this plugin depends on jQuery';
    }

})( jQuery, function( $, window, undefined ) {

    var defaults = {
            type: 'square',
            css: {

            },
            name: 'pen',
            minSheep: 1,
            maxSheep: 5
        },
        _requestAnimationFrame;

    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function( fn ) { return fn(); };

    function Pen( element, options ) {
        var $this = $(element);

        this.options = $.extend( true, {}, defaults, options );

        this.element = $this;

        this.init();

        return this;
    }

    $.extend( Pen.prototype, {

        'init': function() {

            var self = this;

            this.element
                .css( this.options.css )
                .css( 'border-radius', this.options.type === 'circle' ? '50%' : '0' )
                .addClass( this.options.name );
                
            this.addBrain();

            this.run();
        },

        'running': false,
        'run': function() {
            this.running = this.loop();
            return this.running;
        },
        'stop': function() {
            clearTimeout( this.running );
        },

        'loop': (function() {
            // Store last loop in this scope variable
            var lastLoop = Date.now(),
                targetFPS = 30,
                targetCycleTime = 1000 / targetFPS;

            return function loop() {
                var self = this,
                    start = Date.now(),
                    delta = start - lastLoop,
                    doTimeout;

                lastLoop = start;

                this.element.triggerHandler('tick', [ delta ]);

                // calculate how long we've been running so we can see how long to wait for the next tick
                doTimeout = targetCycleTime - (Date.now() - start);

                this.running = !isNaN( this.running ) ?
                    setTimeout(function() {
                        _requestAnimationFrame( loop.bind( self ) );
                    }, Math.max( 0, doTimeout ) ) : false;

                return this.running;
            };
        })(),

        'addBrain': function( opts ) {

            var $sheep = this.sheep().appendTo( this.element );

            $sheep.brain( opts );

            return $sheep;

        },

        'drawPixel': function( top, left ) {
            this.element.append( $('<div>').css({
                position: 'absolute',
                top: top,
                left: left,
                height: '1px',
                width: '1px',
                background: 'red'
            }) );
        },

        'sheep': function( type ) {
            var $sheep = $('<div>')
                .attr('data-type', type || 1)
                .attr('data-direction', 'up')
                .attr('data-animation', 1);

            //$sheep.append( $wool );

            return $sheep;
        }


    });

    return function( options ) {
        var args = Array.prototype.slice.call( arguments, 1 ),
            doPluginAction;

        doPluginAction = function() {

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