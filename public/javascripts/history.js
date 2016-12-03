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
        //'<div> {{msg.info[0}} </div>'+
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
                    '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' +  date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
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
            $.get('/history/api/messages', (data) => {
                for (let i = 0; i < data.length; i++) {
                    this.messages.push({
                        open: false,
                        id: data[i].id,
                        type: data[i].msg_type,
                        title: data[i].title,
                        content: data[i].content,
                        date: data[i].date,
                        info: []
                    });
                }
            })
        }
    });


})
;