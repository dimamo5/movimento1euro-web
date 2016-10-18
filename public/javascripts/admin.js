/**
 * Created by inesa on 17/10/2016.
 */
var vm = new Vue({
    el: '.checkboxForAll',
    data: {
        checked: false,
        seen: false
    }
});

// $watch is an instance method
vm.$watch('a', function (newVal, oldVal) {
    // this callback will be called when `vm.a` changes
})