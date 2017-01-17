const {remote} = require('electron');
const {Menu, MenuItem, app, dialog} = remote
const { shell, clipboard} = require('electron');
var iconv = require('iconv-lite');
var async = require('async');
var http = require('http');
var request = require('request');
var url = require('url');
var os = require('os');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var open = require('mac-open');
var package = require("./package.json");

var appSettings;
var configFilePath = os.homedir() + '/8ComicDownloader/settings.conf';

function initPage() {
    $("#oneKeyDownload").tooltip();
    $("#versionText").html(package.version);
    readAppSettings();
    setRightMenu();
}

function readAppSettings() {
    fs.readFile(configFilePath, function (err, data) {
        if (err) {
            if (err.toString().indexOf('no such file or directory')) {
                mkdirp(path.dirname(configFilePath));

                var settings = {
                    'comicFolder': path.dirname(configFilePath),
                    'comicList': []
                };
                data = JSON.stringify(settings);
                fs.writeFile(configFilePath, data);
            } else {
                throw err;
            }
        }

        appSettings = JSON.parse(data);
        $("#saveComicDialog").text(appSettings.comicFolder);
        appSettingsToComicList();
    });
}

function appSettingsToComicList() {
    $('#comicList').html('');
    for (var index in appSettings.comicList) {
        $('#comicList').html(
            $('#comicList').html() + '<option value="' + appSettings.comicList[index].url + '">' + appSettings.comicList[index].name + ';' + appSettings.comicList[index].url + '</option>');
    }
}

function setRightMenu() {
    const menu = new Menu();
    menu.append(
        new MenuItem({
            label: '貼上',
            click: function () {
                $('#addComicUrl').val(clipboard.readText());
            }
        }));
    menu.append(
        new MenuItem({
            label: '清除',
            click: function () {
                $('#addComicUrl').val('');
            }
        }));

    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if ($(e.srcElement).attr('id') == 'addComicUrl') {
            menu.popup(remote.getCurrentWindow());
        }
    }, false);
}

function saveAppSettings() {
    fs.writeFile(configFilePath, JSON.stringify(appSettings));
}

function removeUrlFromComicList(comicUrl) {
    for (var index in appSettings.comicList) {
        if (appSettings.comicList[index].url == comicUrl) {
            appSettings.comicList.splice(index, 1)
            saveAppSettings();
            appSettingsToComicList();
            break;
        }
    }
}

function getCorrectComicUrl(url, callback) {
    var comicUrl = '';
    if (url.indexOf("www") >= 0) {
        getHtmlFromUrl(url, function (data) {
            var catId = data
                .split('<a href=\'#\' onclick="cview')[1]
                .split(',')[1]
                .split(')')[0];

            var prefix = "comic-";
            var urlSplit = url.split("?")[0];
            var urlSplit = urlSplit.split("/");
            comicUrl = "http://v.comicbus.com/online/" + prefix + urlSplit[urlSplit.length - 1] + "?ch=1";
            callback(comicUrl);
        });
    } else if (url.indexOf("v") >= 0) {
        comicUrl = url.split("?")[0] + "?ch=1";
        callback(comicUrl);
    }
}

function getComicPicturesFromUrl(comicUrl) {
    getHtmlFromUrl(comicUrl, function (content) {
        var title = getComicName(content);
        // check url in list
        var exist = false;
        for (var index in appSettings.comicList) {
            if (appSettings.comicList[index].url == comicUrl) {
                appSettings.comicList[index].name = title;
                exist = true;
                break;
            }
        }
        if (!exist) {
            $('#comicList').html($('#comicList').html() + '<option value="' + comicUrl + '" selected>' + title + ';' + comicUrl + '</option>');
            appSettings.comicList.push({
                url: comicUrl,
                name: title
            });
            saveAppSettings();
        } else {
            $('option[value="' + comicUrl + '"]').attr('selected', true);
        }
        $('#getPictureList').click();
        $('#addComicUrl').val('');
        $('#addComicUrl').focus();
    });
}

