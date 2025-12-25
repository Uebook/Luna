// src/storage/AddressStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@addresses';

export async function getAddresses() {
    try {
        const json = await AsyncStorage.getItem(KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.warn('getAddresses error', e);
        return [];
    }
}

export async function setAddresses(addresses) {
    try {
        await AsyncStorage.setItem(KEY, JSON.stringify(addresses));
        return true;
    } catch (e) {
        console.warn('setAddresses error', e);
        return false;
    }
}

/**
 * Enforce exactly one primary if requested.
 * If this is the first address, it becomes primary automatically.
 */
export async function addAddress(address) {
    const list = await getAddresses();
    const id = `addr_${Date.now()}`;
    const wantsPrimary = !!address.isPrimary || list.length === 0;

    let next = [{ id, ...address, isPrimary: wantsPrimary }, ...list];

    if (wantsPrimary) {
        next = next.map(a => ({ ...a, isPrimary: a.id === id }));
    }

    await setAddresses(next);
    return next;
}

export async function updateAddress(id, patch) {
    const list = await getAddresses();
    const patchPrimary = patch.hasOwnProperty('isPrimary') ? !!patch.isPrimary : null;

    let next = list.map(a => (a.id === id ? { ...a, ...patch } : a));

    // If toggled to primary, demote others.
    if (patchPrimary === true) {
        next = next.map(a => ({ ...a, isPrimary: a.id === id }));
    }

    // Ensure at least one primary remains.
    if (!next.some(a => a.isPrimary) && next.length > 0) {
        next[0].isPrimary = true;
    }

    await setAddresses(next);
    return next;
}

export async function removeAddress(id) {
    const list = await getAddresses();
    let next = list.filter(a => a.id !== id);

    // Ensure at least one primary remains after deletion.
    if (!next.some(a => a.isPrimary) && next.length > 0) {
        next[0].isPrimary = true;
    }

    await setAddresses(next);
    return next;
}

export async function setPrimary(id) {
    const list = await getAddresses();
    const next = list.map(a => ({ ...a, isPrimary: a.id === id }));
    await setAddresses(next);
    return next;
}
