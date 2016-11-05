/**
 * Created by inesa on 17/10/2016.
 */
$(document).ready(function () {
    let locationSplited = window.location.href.split('/');
    let location = locationSplited[locationSplited.length - 1];
    if (location === 'template') {
        /*var table = new Vue({
         el: '#table',
         data: {
         checkAll: false,
         templates: []
         },
         beforeCreate: function () {
         $.get('/templates/api', (data)=> {
         for (var i = 0; i < data.length; i++) {
         this.templates.push({
         select: false,
         id: data[i].id,
         name: data[i].name,
         content: data[i].content
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
         var url = '/templates/api/';
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
         });*/
    } else if (location === 'user') {
        var user = new Vue({
            el: '#table',
            data: {
                search: '',
                checkAll: false,
                users: [],
            },
            beforeCreate: function () {
                $.get('/user/api/users', (data)=> {
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < 200; j++) {
                            this.users.push({
                                select: false,
                                id: data[i].id,
                                name: data[i].name,
                                mail: data[i].mail,
                                district: data[i].district,
                                lastPayment: data[i].lastPayment,
                                cellphone: data[i].cellphone,
                                visible: true
                            });
                        }
                    }
                })
            },
            watch: {
                checkAll: function () {
                    for (var i = 0; i < this.users.length; i++) {
                        this.users[i]['select'] = this.checkAll;
                    }
                }
            },
            methods: {
                sendNotification: function () {
                    console.log('Function not yet implemented');
                },
                filter: function () {
                    t = performance.now();
                    for (user of this.users) {
                        user.visible = user.name.includes(this.search);
                    }
                    t1 = performance.now();
                    console.log('Time elapsed: ' + (t1 - t));
                }

            },
            filters: {
                europeanDate: function (value) {
                    let date = new Date(value);
                    return date.getDate() +
                        '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                }
            }
        });
    }

});