function getComicPicturesFromList(comicUrl, fetchAll, lastVols, callback) {
    getHtmlFromUrl(comicUrl, function (content) {
        var title = getComicName(content);
        var comicvolPicturesList = getComicUrlsList(content);

        // append all urls to picture list table
        var maxVols = fetchAll ? comicvolPicturesList.length : lastVols;
        var skipVols = fetchAll || maxVols > comicvolPicturesList.length ? 0 : comicvolPicturesList.length - lastVols;
        for (var volIndex in comicvolPicturesList) {
            if (volIndex < skipVols) continue;
            var volumeData = comicvolPicturesList[volIndex];
            for (var urlIndex in volumeData.Urls) {
                appendComicPictureUrlToTable(title, volumeData, urlIndex);
            }
        }

        // scroll list to bottom
        $('#pictuerList').find('tr').last().scrollintoview();
        if (callback != null) {
            callback();
        }
    });
}

function getComicName(content) {
    return content.split('<title>')[1].split('</title>')[0].split(' ')[0];
}

function getComicUrlsList(content) {
    var code = content.split("var cs='")[1].split("'")[0];
    var itemId = content.split("var ti=")[1].split(";")[0];
    return getComicUrls(code, itemId);
}

function appendComicPictureUrlToTable(comicName, comicVol, urlIndex) {
    var rowHtml = "";
    var urlSplit = comicVol.Urls[urlIndex].split("/");
    rowHtml += "<tr>";
    rowHtml += "<td width=\"15%\"><i class=\"fa fa-fw fa-link\"></i> 未下載</td>";
    rowHtml += "<td width=\"40%\">" + comicName + "/" + comicVol.Vol + "/" + urlSplit[urlSplit.length - 1] + "</td>";
    rowHtml += "<td width=\"45%\">" + comicVol.Urls[urlIndex] + "</td>";
    rowHtml += "</tr>";
    $('#comicUrlsList').append(rowHtml);
}

function getHtmlFromUrl(targetUrl, callback) {
    request({
        url: targetUrl,
        encoding: null
    }, function (err, response, body) {
        if (err == null && response.statusCode == 200) {
            var str = iconv.decode(new Buffer(body), "big5");
            callback(str);
        } else {
            alert(err);
            throw err;
        }
    });
}

function startDownload() {
    resetProgress($('#comicUrlsList').find('tr').length);
    var downloadRows = getDownloadRows();
    var parallelFunctions = [];
    $(downloadRows).each(function (index, row) {
        parallelFunctions.push(function (cb) {
            downloadComicPictureFile(row.statusColumn, row.path, row.url, cb);
        });
    });
    async.parallelLimit(parallelFunctions, 5, function (err, result) {
        console.log(err);
        console.log(result);
        console.log('finished');
    });
}

function getDownloadRows() {
    var downloadRows = [];

    $('#comicUrlsList').find('tr').each(function (index) {
        var statusColumn;
        var filePath;
        var url;
        $(this).find('td').each(function (index) {
            if (index == 0) {
                statusColumn = $(this);
            } else if (index == 1) {
                filePath = $(this).text();
            } else if (index == 2) {
                url = $(this).text();
            }
        });

        var row = {
            rowIndex: index,
            statusColumn: statusColumn,
            path: filePath,
            url: url
        };
        downloadRows.push(row);
    });
    return downloadRows;
}

