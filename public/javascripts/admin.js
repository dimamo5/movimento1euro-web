/**
 * Created by inesa on 17/10/2016.
 */
$(document).ready(function () {
    var table = new Vue({
        el: '#table',
        data: {
            checkAll:false,
            templates: []
        },
        beforeCreate: function () {
            $.get('/Template/all', (data)=> {
                for (var i = 0; i < data.length; i++) {
                    this.Template.push({select: false, id: data[i].id, name: data[i].name, content: data[i].content});
                }
            })
        },
        watch:{
            checkAll: function () {
                for (var i = 0; i < this.Template.length; i++) {
                    this.Template[i]['select'] = this.checkAll;
                }
            }
        },
        methods: {
            remove: function () {
                var url = '/Template/';
                for (var i = 0; i < this.Template.length; i++) {
                    if (this.Template[i].select) {
                        var id = this.Template[i].id;
                        $.ajax({
                            url: url + id,
                            type: 'DELETE',
                            success: (data)=> {
                                for (var i = 0; this.Template.length; i++) {
                                    if (this.Template[i].id == data['removed']) {
                                        this.Template.splice(i, 1);
                                    }
                                }
                            }
                        })
                    }
                }
            }
        }
    });

});