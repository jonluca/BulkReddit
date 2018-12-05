module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        // First application
        {
            name: 'BulkReddit',
            script: 'index.js',
            log_date_format: 'YYYY-MM-DDTHH:mm:ss.SSS',
            env: {
                NODE_ENV: 'production'
            }
        }

    ]
};