function downloadComicPictureFile(statusColumn, filePath, url, callback) {
    var fullPath = $('#saveComicDialog').text() + "/" + filePath;
    fs.access(fullPath, fs.F_OK, function (err) {
        var fileExist = false;
        if (!err) {
            fileExist = true;
        }
        if ((fileExist && !$('#skipIfExist').is(':checked')) || !fileExist) {
            // change UI
            $(statusColumn).scrollintoview();
            $(statusColumn).html('<span class="text-info"><i class="fa fa-spinner fa-spin"></i> 下載中</span>');
            // make dir
            mkdirp(path.dirname(fullPath));
            // download
            var downloadTmpPath = os.tmpdir() + '/' + path.basename(fullPath)
            var file = fs.createWriteStream(downloadTmpPath);

            var request = http.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    moveFile(downloadTmpPath, fullPath, function () {
                        $(statusColumn).html('<span class="text-success"><i class="fa fa-check"></i> 完成</span>');
                        updateProgress();
                        callback();
                    });
                });
            });
        } else {
            $(statusColumn).html('<span class="text-danger"><i class="fa fa-copy"></i> 已存在</span>');
            updateProgress();
            callback();
        }
    });
}

function moveFile(fromPath, toPath, callback) {
    var streamFrom = fs.createReadStream(fromPath);
    var streamTo = fs.createWriteStream(toPath);

    streamFrom.pipe(streamTo);
    streamFrom.on('end', function () {
        fs.unlinkSync(fromPath);
        callback();
    });
}

function resetProgress(max) {
    $('#progressbar').css('width', '0%');
    $('#progressbar').attr('aria-valuemax', max);
    $('#progressbar').attr('aria-valuenow', 0);
}

function updateProgress() {
    var max = $('#progressbar').attr('aria-valuemax');
    var current = $('#progressbar').attr('aria-valuenow');
    ++current;
    var perctange = parseInt((current * 100.0) / max);
    $('#progressbar').css('width', perctange + '%');
    $('#progressbar').attr('aria-valuenow', current);
    if (current >= max) {
        alert('下載完成');
    }
}

$(document).ready(function () {
    initPage();
    $("#setComicFolder").click(function () {
        dialog.showOpenDialog({
            defaultPath: $("#saveComicDialog").text(),
            properties: ["openDirectory"]
        },
            function (directoryPath) {
                $("#saveComicDialog").text(directoryPath);
                appSettings.comicFolder = directoryPath;
                saveAppSettings();
            }
        );
    });

    $('#openComicFolder').click(function () {
        if (process.platform === 'darwin') {
            open($('#saveComicDialog').text(), { a: "Finder" }, function (error) { });
        } else {
            shell.openItem($('#saveComicDialog').text());
        }
    });

    $('#addComicUrl').blur(function () { });

    $('#addComicUrlButton').click(function () {
        getCorrectComicUrl($('#addComicUrl').val(), function (comicUrl) {
            $('#addComicUrl').val(comicUrl);
            getComicPicturesFromUrl(comicUrl);
        });
    });

    $('#getPictureList').click(function () {
        var comicUrl = $('#comicList').val();
        getComicPicturesFromList(comicUrl, $('#getAllPictures').is(':checked'), $('#lastVols').val());
    });

    $('#removeFromComicList').click(function () {
        var data = $('#comicList').find(":selected").text();
        var comicUrl = $('#comicList').val();
        if (confirm("確定要移除[" + data + "]?")) {
            removeUrlFromComicList(comicUrl);
        }
    });

    $("#oneKeyDownload").click(function () {
        var taskList = [];
        $("#comicList>option").each(function () {
            var comicUrl = $(this).val();
            taskList.push(function (cb) {
                getComicPicturesFromList(comicUrl, $('#getAllPictures').is(':checked'), $('#lastVols').val(), cb);
            });
        });
        taskList.push(function (cb) {
            startDownload();
        })
        async.parallelLimit(taskList, 1, function (err, result) {
            console.log(err);
            console.log(result);
            console.log('finished');
        });
    });

    $('#startDownload').click(function () {
        startDownload();
    });

    $('#clearPictureUrls').click(function () {
        $('#comicUrlsList').html('');
    });

    $('#getAllPictures').change(function () {
        if ($('#getAllPictures').is(':checked')) {
            $('#lastVols').attr('disabled', true);
        } else {
            $('#lastVols').removeAttr('disabled');
        }
    });
});