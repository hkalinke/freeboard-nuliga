(() => {

    // nuLiga data source

    freeboard.loadDatasourcePlugin({
        "type_name": "nuliga_datasource_plugin",
        "display_name": "nuLiga API Datasource",
        "description": "API connector to fetch data from nuLiga/nuScore/nu",
        "external_scripts": [],
        "settings": [{
                "name": "client_id",
                "display_name": "Client-ID",
                "type": "text",
                "description": "The client ID provided by nuPortalRS"
            },
            {
                "name": "client_secret",
                "display_name": "Client Secret",
                "type": "text",
                "description": "The secret that was set during registration"
            },
            {
                "name": "refresh_interval",
                "display_name": "update interval (in ms)",
                "type": "text",
                "description": "Interval how often data is refreshed. (in milliseconds)",
                "default": 30000 // 30 seconds
        }],
        newInstance: (settings, newInstanceCallback, updateCallback) => {
            newInstanceCallback(new nuDatasourcePlugin(settings, updateCallback));
        }
    });

    const nuDatasourcePlugin = (settings, updateCallback) => {
        var self = this;

        var currentSettings = settings;

        /**
         * Fetching data from nu
         */
        const fetchData = () => {
            // TODO: data from nu
            const newData = { hello : "world! it's " + new Date().toLocaleTimeString() };
            const authData = accessTokenRequest();

            // commit data to frontend
            updateCallback(newData);
        };

        const accessTokenRequest = async () => {
           const url = "https://hbde-portal.liga.nu/rs/auth/token";

           const options = {
               method: "POST",
               body: "grant_type=client_credentials&client_id=" + currentSettings.client_id +
                   "&client_secret=" + currentSettings.client_secret + "&scope=nuPortalRS_club",
               headers: {
                   'Content-Type': 'application/x-www-form-urlencoded'
               }
           };

           return await fetch(url, options)
               .then(resp => resp.json());
        };

        // define a refresh timer to fetch new data in a defined interval
        var timer;

        /**
         * setup timer
         * @param interval milliseconds how often data is refreshed
         */
        const createTimer = (interval) => {
            if(timer) {
                clearInterval(timer);
            }
            timer = setInterval(fetchData, interval);
        };

        /**
         * Update settings if there is new data
         * @param newSettings
         */
        self.onSettingsChanged = (newSettings) => {
            currentSettings = newSettings;
        };

        /**
         * Force update data
         */
        self.updateNow = () => {
            fetchData();
        };

        /**
         * Deletes the refresh timer if widget gets removed
         */
        self.onDispose = () => {
            clearInterval(timer);
            timer = undefined;
        };

        // set up timer
        createTimer(currentSettings.refresh_interval)
    };
})();