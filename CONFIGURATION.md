#Configurar o serviço de notificações num servidor linux
O projecto tem duas tecnologia fundamentais (NodeJS e MySQL) que necessitam de ser instalados e ainda uma opcional (NGINX).

###MySQL
- Criar um schema "ldso" com um utilizador com o nome de "ldso" e password "mypass" e dar acesso a este utilizador ao schema criado anteriormente
- Correr o script db.sql para inicializar as tabelas do schema 

###NodeJS
- Instalar a versão LTS(6.9.2 de momento)
- Instalar o Process Manager pm2 com o comando npm install -g pm2
- Inicializar o Process Manager com o comando "pm2 startup"
- Inicializar a aplicação com "pm2 start ecosystem.config.js --only production"
- Configurar um cronjob para os alertas automáticos (database/autoAlerts.js)
[Tutorial](http://askubuntu.com/questions/2368/how-do-i-set-up-a-cron-job)

###NGINX
De forma a evitar expor o node directamente ao exterior configurou-se o NGINX como um reverse proxy. 
Esta opção é opcional já que se pode definir directamnete na firewall uma regra de redirecionamento da porta 80 ou 8080 para a porta 3000.
