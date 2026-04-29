import { request } from "../../integrations/clearingBankClient.js";

let banksCache = null;
let banksCachePromise = null;
let banksCacheTime = 0;

const CACHE_TTL = 1000 * 60 * 60 * 24;

export async function fetchBanks(refresh = false) {
    const now = Date.now();
    if (!refresh && banksCache && now - banksCacheTime < CACHE_TTL) return banksCache;
    if (banksCachePromise) return banksCachePromise;

    banksCachePromise = (async () => {
        const res = await request("/banks");

        if (!res.ok) {
            throw new Error(`Failed to fetch banks: ${res.status}`);
        }

        const data = await res.json();

        banksCache = data.data;
        banksCacheTime = now;
        return banksCache;
    })();

    banksCachePromise.finally(() => {
        banksCachePromise = null;
    });

    return banksCachePromise;
}

export async function isValidBank(bic) {
    const banks = await fetchBanks();
    return banks.some((b) => (b.bic || b.id) === bic);
}
