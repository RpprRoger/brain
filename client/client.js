var $ = require('jquery');
// inject jquery plugins
require('./lib/pen')($);
require('./lib/brain')($);

$('#pen').pen();
$('#pen').pen('addBrain', {type: 3});
window.pen = $('#pen').data('pen');
$('#pen').on('click', function(e) {
    $('.sheep').brain('move', e.offsetX, e.offsetY);
});
