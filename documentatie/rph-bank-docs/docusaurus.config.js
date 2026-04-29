// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'RPH Bank',
  tagline: 'Reliable. Professional. Human.',
  favicon: 'img/rph_logo.svg',

  future: {
    v4: true,
  },

  url: 'https://usernaya.github.io',
  baseUrl: '/',

  organizationName: 'usernaya',
  projectName: 'IW2-Team13-BankingProject-2526',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'nl',
    locales: ['nl'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/rph_logo.svg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'RPH Bank',
        logo: {
          alt: 'RPH Bank Logo',
          src: 'img/rph_logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'apiSidebar',
            position: 'left',
            label: 'API Docs',
          },
          {
            href: 'https://github.com/usernaya/IW2-Team13-BankingProject-2526',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub Repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentatie',
            items: [
              { label: 'Introductie', to: 'intro' },
              { label: 'Architectuur', to: 'architectuur' },
              { label: 'Payment Flow', to: 'po-flow' },
            ],
          },
          {
            title: 'API',
            items: [
              { label: 'Accounts', to: 'accounts/list' },
              { label: 'Payments', to: 'payments/new' },
              { label: 'Errorcodes', to: 'errorcodes' },
            ],
          },
          {
            title: 'Team 13',
            items: [
              {
                label: 'GitHub Repository',
                href: 'https://github.com/usernaya/IW2-Team13-BankingProject-2526',
              },
            ],
          },
        ],
        copyright: `RPH Bank — Team 13 — PingFin 2026 — Odisee Toegepaste Informatica`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;