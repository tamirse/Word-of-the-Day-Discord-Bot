
/**
 * capitalizes the first letter of the string
 * @param {string} string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    capitalizeFirstLetter : capitalizeFirstLetter,
}