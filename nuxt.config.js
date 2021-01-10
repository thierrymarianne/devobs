import path from 'path';
import fs from 'fs';

const prefix = `${process.env.VERCEL_GIT_COMMIT_REF}_`.toUpperCase() || '';

const title = process.env[`${prefix}APP_TITLE`];
const url = process.env[`${prefix}APP_URL`];
const icon = '/icon.png';
const description =
	'Chaque jour, un tri de publications relatives au génie logiciel en provenance de Twitter.';

let config = {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    htmlAttrs: {
      lang: 'fr'
    },
    title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: description },
      { hid: 'author', name: 'author', content: '@dev_obs' },
      { hid: 'og:type', name: 'og:type', content: 'website' },
      {
        hid: 'og:url',
        property: 'og:url',
        content: url
      },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      {
        hid: 'og:title',
        property: 'og:title',
        content: title
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: description
      },
      {
        hid: 'og:site_name',
        name: 'og:site_name',
        content: title
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:site', name: 'twitter:site', content: '@dev_obs' },
      {
        hid: 'twitter:creator',
        name: 'twitter:creator',
        content: '@dev_obs'
      },
      {
        hid: 'twitter:title',
        name: 'twitter:title',
        content: title
      },
      {
        hid: 'twitter:description',
        name: 'twitter:description',
        content: description
      }
    ],
    noscript: [
      {
        innerHTML:
          "L'activation de JavaScript est nécessaire au bon fonctionnement de cette application."
      }
    ],
    link: [{ rel: 'icon', type: 'image/png', href: icon }]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['./styles/variables.scss'],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/dotenv',
    '@nuxtjs/router',
    '@nuxtjs/axios',
    '@nuxtjs/date-fns',
    '@nuxtjs/sentry',
    '@nuxtjs/pwa',
    'nuxt-lazysizes'
  ],

  pwa: {
    icon: {
      source: '~assets/logo.png'
    },
    manifest: {
      name: title,
      lang: 'fr',
      short_name: title,
      useWebmanifestExtension: false
    },
    meta: {
      theme_color: '#42CFC9'
    }
  },

  lazySizes: {
    extendAssetUrls: {
      img: 'data-src'
    }
  },

  sentry: {
    dsn: process.env.RAVEN_DSN
  },

  modules: [
    '@nuxtjs/device',
    '@nuxtjs/style-resources',
    [
      'nuxt-fontawesome',
      {
        imports: [
          //import whole set
          {
            set: '@fortawesome/free-brands-svg-icons',
            icons: ['faTwitter']
          },
          //import 2 icons from set
          // please note this is PRO set in this example,
          // you must have it in your node_modules to actually import
          {
            set: '@fortawesome/free-solid-svg-icons',
            icons: [
              'faArrowAltCircleUp',
              'faArrowAltCircleDown',
              'faCheck',
              'faComments',
              'faDoorOpen',
              'faExclamationTriangle',
              'faFileDownload',
              'faFire',
              'faHeart',
              'faImages',
              'faLink',
              'faLock',
              'faMinus',
              'faPen',
              'faPlus',
              'faRedoAlt',
              'faReply',
              'faRetweet',
              'faSync',
              'faTrash',
              'faTrashAlt',
              'faTh',
              'faUndo',
              'faUsers'
            ]
          }
        ]
      }
    ]
  ],

  dateFns: {
    defaultLocale: 'fr'
  },

  env: {
    API_HOST: process.env[`${prefix}API_HOST`],
    RAVEN_DSN: process.env.RAVEN_DSN,
    NODE_ENV: process.env.NODE_ENV,
    API_AUTH_TOKEN: process.env[`${prefix}API_AUTH_TOKEN`]
  },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'homepage',
        path: '/',
        component: resolve(__dirname, 'pages/index.vue')
      });
      routes.push({
        name: 'daily-review',
        path: '/:startDate',
        component: resolve(__dirname, 'pages/-highlights.vue')
      });
    }
  },

  styleResources: {
    scss: ['./styles/variables.scss', './styles/global.scss']
  },

  generate: {
    routes: ['/']
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  typescript: {
    typeCheck: {
      typescript: require.resolve('typescript'),
      eslint: {
        files: '' // './**/*.{ts,js,vue}'
      }
    }
  }
};

if (process.env.NODE_ENV !== 'production') {
  const server = {
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, './certificates/devobs-me-key.pem')
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, './certificates/devobs-me.pem')
      )
    }
  };

  config = { ...config, server: { ...server } };
}

export default config;
