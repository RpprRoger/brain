var $ = require('jquery');
// inject jquery plugins
require('./lib/pen')($);
require('./lib/brain')($);

$('#pen').pen();

$('#pen').on('click', function(e) {
    $('.sheep').brain('move', e.offsetX, e.offsetY);
});
