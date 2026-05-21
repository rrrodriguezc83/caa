let _session = null;

export const setSession = (data) => { _session = data; };
export const getSession = () => _session;
export const clearSession = () => { _session = null; };
