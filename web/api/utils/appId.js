const getAppIDConfig = () => {
  let config;

  try {
    // eslint-disable-next-line global-require
    config = require('../localdev-config.json');
  } catch (e) {
    if (process.env.APPID_SERVICE_BINDING) {
      // if running on Kubernetes this env variable would be defined
      config = JSON.parse(process.env.APPID_SERVICE_BINDING);
      config.redirectUri = process.env.redirectUri;
    } else {
      // eslint-disable-next-line dot-notation
      const vcapApplication = JSON.parse(process.env['VCAP_APPLICATION']);
      return {
        redirectUri:
          'https://' + vcapApplication['application_uris'][0] + CALLBACK_URL,
      };
    }
  }
  return config;
};

module.exports = getAppIDConfig;
