8ComicDownloader (Electron Version) 1.2 Last Updated: 2015/07/03

![8Comicdownloader Electron Version](http://wellwind.github.io/8comicdownloader-electron/screenshots/app-screenshot.png)

簡介
================
一個簡單從8Comic網站下載漫畫的程式，最新版本[按此下載](http://wellwind.github.io/8comicdownloader-electron/8comicdownloader-electron-latest.zip)。

本程式從 https://github.com/wellwind/8ComicDownloader 改進，修改過去的bug並增強功能，同時使用GitHub推出的Electron做為框架，理論上可以達到跨平台目標，但沒有環境可測試目前僅確定Windows系統可以正常運行，歡迎高手幫忙試玩看看(須自行build source code)。

使用方式
================
1. 下載8comicdownloader-electron-latest.zip
2. 解壓縮並執行8Comicdownloader.exe
3. 在[漫畫目錄]設定漫畫存放的目錄
4. 8Comicdownloader.exe畫面可以選擇分析最後N集漫畫網址，或目前所有集數的網址
5. 從 http://www.8comic.com/ 找到想要下載的漫畫
6. 將漫畫網址貼到[請輸入漫畫網址...]欄位中
7. 按下[加入漫畫網址]
8. 重複步驟4-7產生所有想下載漫畫的圖片網址
9. 按下[開始下載]按鈕，即可將漫畫下載到電腦中

進階功能
================
- 設定檔放在執行檔目錄下的settings.conf，未來改版可備份此設定檔直接使用
- 已加入過的漫畫網址會記錄在漫畫清單下的下拉選單中可以選擇，選擇後按下[取得漫畫清單]
- 若想移除已加入的漫畫，可按下漫畫下拉選單旁的[移除]按鈕

注意事項
================
- Windows必須安裝[[.Net Framework 4](http://www.microsoft.com/zh-tw/download/details.aspx?id=17718)]才可執行
- 目前是出的可執行檔都只有Windows版，由於我目前沒有Linux/Mac環境可測試，Linux/Mac使用者需要再等等
- 本程式僅供網路測試，請勿做為商業或任何不法用途

版本紀錄
================
v1.2 - 2015/07/03
- 修正部分漫畫輸入漫畫網址不會產生級數網址問題

v1.1 - 2015/07/02
- 調整開發工具不顯示的方式, 以免開啟程式時畫面會閃動
- 調整開啟漫畫資料夾的方式, 以確保之後可以正確跨平台
- 改變[取得漫畫清單]按鈕按下後移至清單最後一筆的顯示方式
- 由於Electron沒有辦法使用滑鼠右鍵貼上網址, 因此針對輸入漫畫網址文字方塊加入右鍵選單

v1.0 - 2015/07/01
- [版本] 1.0版release
- 改善過去C#版本單執行緒，加快下載速度
- 改善一定要任選一集漫畫網址的模式，可直接複製漫畫網址，不用在一定要隨意選一集的網址
- [已知問題] 在Electron架構下原本幾百kb的程式確需要進100MB的框架，未來希望改進能自動更新程式以免每次都要重新下載龐大框架
