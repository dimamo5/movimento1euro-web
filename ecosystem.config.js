module.exports = {
    apps: [
        {
            name: "PRODUCTION",
            script: "bin/www",
            env: {
                NODE_ENV: "production"
            }
        }, {
            name: "STAGING",
            script: "bin/www",
            env: {
                NODE_ENV: "staging"
            }
        }
    ],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy: {
        production: {
            user: "root",
            host: "ldso.diogomoura.me",
            ref: "origin/master",
            repo: "git@github.com:dimamo5/movimento1euro-web.git",
            path: "/var/www/production",
            "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --only PRODUCTION",
            env: {
                "NODE_ENV": "production"
            }
        },
        staging: {
            user: "root",
            host: "ldso.diogomoura.me",
            ref: "origin/develop",
            repo: "git@github.com:dimamo5/movimento1euro-web.git",
            path: "/var/www/staging",
            "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --only STAGING",
            env: {
                NODE_ENV: "staging"
            }
        }
    }
};
