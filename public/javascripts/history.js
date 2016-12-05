$(document).ready(function () {
    const messages = {
        name: 'messages',
        props: ['msg'],
        template: '<tbody>' +
        '<tr style="cursor:pointer" v-on:click="getInfoMessage">' +
        '<td v-if="msg.open"><i class="fa fa-arrow-down" aria-hidden="true"></i></td>' +
        '<td v-else><i class="fa fa-arrow-right" aria-hidden="true"></i></td>' +
        '<td>{{msg.date | europeanDate}}</td>' +
        '<td>{{msg.title}}</td>' +
        '<td>{{msg.content}}</td>' +
        '<td>{{msg.type}}</td>' +
        '</tr>' +
        '<tr v-if="msg.open" v-for="user in msg.info" :class="[user.sent ? \'bk-green\' : \'bk-red\']">' +
        '<td v-if="msg.sent"><i class="fa fa-check" aria-hidden="true"></i></td>' +
        '<td v-else ><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></td>' +
        '<td>{{user.name}}</td>' +
        '<td>{{user.seen ? \'Vista\' : \'Não Vista\' }}</td>' +
        '<td>{{user.content}}</td>' +
        '<td></td>' +
        '</tr>' +
        '</tbody>',
        data: function () {
            return {}
        },
        methods: {
            getInfoMessage: function () {
                this.msg.open = !this.msg.open;
                if (this.msg.info.length === 0)
                    $.get('/history/api/messages/' + this.msg.id, (data) => {
                        this.msg.info = data
                    })
            }
        },
        filters: {
            europeanDate: function (value) {
                let date = new Date(value);
                return date.getDate() +
                    '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            }

        }
    };

    var history = new Vue({
        el: '#table',
        data: {
            messages: [],
            search: ''
        },
        components: {
            'messages': messages
        },
        mounted: function () {
            let content;
            let info;
            $.get('/history/api/messages', (data) => {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].msg_type === 'Template') {
                        content = data[i].Template.content;
                    } else {
                        content = data[i].content;
                    }

                    this.messages.push({
                        open: false,
                        id: data[i].id,
                        type: data[i].msg_type,
                        title: data[i].title,
                        content: content,
                        date: data[i].date,
                        info: data[i].AppUsers,
                        visible: true
                    });

                    // console.log('messages ');
                    // console.log(this.messages);
                }
            })
        },
        methods: {
            addFilter: function (filter) {
                this.search = filter + ': ';
            },
            filter: function () {
                let search = this.search.toLowerCase();
                let hasFilter = search.indexOf(': ') !== -1;
                let filter = search.split(': ');
                if (filter.length === 2) {
                    content = filter[1].trim();
                    filter = filter[0];
                }

                if (filter === 'enviada_para' && hasFilter && content != "") {
                    for (msg of this.messages) {
                        if (msg.info.length == 0) {
                            msg.visible = false;
                        }
                        else {
                            for (user of msg.info) {
                                msg.visible = user.name.toLowerCase().includes(content);
                                console.log('result: ' + user.name.toLowerCase().includes(content))
                                console.log(msg.type)
                                //console.log('name: ' + user.name)
                            }
                        }
                    }
                } else if (filter === 'na_data' && hasFilter && content != "") {
                    for (user of this.users) {
                        if (content === 's' || content === 'sim') {
                            user.visible = user.votedMonth;
                        }
                        else if (content === 'n' || content === 'nao')
                            user.visible = !user.votedMonth;
                    }
                } else if (filter === 'com_erros' && hasFilter && content != "") {
                    for (user of this.users) {
                        user.visible = user.cellphone.startsWith(content);
                    }
                } else if (!hasFilter) {
                    for (msg of this.messages) {
                        var contem = msg.content.toLowerCase().includes(this.search);
                        if (contem) {
                            msg.visible = true;
                        }
                        else {
                            msg.visible = false;
                        }
                    }
                } else {
                    for (msg of this.messages) {
                        msg.visible = true;
                    }
                }
            }
        },
        watch: {
            search: function () {
                this.filter();
            }
        }
    });


})
;