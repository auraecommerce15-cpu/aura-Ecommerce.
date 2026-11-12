/**
 * Escapes regex special characters to prevent ReDoS and regex injection.
 * @param {string} str
 * @returns {string}
 */
export const escapeRegex = (str) => {
    if (typeof str !== "string") return "";
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
