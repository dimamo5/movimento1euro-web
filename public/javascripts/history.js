$(document).ready(function () {

    var history = new Vue({
        el: '#table',
        data: {
            messages: [],
            search:''
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
                        date: data[i].date
                    });
                }
            })
        },
        methods:{
            getInfoMessage:function (message) {
                message.open=!message.open;
                if(!message.info)
                $.get('/history/api/messages/'+message.id, (data) => {
                    message.info=data
                })
            }
        }
    });
})
;