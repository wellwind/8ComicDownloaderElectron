function getComicUrls(code, itemId) {
  var result = [];
  var partLength = 50;

  for (var keyIndex = 0; keyIndex < code.length; keyIndex += partLength) {
    var subKey = code.substr(keyIndex, partLength);
    var vol = getOnlyDigit(subKey.substr(0, 4));
    var pages = getOnlyDigit(subKey.substr(7, 3));

    var comicUrls = [];
    for (var page = 1; page <= pages; ++page) {
      comicUrls.push(urlCreator(subKey, itemId, vol, page));
    }
    result.push( {Vol: padDigits(vol, 4), Urls: comicUrls});
  }
  return result;
}

function urlCreator(subKey, itemId, vol, page) {
  var vol = getOnlyDigit(subKey.substr(0, 4));
  var sid = getOnlyDigit(subKey.substr(4, 2));
  var did = getOnlyDigit(subKey.substr(6, 1));
  var code = subKey.substr(10);
  var hash = subKey.substr(getHash(page) + 10, 3);

  return "http://img" + sid + ".8comic.com/" + did + "/" + itemId + "/" + vol + "/" + padDigits(page, 3) + "_" + hash + ".jpg";
}

function getOnlyDigit(str) {
  var result = "";
  for (var index = 0; index < str.length; ++index) {
    if (!isNaN(parseInt(str.substr(index, 1)))) {
      result += str.substr(index, 1);
    }
  }
  return result;
}

function getHash(n) {
  return (((n - 1) / 10) % 10) + (((n - 1) % 10) * 3);
}

function padDigits(number, digits) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
