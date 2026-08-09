var $Component = $Component || {};

$Component.FocusDirective = {
    inserted: function(el) {
        el.focus();
        el.select();
    }
};
