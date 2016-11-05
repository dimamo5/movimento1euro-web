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
                beforeMount: function () {
                    $.get('/user/api/users', (data)=> {
                        for (var i = 0; i < data.length; i++) {
                            for (var j = 0; j < 20; j++) {
                                this.users.push({
                                    select: false,
                                    id: data[i].id,
                                    name: data[i].name,
                                    mail: data[i].mail,
                                    district: data[i].district,
                                    lastPayment: data[i].lastPayment,
                                    cellphone: data[i].cellphone,
                                    lastVisit: data[i].last_visit,
                                    visible: true
                                });
                            }
                        }
                    })
                },
                computed: {
                    numSelected: function () {
                        let count = 0;
                        for (user of this.users) {
                            if (user.selected) {
                                count++;
                            }
                        }
                        return count;
                    }
                },
                watch: {
                    checkAll: function () {
                        for (var i = 0; i < this.users.length; i++) {
                            this.users[i]['select'] = this.checkAll;
                        }
                    }
                    ,
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
                        let filter = this.search.split(':');
                        if (filter.length > 1) {
                            content = filter[1].trim();
                            filter = filter[0];
                        }
                        if (filter === 'mail') {
                            for (user of this.users) {
                                user.visible = user.mail.includes(content);
                            }
                        } else if (filter === 'distrito') {
                            for (user of this.users) {
                                user.visible = user.district.includes(content);
                            }
                        } else {
                            for (user of this.users) {
                                user.visible = user.name.includes(this.search);
                            }
                        }
                        t1 = performance.now();
                        console.log('Time elapsed: ' + (t1 - t));
                    }

                }
                ,
                filters: {
                    europeanDate: function (value) {
                        let date = new Date(value);
                        return date.getDate() +
                            '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
                    }
                }
            }
        );
    }

})
;