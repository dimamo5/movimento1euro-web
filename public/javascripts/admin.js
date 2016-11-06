$(document).ready(function () {
    let locationSplited = window.location.href.split('/');
    let location = locationSplited[locationSplited.length - 1];
    if (location !== 'template' && location === 'user') {
        var user = new Vue({
                el: '#table',
                data: {
                    search: '',
                    checkAll: false,
                    users: [],
                },
                created: function () {
                    $.get('/user/api/users', (data)=> {
                        for (var i = 0; i < data.length; i++) {
                            for (var j = 0; j < 20; j++) {
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
                        }
                    })
                },
                watch: {
                    checkAll: function () {
                        for (var i = 0; i < this.users.length; i++) {
                            this.users[i]['select'] = this.users[i].visible ? this.checkAll : false;
                        }
                    },
                    search: function () {
                        this.filter();
                    }
                }
                ,
                methods: {
                    sendNotification: function () {
                        console.log('Function not yet implemented');
                    }
                    ,
                    filter: function () {
                        t = performance.now();
                        let hasFilter = this.search.indexOf(':') !== -1;
                        let filter = this.search.split(':');
                        if (filter.length === 2) {
                            content = filter[1].trim();
                            filter = filter[0];
                        }

                        if (filter === 'mail' && hasFilter) {
                            for (user of this.users) {
                                user.visible = user.mail.includes(content);
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
                            console.log("No filter")
                            for (user of this.users) {
                                user.visible = user.name.toLowerCase().includes(this.search.toLowerCase());
                            }
                        } else {
                            for (user of this.users) {
                                user.visible = true;
                            }
                        }
                        t1 = performance.now();
                        console.log('Time elapsed: ' + (t1 - t));
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