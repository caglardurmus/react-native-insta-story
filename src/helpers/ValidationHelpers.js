export function isNullOrWhitespace( input ) {
    if (typeof input === 'undefined' || input == null)
        return true;

    return input.toString().replace(/\s/g, '').length < 1;
}
