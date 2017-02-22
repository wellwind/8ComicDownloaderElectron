export class Comic8Parser {
    static getComicUrls(code, itemId) {
        return getComicUrls(code, itemId);
    }
}
function getComicUrls(code, itemId) {
    const result = [];
    const partLength = 50;

    for (let keyIndex = 0; keyIndex < code.length; keyIndex += partLength) {
        const subKey = code.substr(keyIndex, partLength);
        const vol = getOnlyDigit(subKey.substr(0, 4));
        const pages = parseInt(getOnlyDigit(subKey.substr(7, 3)), 0);

        const comicUrls = [];
        for (let page = 1; page <= pages; ++page) {
            comicUrls.push(urlCreator(subKey, itemId, vol, page));
        }
        result.push({ Vol: padDigits(vol, 4), Urls: comicUrls });
    }
    return result;
}

function urlCreator(subKey, itemId, vol, page) {
    const sid = getOnlyDigit(subKey.substr(4, 2));
    const did = getOnlyDigit(subKey.substr(6, 1));
    const code = subKey.substr(10);
    const hash = subKey.substr(getHash(page) + 10, 3);

    return 'http://img' + sid + '.6comic.com:99/' + did + '/' + itemId + '/' + vol + '/' + padDigits(page, 3) + '_' + hash + '.jpg';
}

function getOnlyDigit(str) {
    let result = '';
    for (let index = 0; index < str.length; ++index) {
        if (!isNaN(parseInt(str.substr(index, 1), 0))) {
            result += str.substr(index, 1);
        }
    }
    return result;
}

function getHash(n) {
    return (((n - 1) / 10) % 10) + (((n - 1) % 10) * 3);
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
}
