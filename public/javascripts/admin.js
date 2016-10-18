/**
 * Created by inesa on 17/10/2016.
 */
$(document).ready(function () {
    var table = new Vue({
        el: '#table',
        data: {
            templates: []
        },
        beforeCreate: function () {
            $.get('/templates/all', (data)=> {
                for (var i = 0; i < data.length; i++) {
                    this.templates.push({select: false, id: data[i].id, name: data[i].name, content: data[i].content});
                }
            })
        },
        methods: {
            checkAll: function () {
                for (var i = 0; i < this.templates.length; i++) {
                    if (this.templates[i]['select'] == false)
                        this.templates[i]['select'] = true;
                    else
                        this.templates[i]['select'] = false;
                }
            },
            remove: function () {
                var url = '/templates/';
                for (var i = 0; i < this.templates.length; i++) {
                    if (this.templates[i].select) {
                        var id = this.templates[i].id;
                        $.ajax({
                            url: url + id,
                            type: 'DELETE',
                            success: (data)=> {
                                for (var i = 0; this.templates.length; i++) {
                                    if (this.templates[i].id == data['removed']) {
                                        this.templates.splice(i, 1);
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