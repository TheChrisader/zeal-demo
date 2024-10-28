import { CookieConsentConfig } from "vanilla-cookieconsent";

/**
 * @type {UserConfig}
 */
const pluginConfig: CookieConsentConfig = {
  //   current_lang: "en",
  //   autoclear_cookies: true, // default: false
  //   page_scripts: true, // default: false

  // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
  // delay: 0,                               // default: 0
  // auto_language: null                     // default: null; could also be 'browser' or 'document'
  // autorun: true,                          // default: true
  // force_consent: false,                   // default: false
  // hide_from_bots: false,                  // default: false
  // remove_cookie_tables: false             // default: false
  // cookie_name: 'cc_cookie',               // default: 'cc_cookie'
  // cookie_expiration: 182,                 // default: 182 (days)
  // cookie_necessary_only_expiration: 182   // default: disabled
  // cookie_domain: location.hostname,       // default: current domain
  // cookie_path: '/',                       // default: root
  // cookie_same_site: 'Lax',                // default: 'Lax'
  // use_rfc_cookie: false,                  // default: false
  // revision: 0,                            // default: 0

  //   onFirstAction: function (user_preferences, cookie) {
  //     // callback triggered only once
  //     const analyticsEnabled = window.CC.allowedCategory("analytics");
  //     console.log(`analytics ${analyticsEnabled ? "enabled" : "disabled"}`);
  //   },

  //   onAccept: function (cookie) {
  //     // ...
  //   },

  //   onChange: function (cookie, changed_preferences) {
  //     // ...
  //   },

  categories: {
    necessary: {
      readOnly: true,
    },
    analytics: {},
  },

  language: {
    default: "en",
    autoDetect: "browser",
    translations: {
      en: {
        consentModal: {
          title: "We use cookies!",
          description:
            "Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it.",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          showPreferencesBtn: "Manage preferences",
        },
        preferencesModal: {
          title: "Cookie Settings",
          savePreferencesBtn: "Save settings",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          closeIconLabel: "Close",
          //   cookie_table_headers: [
          //     { col1: "Name" },
          //     { col2: "Domain" },
          //     { col3: "Expiration" },
          //     { col4: "Description" },
          //   ],
          sections: [
            {
              title: "Cookie usage 📢",
              description:
                'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc-link">privacy policy</a>.',
            },
            {
              title: "Strictly necessary cookies",
              description:
                "These cookies are essential for the proper functioning of the website. Without these cookies, the website would not work properly",
              linkedCategory: "necessary",
            },
            // {
            //   title: "Performance and Analytics cookies",
            //   description:
            //     "These cookies allow the website to remember the choices you have made in the past",

            //   //   cookieTable: {
            //   //     // list of all expected cookies
            //   //     headers: {
            //   //       col1: "^_ga", // match all cookies starting with "_ga"
            //   //       col2: "google.com",
            //   //       col3: "2 years",
            //   //       col4: "description ...",
            //   //     },
            //   //     body: {
            //   //     //   col1: "_gid",
            //   //     //   col2: "google.com",
            //   //     //   col3: "1 day",
            //   //     //   col4: "description ...",
            //   //     bod: [""]
            //   //     },
            //   // },
            // },
            // {
            //   title: "Advertisement and Targeting cookies",
            //   description:
            //     "These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you",
            // },
            {
              title: "More information",
              description:
                'For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="#">contact us</a>.',
            },
          ],
        },
      },
    },
  },
};

export default pluginConfig;
