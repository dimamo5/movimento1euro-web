$(document).ready(function () {
    var dummy = {
        name: 'Ines',
        nextPayment: new Date(2013, 9, 23, 16, 25, 0, 0),
        nameCause: 'Nome previsualização',
        descriptionCause: 'Descrição para previsualização'
    };

    var table = new Vue({
        el: '#table',
        data: {
            checkAll: false,
            templates: [],
            counter: 0
        },
        created: function () {
            $.get('/template/api', (data)=> {
                for (let i = 0; i < data.templates.length; i++) {
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
                for (let i = 0; i < this.templates.length; i++) {
                    this.templates[i]['select'] = this.checkAll;
                }
            }
        },
        methods: {
            remove: function () {
                var url = '/template/api/';
                for (let i = 0; i < this.templates.length; i++) {
                    if (this.templates[i].select) {
                        var id = this.templates[i].id;
                        $.ajax({
                            url: url + id,
                            type: 'DELETE',
                            success: (data)=> {
                                for (let i = 0; this.templates.length; i++) {
                                    if (this.templates[i].id == data['removed']) {
                                        this.templates.splice(i, 1);
                                    }
                                }
                            }
                        })
                    }
                }
            },
            openEditTemplate: function () {
                if (this.counter == 1) {
                    for (let i = 0; i < this.templates.length; i++) {
                        if (this.templates[i].select) {
                            editModel.selectedName = this.templates[i].name;
                            editModel.selectedContent = this.templates[i].content;
                            $('#templateEditModal').modal('show')
                        }
                    }
                } else if (this.counter == 0) {
                    alert('Por favor selecione apenas um template.');
                } else {
                    alert('Por favor selecione apenas 1 unico template.');
                    for (let i = 0; i < this.templates.length; i++) {
                        this.templates[i]['select'] = this.checkAll;
                    }
                    this.counter = 0;
                }
            }
        }
    });

    var editModel = new Vue({
        el: '#templateEditModal',
        data: {
            selectedName: '',
            selectedContent: '',
            previewContent: ''
        },
        methods: {
            editTemplate: function () {
                var url = '/template/api/';
                for (let i = 0; i < table.templates.length; i++) {
                    if (table.templates[i].select) {
                        var id = table.templates[i].id;
                        $.ajax({
                            url: url + id,
                            type: 'PUT',
                            data: JSON.stringify({name: this.selectedName, content: this.selectedContent}),
                            contentType: 'application/json',
                            success: (data)=> {
                                if (data.result == 'success') {
                                    table.templates[i].name = this.selectedName;
                                    table.templates[i].content = this.selectedContent;
                                    table.templates[i].select = false;
                                    table.counter = 0;
                                    this.templateSelected = table.templates[i];
                                }
                            },
                            error: ()=> {
                                alert('Error on edit');
                            }

                        });
                    }
                }
            },
            addText: function (tag) {
                this.selectedContent += ' ' + tag;
            },
            reviewContent: function () {
                /* var mapObj = {
                 '@nome':dummy.name,
                 '@proxPagamento':dummy.nextPayment,
                 '@nomeCausa':dummy.nameCause,
                 '@descricaoCausa': dummy.descriptionCause
                 };
                 this.previewContent = this.selectedContent.replace('/@nome|@proxPagamento|@nomeCausa|@descricaoCausa/gi', function(matched){
                 return mapObj[matched];
                 });*/

                this.previewContent = this.selectedContent.replace('@nome', dummy.name).replace('@proxPagamento', dummy.nextPayment.getDate().toString())
                    .replace('@nomeCausa', dummy.nameCause).replace('@descricaoCausa', dummy.descriptionCause);
            }
        }
    })

    var createModel = new Vue({
        el: '#templateCreateModal',
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
                    },
                    error: ()=> {
                        alert('Error on create');
                    }
                });
            }
        }
    })
})
;