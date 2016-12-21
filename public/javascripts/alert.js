/**
 * Created by inesa on 03/12/2016.
 */
$(document).ready(function () {
    let locationSplited = window.location.href.split('/');
    let location = locationSplited[locationSplited.length - 1];
    if (location !== 'template' && location === 'alert') {
        var dummy = {
            name: 'Ines',
            nextPayment: new Date(2017, 9, 23, 16, 25, 0, 0)
        };

        var alert = new Vue({
                el: '#alertInfo',
                data: {
                    alert: {},
                    alertTemplate: {},
                    alert_prev: {}
                },
                beforeMount: function () {
                    $.get('/alert/api/alert', (data) => {
                        this.alert = data.alert;
                        this.alertTemplate = data.alertTemplate;
                        console.log(this.alert);
                    })
                },
                watch: {
                    alert: function () {
                        this.alert_prev = JSON.parse(JSON.stringify(this.alert));
                    }
                },
                methods: {
                    editAlert: function () {
                        let url = '/alert/api/';
                        let id = this.alert.id;
                        $.ajax({
                            url: url + id,
                            type: 'PUT',
                            data: JSON.stringify({active: this.alert.active, start_alert: this.alert.start_alert}),
                            contentType: 'application/json',
                            success: (data) => {
                                if (data.result == 'success') {
                                    console.log('edit com success');
                                    console.log(this.alert)
                                }
                            },
                            error: () => {
                                this.alert = JSON.parse(JSON.stringify(this.alert_prev));
                            }

                        });
                    }
                }
            }
        )
    }
})
;