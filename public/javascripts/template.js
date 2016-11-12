$(document).ready(function () {
    var table = new Vue({
        el: '#table',
        data: {
            checkAll: false,
            templates: []
        },
        created: function () {
            $.get('/template/api', (data)=> {
                for (var i = 0; i < data.templates.length; i++) {
                    this.templates.push({
                        select: false,
                        id: data.templates[i].id,
                        name: data.templates[i].name,
                        content: data.templates[i].content
                    });
                }
            })
        },
        watch: {
            checkAll: function () {
                for (var i = 0; i < this.templates.length; i++) {
                    this.templates[i]['select'] = this.checkAll;
                }
            }
        },
        methods: {
            remove: function () {
                var url = '/template/api';
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

    var model = new Vue({
        el: '.modal',
        data: {
            name: '',
            content: ''
        },
        methods: {
            createTemplate: function () {
                var url = '/template/api';
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: JSON.stringify({name: this.name, content: this.content}),
                    contentType: 'application/json',
                    success: (data)=> {
                        if (data.result == 'success') {
                            table.templates.push({
                                select: false,
                                id: data.newTemplate.id,
                                name: data.newTemplate.name,
                                content: data.newTemplate.content
                            });
                        }
                    }
                })
                error: {
                    alert('Error on create');
                }

            }
        }
    })
})
;