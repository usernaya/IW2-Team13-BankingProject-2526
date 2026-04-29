// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  apiSidebar: [
    { type: 'doc', id: 'v1/intro', label: 'Introductie' },
    { type: 'doc', id: 'v1/architectuur', label: 'Architectuur' },
    { type: 'doc', id: 'v1/po-flow', label: 'Payment Flow' },
    {
      type: 'category', label: 'Authenticatie', collapsed: false,
      items: [{ type: 'doc', id: 'v1/auth/login', label: 'POST /auth/login' }],
    },
    {
      type: 'category', label: 'Accounts', collapsed: false,
      items: [
        { type: 'doc', id: 'v1/accounts/list', label: 'GET /accounts' },
        { type: 'doc', id: 'v1/accounts/detail', label: 'GET /accounts/:iban' },
        { type: 'doc', id: 'v1/accounts/create', label: 'POST /accounts' },
      ],
    },
    {
      type: 'category', label: 'Payments (OB)', collapsed: false,
      items: [
        { type: 'doc', id: 'v1/payments/new', label: 'POST /payments/new' },
        { type: 'doc', id: 'v1/payments/outgoing', label: 'GET /payments/outgoing' },
        { type: 'doc', id: 'v1/payments/outgoing-detail', label: 'GET /payments/outgoing/:id' },
      ],
    },
    {
      type: 'category', label: 'Payments (BB)', collapsed: false,
      items: [
        { type: 'doc', id: 'v1/payments/incoming', label: 'GET /payments/incoming' },
        { type: 'doc', id: 'v1/payments/incoming-detail', label: 'GET /payments/incoming/:id' },
      ],
    },
    {
      type: 'category', label: 'Acknowledgements', collapsed: false,
      items: [
        { type: 'doc', id: 'v1/acks/acks-in', label: 'GET /acks/in' },
        { type: 'doc', id: 'v1/acks/acks-out', label: 'GET /acks/out' },
      ],
    },
    {
      type: 'category', label: 'Transacties', collapsed: false,
      items: [
        { type: 'doc', id: 'v1/transactions/list', label: 'GET /transactions' },
        { type: 'doc', id: 'v1/transactions/detail', label: 'GET /transactions/:id' },
      ],
    },
    { type: 'doc', id: 'v1/logs', label: 'Logs' },
    { type: 'doc', id: 'v1/errorcodes', label: 'Errorcodes' },
  ],
};

export default sidebars;
