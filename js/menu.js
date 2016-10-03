// # SIMPLE TOGGLE
// Use this to just toggle the class .active into .navbar
;
(function($) {
    $.fn.sidenav = function() {

        var sidenav = this,
            $trigger = $(".js-sidenav");

        $trigger.click(toggle);

        function toggle() {
            sidenav.toggleClass("active");
        }
    }
})(jQuery);
// # INITIALIZING
$(function() {
    // references here the right class name
    // of your nav
    $(".sidenav").sidenav();
});