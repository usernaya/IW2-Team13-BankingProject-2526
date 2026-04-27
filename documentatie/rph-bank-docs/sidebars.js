// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  apiSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introductie',
    },
    {
      type: 'doc',
      id: 'architectuur',
      label: 'Architectuur',
    },
    {
      type: 'doc',
      id: 'po-flow',
      label: 'Payment Flow',
    },
    {
      type: 'category',
      label: 'Authenticatie',
      collapsed: false,
      items: [
        { type: 'doc', id: 'auth/login', label: 'POST /auth/login' },
      ],
    },
    {
      type: 'category',
      label: 'Accounts',
      collapsed: false,
      items: [
        { type: 'doc', id: 'accounts/list',   label: 'GET /accounts' },
        { type: 'doc', id: 'accounts/detail', label: 'GET /accounts/:iban' },
        { type: 'doc', id: 'accounts/create', label: 'POST /accounts' },
      ],
    },
    {
      type: 'category',
      label: 'Payments (OB)',
      collapsed: false,
      items: [
        { type: 'doc', id: 'payments/new',             label: 'POST /payments/new' },
        { type: 'doc', id: 'payments/outgoing',        label: 'GET /payments/outgoing' },
        { type: 'doc', id: 'payments/outgoing-detail', label: 'GET /payments/outgoing/:id' },
      ],
    },
    {
      type: 'category',
      label: 'Payments (BB)',
      collapsed: false,
      items: [
        { type: 'doc', id: 'payments/incoming',        label: 'GET /payments/incoming' },
        { type: 'doc', id: 'payments/incoming-detail', label: 'GET /payments/incoming/:id' },
      ],
    },
    {
      type: 'category',
      label: 'Acknowledgements',
      collapsed: false,
      items: [
        { type: 'doc', id: 'acks/acks-in',  label: 'GET /acks/in' },
        { type: 'doc', id: 'acks/acks-out', label: 'GET /acks/out' },
      ],
    },
    {
      type: 'category',
      label: 'Transacties',
      collapsed: false,
      items: [
        { type: 'doc', id: 'transactions/list',   label: 'GET /transactions' },
        { type: 'doc', id: 'transactions/detail', label: 'GET /transactions/:id' },
      ],
    },
    {
      type: 'doc',
      id: 'logs',
      label: 'Logs',
    },
    {
      type: 'doc',
      id: 'errorcodes',
      label: 'Errorcodes',
    },
  ],
};

export default sidebars;