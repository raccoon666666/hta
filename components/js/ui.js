var $Component = $Component || {};

$Component.ToastMixin = {
    data: function() {
        return {
            toastVisible: false,
            toastMessage: '',
            toastTimer: null
        };
    },
    methods: {
        showToast: function(msg, duration) {
            var self = this;
            this.toastMessage = msg;
            this.toastVisible = true;
            if (this.toastTimer) clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function() {
                self.toastVisible = false;
            }, duration || 2000);
        }
    }
};

$Component.LoadingMixin = {
    data: function() {
        return {
            loading: false
        };
    }
};
