$(document).ready(function () {
    let locationSplited = window.location.href.split('/');
    let location = locationSplited[locationSplited.length - 1];
    if (location !== 'template' && location === 'user') {
        var user = new Vue({
                el: '#wrapper',
                data: {
                    search: '',
                    checkAll: false,
                    users: [],
                    templates: [],
                    counter: 0,
                    picked: '',
                    select: '',
                    msgTitle: '',
                    msgContent: ''
                },
                created: function () {
                    $.get('/user/api/users', (data) => {
                        for (var i = 0; i < data.length; i++) {
                            this.users.push({
                                select: false,
                                id: data[i].id,
                                name: data[i].name,
                                mail: data[i].mail,
                                nextPayment: data[i].nextPayment,
                                cellphone: data[i].cellphone,
                                lastVisit: data[i].last_visit,
                                votedMonth: data[i].month || Math.random() >= 0.5 ? true : false,
                                visible: true
                            });
                        }
                    })
                },
                watch: {
                    checkAll: function () {
                        for (var i = 0; i < this.users.length; i++) {
                            this.users[i]['select'] = this.users[i].visible ? this.checkAll : false;
                            if (this.users[i].visible) {
                                if (this.checkAll) {
                                    this.counter++;
                                } else {
                                    this.counter--;
                                }
                            }
                        }
                    },
                    search: function () {
                        this.filter();
                    },
                    picked: function () {
                        if (this.picked === 'Manual') {
                            this.showTextArea();
                        } else if (this.picked === 'Template') {
                            this.getTemplatesForModal();
                        } else {
                            console.log('Error: radio= ' + this.picked);
                        }
                    },
                }
                ,
                methods: {
                    upDateCounter: function (checked) {
                        if (!checked)
                            this.counter++;
                        else
                            this.counter--;
                    },
                    openSendNotificationForm: function () {
                        this.picked = '';
                        $('#templateList').hide();
                        $('#contentManualMsg').hide();

                        if (this.counter >= 1) {
                            $('#notificationSendModal').modal('show')
                        }
                        else {
                            //alert(this.counter);
                            //alert('Seleccione pelo menos 1 utilizador!');
                            this.counter = 0;
                        }
                    },
                    getTemplatesForModal: function () {
                        $('#templateList').hide();
                        $('#contentManualMsg').hide();
                        //======
                        $.get('/template/api', (data) => {
                            for (let i = 0; i < data.templates.length; i++) {
                                this.templates.push({
                                    id: data.templates[i].id,
                                    name: data.templates[i].name,
                                    content: data.templates[i].content
                                });
                            }
                        });
                        $('#templateList').show();
                    }
                    ,
                    showTextArea: function () {
                        $('#templateList').hide();
                        $('#contentManualMsg').hide();
                        //=====
                        $('#contentManualMsg').show();
                    },
                    sendNotification: function () {
                        $('#notificationSendModal').modal('hide');

                        if (this.picked === '') {
                            alert("Escolha um tipo de mensagem!");
                            return;
                        }

                        var selected_users = [];
                        for (user of this.users) {
                            if (user['select']) {
                                selected_users.push(user.id);
                            }
                        }

                        if (this.picked === 'Manual') {
                            $.ajax({
                                type: "POST",
                                url: "/notification/sendManual",
                                data: JSON.stringify({
                                    title: this.msgTitle,
                                    content: this.msgContent,
                                    ids: selected_users
                                }),
                                contentType: 'application/json',
                                dataType: 'json',
                                success: function (data, textStatus, jqXHR) {
                                    console.log(data);
                                }
                            });
                        } else if (this.picked === 'Template') {
                            $.ajax({
                                type: "POST",
                                url: "/notification/sendTemplate",
                                data: JSON.stringify({
                                    ids: selected_users,
                                    templateId: this.select
                                }),
                                contentType: 'application/json',
                                dataType: 'json',
                                success: function (data, textStatus, jqXHR) {
                                    console.log(data)
                                }
                            });
                        } else {
                            console.log("Error on this.picked value. Not recognized.")
                        }
                    },
                    filter: function () {
                        let search = this.search.toLowerCase();
                        let hasFilter = search.indexOf(':') !== -1;
                        let filter = search.split(':');
                        if (filter.length === 2) {
                            content = filter[1].trim();
                            filter = filter[0];
                        }

                        if (filter === 'mail' && hasFilter) {
                            for (user of this.users) {
                                user.visible = user.mail.toLowerCase().includes(content);
                            }
                        } else if (filter === 'votou' && hasFilter) {
                            for (user of this.users) {
                                if (content === 's' || content === 'sim') {
                                    user.visible = user.votedMonth;
                                }
                                else if (content === 'n' || content === 'nao')
                                    user.visible = !user.votedMonth;
                            }
                        } else if (filter === 'telemovel' && hasFilter) {
                            for (user of this.users) {
                                user.visible = user.cellphone.startsWith(content);
                            }
                        } else if (filter === 'pagamento_em' && hasFilter && content) {
                            for (user of this.users) {
                                let diff = new Date(user.nextPayment) - Date.now();
                                diff = Math.ceil(diff / (1000 * 3600 * 24));
                                user.visible = content > diff && diff > 0;
                            }
                        } else if (filter === 'ult_actividade_a_mais' && hasFilter && content) {
                            for (user of this.users) {
                                let diff = Date.now() - new Date(user.lastVisit);
                                diff = Math.ceil(diff / (1000 * 3600 * 24));
                                user.visible = content < diff;
                            }
                        } else if (!hasFilter) {
                            for (user of this.users) {
                                user.visible = user.name.toLowerCase().includes(this.search.toLowerCase());
                            }
                        } else {
                            for (user of this.users) {
                                user.visible = true;
                            }
                        }
                    },
                    icon: function (value) {
                        if (value) {
                            return '<i class="fa fa-check" aria-hidden="true"></i>'
                        } else {
                            return '<i class="fa fa-times" aria-hidden="true"></i>'
                        }
                    }
                    ,
                    addFilter: function (filter) {
                        this.search = filter + ': ';
                    }
                }
                ,
                filters: {
                    europeanDate: function (value) {
                        let date = new Date(value);
                        return date.getDate() +
                            '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                    }
                    ,
                }
            }
        );
    }
})
;