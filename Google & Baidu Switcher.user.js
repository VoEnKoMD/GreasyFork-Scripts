/* jshint esversion: 8 */
// ==UserScript==
// @name            Google & baidu Switcher (ALL in One)
// @name:en         Google & baidu & Bing Switcher (ALL in One)
// @name:zh-TW      谷歌、百度、必應的搜索引擎跳轉工具
// @version         2.5.20210602.2
// @author          F9y4ng
// @description     谷歌、百度、必应的搜索引擎跳转工具，脚本默认自动更新检测，可在菜单自定义设置必应按钮，搜索引擎跳转的最佳体验。
// @description:en  Google, Baidu and Bing search engine tool, Automatically updated and detected by default, The Bing button can be customized.
// @description:zh-TW  谷歌、百度、必應的搜索引擎跳轉工具，腳本默認自動更新檢測，可在菜單自定義設置必應按鈕，搜索引擎跳轉的最佳體驗。
// @namespace       https://openuserjs.org/scripts/t3xtf0rm4tgmail.com/Google_baidu_Switcher_(ALL_in_One)
// @supportURL      https://github.com/F9y4ng/GreasyFork-Scripts/issues
// @icon            https://www.google.com/favicon.ico
// @include         *://*.google.*/search*
// @include         *://*.google.*/webhp*
// @include         *://www.baidu.com/*
// @include         *://image.baidu.com/*
// @include         *://*.bing.com/*
// @exclude         *://*.google.*/sorry/*
// @exclude         *://*.google.*/url*
// @exclude         *://www.baidu.com/link*
// @compatible      Chrome 兼容TamperMonkey, ViolentMonkey
// @compatible      Firefox 兼容Greasemonkey4.0+, TamperMonkey, ViolentMonkey
// @compatible      Opera 兼容TamperMonkey, ViolentMonkey
// @compatible      Safari 兼容Tampermonkey • Safari
// @require         https://cdn.jsdelivr.net/npm/notice.js@0.4.0/dist/notice.js
// @grant           GM_info
// @grant           GM_registerMenuCommand
// @grant           GM.registerMenuCommand
// @grant           GM_unregisterMenuCommand
// @grant           GM_openInTab
// @grant           GM_getValue
// @grant           GM.getValue
// @grant           GM_setValue
// @grant           GM.setValue
// @license         GPL-3.0-only
// @create          2015-10-07
// @copyright       2015-2021, F9y4ng
// @run-at          document-start
// ==/UserScript==

'use strict';

!(function () {
  const isVersionDetection = true; // Set "false" to turn off the Version Detection.
  const isdebug = false;
  const debug = isdebug ? console.log.bind(console) : () => {};

  /* Perfectly Compatible For Greasemonkey4.0+, TamperMonkey, ViolentMonkey * F9y4ng * 20210601 */

  let GMsetValue, GMgetValue, GMregisterMenuCommand, GMunregisterMenuCommand, GMnotification, GMopenInTab;
  const GMinfo = GM_info;
  const handlerInfo = GMinfo.scriptHandler;
  const isGM = Boolean(handlerInfo.toLowerCase() === 'greasemonkey');
  const defCon = {
    scriptName: GMinfo.script.name,
    curVersion: GMinfo.script.version,
    isNoticed: sessionStorage.getItem('nCount') | 0,
    isNeedUpdate: 0,
    fetchResult: true,
    lastRuntime: new Date().toLocaleString('en-US', {
      timeZoneName: 'short',
      hour12: false,
    }),
    titleCase: (str, bool) => {
      const RegExp = bool ? /( |^)[a-z]/g : /(^)[a-z]/g;
      return str
        .toString()
        .toLowerCase()
        .replace(RegExp, L => {
          return L.toUpperCase();
        });
    },
    randString: (n, v, r) => {
      let s = '';
      let a = '0123456789';
      let b = 'abcdefghijklmnopqrstuvwxyz';
      let c = b.toUpperCase();
      n = Number.isFinite(n) ? n : 10;
      v ? (r = b + c) : (r = a + b + a + c);
      for (; n > 0; --n) {
        s += r[Math.floor(Math.random() * r.length)];
      }
      return s;
    },
  };
  defCon.rName = defCon.randString(7, true);

  debug(`//-> CheckGM: ${defCon.titleCase(isGM)} >> ${handlerInfo}`);

  if (isGM) {
    GMsetValue = GM.setValue;
    GMgetValue = GM.getValue;
    GMregisterMenuCommand = GM.registerMenuCommand;
    GMunregisterMenuCommand = () => {};
    GMopenInTab = (a, b) => {
      window.open(a, defCon.randString(b.length).slice(-6), '');
    };
  } else {
    GMsetValue = GM_setValue;
    GMgetValue = GM_getValue;
    GMregisterMenuCommand = GM_registerMenuCommand;
    GMunregisterMenuCommand = GM_unregisterMenuCommand;
    GMopenInTab = GM_openInTab;
  }

  GMnotification = (e, t, u, i, a, o) => {
    new NoticeJs({
      text: e,
      type: t,
      timeout: Number.isFinite(i) ? i : 30,
      width: 400,
      position: 'bottomRight',
      closeWith: ['click'],
      callbacks: {
        onShow: [
          () => {
            if (Number.isFinite(u)) {
              const m = setInterval(() => {
                u ? --u : clearInterval(m);
                const y = document.querySelector(`.${defCon.rName} dl dd b`);
                if (y) {
                  y.innerHTML = u;
                }
              }, 1e3);
            }
          },
        ],
        onClick: [
          () => {
            if (a) {
              const w = window.open(a, 'Update.Scripts', '');
              setTimeout(() => {
                if (o) {
                  window.opener = null;
                  w ? w.close() : () => {};
                }
              }, 2e3);
            }
          },
        ],
      },
    }).show();
  };

  console.info(
    `%c[GB-Init]%c\nVersion: ${defCon.curVersion} %c[%s]%c\nlastRuntime: ${defCon.lastRuntime}`,
    'font-weight:bold;color:dodgerblue',
    'color:0',
    'color:snow',
    `${Update_checkVersion() instanceof Object}`,
    'color:0'
  );

  function fetchVersion(u) {
    return new Promise((e, t) => {
      fetch(u, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
      })
        .then(e => {
          if (!e.ok) {
            throw Error(e.statusText);
          }
          return e.text();
        })
        .then(t => {
          let n = defCon.curVersion;
          t.split(/[\r\n]+/).forEach(function (item) {
            let key = item.match(/^(\/\/\s+@version\s+)(\S+)$/);
            if (key) {
              n = key[2];
            }
          });
          if (n !== undefined) {
            switch (isUpgrade(defCon.curVersion, n)) {
              case 2:
                e([2, n, u]);
                break;
              case 1:
                e([1, n, u]);
                break;
              default:
                e([0, n, u]);
                break;
            }
          }
        })
        .catch(e => {
          debug('%c[GB-Update]%c\nRequest Failure: %c(%s)', 'font-weight:bold;color:red', 'color:0', 'font-weight:bold;color:darkred', e);
          t();
        });
    });
  }

  function isUpgrade(current_version, compare_version) {
    let compare_version_array = compare_version.split('.');
    let current_version_array = current_version.split('.');
    let is_upgrade = 0;
    if (compare_version_array.length === current_version_array.length) {
      for (let i = 0; i < compare_version_array.length; i++) {
        if (parseInt(compare_version_array[i]) < parseInt(current_version_array[i])) {
          is_upgrade = 2;
          break;
        } else {
          if (parseInt(compare_version_array[i]) === parseInt(current_version_array[i])) {
            continue;
          } else {
            is_upgrade = 1;
            break;
          }
        }
      }
    } else {
      is_upgrade = 2;
    }
    return is_upgrade;
  }

  async function Update_checkVersion(s = false) {
    let t = [];
    if (isVersionDetection) {
      t = await fetchVersion(`https://greasyfork.org/scripts/12909/code/${defCon.randString(32)}.meta.js`).catch(async () => {
        defCon.fetchResult = false;
      });
      if (!defCon.fetchResult) {
        t = await fetchVersion(`https://raw.githubusercontent.com/F9y4ng/GreasyFork-Scripts/master/Google%20%26%20Baidu%20Switcher.meta.js`).catch(
          async () => {
            t = [0, defCon.curVersion, ''];
          }
        );
      }
      if (typeof t !== 'undefined') {
        defCon.isNeedUpdate = t[0];
        const lastestVersion = t[1];
        const updateUrl = t[2].replace('meta', 'user');
        const recheckURLs = new URL(
          updateUrl
            .replace('raw.githubusercontent', 'github')
            .replace('master', 'blob/master')
            .replace(/code\/[^/]+\.js/, '')
        );
        const sourceSite = defCon.titleCase(recheckURLs.hostname).split('.')[0];
        switch (defCon.isNeedUpdate) {
          case 2:
            if (!s) {
              console.warn(
                String(
                  `%c[GB-Update]%c\nWe found a new version, But %cthe latest version ` +
                    `%c${lastestVersion}%c is lower than your local version %c${defCon.curVersion}.%c\n\n` +
                    `Please confirm whether you need to upgrade your local script, and then you need to update it manually.\n\n` +
                    `If you no longer need the update prompt, please set "isVersionDetection" to "false" in your local code!\n\n` +
                    `[${sourceSite}]`
                ),
                'font-weight:bold;color:crimson',
                'font-weight:bold;color:0',
                'color:0',
                'font-weight:bold;color:tomato',
                'color:0',
                'font-weight:bold;color:darkred',
                'color:0'
              );
            }
            if (defCon.isNoticed < 2 || s) {
              GMnotification(
                String(`
                  <div class="${defCon.rName}">
                    <dl>
                      <dt>${defCon.scriptName}</dt>
                      <dd><span>发现版本异常</span>检测到远程版本 <i>${lastestVersion}</i> 低于您的本地版本 <i>${defCon.curVersion}，</i>\
                      由于您可能自行修改过本地脚本，如需覆盖安装，请点击这里手动确认升级？</dd>
                      <dd> ( isVersionDetection 设为 false，可永久关闭提示 ) </dd>
                      <dd>[ ${sourceSite} ]</dd>
                    <dl>
                  </div>`),
                'error',
                0,
                80,
                `${recheckURLs}`
              );
              sessionStorage.setItem('nCount', ++defCon.isNoticed);
            }
            break;
          case 1:
            if (!s) {
              console.info(
                String(
                  `%c[GB-Update]%c\nWe found a new version: %c${lastestVersion}%c.\n` +
                    `Please upgrade from your update source to the latest version.\n` +
                    `[${sourceSite}]`
                ),
                'font-weight:bold;color:crimson',
                'color:0',
                'color:crimson',
                'color:0'
              );
            }
            if (defCon.isNoticed < 2 || s) {
              GMnotification(
                String(`
                  <div class="${defCon.rName}">
                    <dl>
                      <dt>${defCon.scriptName}</dt>
                      <dd><span>发现版本更新</span>最新版本 <i>${lastestVersion}</i>，\
                      请点击这里进行直链安装升级。</dd>
                      <dd>[ ${sourceSite} ]</dd>
                    <dl>
                  </div>`),
                'warning',
                0,
                50,
                `${updateUrl}`,
                true
              );
              sessionStorage.setItem('nCount', ++defCon.isNoticed);
            }
            break;
          default:
            debug(
              `%c[GB-Update]%c\nCurretVersion: %c${defCon.curVersion}%c is up-to-date!`,
              'font-weight:bold;color:darkcyan',
              'color:0',
              'color:red',
              'color:0'
            );
            if (s) {
              GMnotification(
                String(`
                <div class='${defCon.rName}'>
                    <dl>
                      <dt>${defCon.scriptName}</dt>
                      <dd><span>更新成功</span>当前版本 <i>${defCon.curVersion}</i> 已为最新!</dd>
                      <dd>[ ${sourceSite} ]</dd>
                    </dl>
                  </div>`),
                'success'
              );
            }
            break;
        }
      } else {
        console.error(
          '%c[GB-Update]\n%cSome Unexpected Errors Caused Version Detection Failure.\nProbably Caused By NetworkError.',
          'font-weight:bold;color:red',
          'font-weight:bold;color:darkred'
        );
      }
    }
  }

  !(async function () {
    const temp = parseInt(await GMgetValue('_if_Use_Bing_'));
    const CONST = {
      noticeCss: `.noticejs-top{top: 0; width: 100%;} .noticejs-top .item{border-radius: 0 !important; margin: 0 !important;} .noticejs-topRight{top: 10px; right: 10px;} .noticejs-topLeft{top: 10px; left: 10px;} .noticejs-topCenter{top: 10px; left: 50%; transform: translate(-50%);} .noticejs-middleLeft, .noticejs-middleRight{right: 10px; top: 50%; transform: translateY(-50%);} .noticejs-middleLeft{left: 10px;} .noticejs-middleCenter{top: 50%; left: 50%; transform: translate(-50%, -50%);} .noticejs-bottom{bottom: 0; width: 100%;} .noticejs-bottom .item{border-radius: 0 !important; margin: 0 !important;} .noticejs-bottomRight{bottom: 10px; right: 10px;} .noticejs-bottomLeft{bottom: 10px; left: 10px;} .noticejs-bottomCenter{bottom: 10px; left: 50%; transform: translate(-50%);} .noticejs{z-index: 99999!important; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;} .noticejs .item{margin: 0 0 10px; border-radius: 3px; overflow: hidden;} .noticejs .item .close{float: right; font-size: 18px; font-weight: 700; line-height: 1; color: #fff; text-shadow: 0 1px 0 #fff; opacity: 1; margin-right: 7px;} .noticejs .item .close:hover{opacity: 0.5; color: #000;} .noticejs .item a{color: #fff; border-bottom: 1px dashed #fff;} .noticejs .item a, .noticejs .item a:hover{text-decoration: none;} .noticejs .success{background-color: #64ce83;} .noticejs .success .noticejs-heading{background-color: #3da95c; color: #fff; padding: 10px;} .noticejs .success .noticejs-body{color: #fff; padding: 10px!important;} .noticejs .success .noticejs-body:hover{visibility: visible !important;} .noticejs .success .noticejs-content{visibility: visible;} .noticejs .info{background-color: #3ea2ff;} .noticejs .info .noticejs-heading{background-color: #067cea; color: #fff; padding: 10px;} .noticejs .info .noticejs-body{color: #fff; padding: 10px!important;} .noticejs .info .noticejs-body:hover{visibility: visible !important;} .noticejs .info .noticejs-content{visibility: visible;} .noticejs .warning{background-color: #ff7f48;} .noticejs .warning .noticejs-heading{background-color: #f44e06; color: #fff; padding: 10px!important;} .noticejs .warning .noticejs-body{color: #fff; padding: 10px;} .noticejs .warning .noticejs-body:hover{visibility: visible !important;} .noticejs .warning .noticejs-content{visibility: visible;} .noticejs .error{background-color: #e74c3c;} .noticejs .error .noticejs-heading{background-color: #ba2c1d; color: #fff; padding: 10px!important;} .noticejs .error .noticejs-body{color: #fff; padding: 10px;} .noticejs .error .noticejs-body:hover{visibility: visible !important;} .noticejs .error .noticejs-content{visibility: visible;} .noticejs .progressbar{width: 100%;} .noticejs .progressbar .bar{width: 1%; height: 30px; background-color: #4caf50;} .noticejs .success .noticejs-progressbar{width: 100%; background-color: #64ce83; margin-top: -1px;} .noticejs .success .noticejs-progressbar .noticejs-bar{width: 100%; height: 5px; background: #3da95c;} .noticejs .info .noticejs-progressbar{width: 100%; background-color: #3ea2ff; margin-top: -1px;} .noticejs .info .noticejs-progressbar .noticejs-bar{width: 100%; height: 5px; background: #067cea;} .noticejs .warning .noticejs-progressbar{width: 100%; background-color: #ff7f48; margin-top: -1px;} .noticejs .warning .noticejs-progressbar .noticejs-bar{width: 100%; height: 5px; background: #f44e06;} .noticejs .error .noticejs-progressbar{width: 100%; background-color: #e74c3c; margin-top: -1px;} .noticejs .error .noticejs-progressbar .noticejs-bar{width: 100%; height: 5px; background: #ba2c1d;} @keyframes noticejs-fadeOut{0%{opacity: 1;} to{opacity: 0;} } .noticejs-fadeOut{animation-name: noticejs-fadeOut;} @keyframes noticejs-modal-in{to{opacity: 0.3;} } @keyframes noticejs-modal-out{to{opacity: 0;} } .noticejs{position: fixed; z-index: 10050; width: 400px;} .noticejs ::-webkit-scrollbar{width: 8px;} .noticejs ::-webkit-scrollbar-button{width: 8px; height: 5px;} .noticejs ::-webkit-scrollbar-track{border-radius: 10px;} .noticejs ::-webkit-scrollbar-thumb{background: hsla(0, 0%, 100%, 0.5); border-radius: 10px;} .noticejs ::-webkit-scrollbar-thumb:hover{background: #fff;} .noticejs-modal{position: fixed; width: 100%; height: 100%; background-color: #000; z-index: 10000; opacity: 0.3; left: 0; top: 0;} .noticejs-modal-open{opacity: 0; animation: noticejs-modal-in 0.3s ease-out;} .noticejs-modal-close{animation: noticejs-modal-out 0.3s ease-out; animation-fill-mode: forwards;} .${defCon.rName}{padding: 4px 4px 0 4px!important;} .${defCon.rName} dl dt{margin: 2px 0 8px 0!important; font-size: 16px!important; font-weight: 900!important;} .${defCon.rName} dl dd{margin: 3px 6px 0 0!important; font-size: 14px!important; line-height: 180%!important; margin-inline-start: 10px!important;} .${defCon.rName} dl dd b{font-family: Candara, sans-serif!important; font-size: 24px!important; padding: 0 5px;} .${defCon.rName} dl dd span{font-weight: 700; font-size: 15px!important; margin-right: 8px;} .${defCon.rName} dl dd i{font-family: Candara, sans-serif!important; font-size: 20px!important;}`,
      rndidName: defCon.randString(9, true),
      rndclassName: defCon.randString(12, true),
      bdyx: defCon.randString(5, true),
      ggyx: defCon.randString(5, true),
      bbyx: defCon.randString(5, true),
      isSecurityPolicy: false,
      isUseBing: (() => {
        if (isNaN(temp)) {
          GMsetValue('_if_Use_Bing_', 0);
          console.warn(
            '%c[GB-Warning]%c\nThis is your first visit, the Bing search button will not be inserted by default.',
            'font-weight:bold;color:salmon',
            'color:1'
          );
          return false;
        } else {
          return Boolean(temp);
        }
      })(),
    };

    let curretSite = {
      SiteTypeID: 1,
      SiteName: '',
      SplitName: '',
      MainType: '',
      HtmlCode: '',
      StyleType: '',
    };

    const listSite = {
      baidu: {
        SiteTypeID: 1,
        SiteName: 'Baidu',
        SplitName: 'tn',
        MainType: '.s_btn_wr',
        HtmlCode: CONST.isUseBing
          ? String(`
            <span id="${CONST.ggyx}">
                <input type="button" title="Google一下" value="Google"/>
            </span>
            <span id="${CONST.bbyx}">
                <input type="button" title="Bing一下" value="Bing ®"/>
            </span>`)
          : String(`
            <span id="${CONST.ggyx}">
                <input type="button" title="Google一下" value="Google一下"/>
            </span>`),
        StyleCode: CONST.isUseBing
          ? `#form{white-space: nowrap;} #u{z-index: 1!important;} #${CONST.rndidName} #${CONST.bbyx}{margin-left: -1.5px;} #${CONST.rndidName} #${CONST.ggyx}{margin-left: 2px;} #${CONST.bbyx} input{background: #4e6ef2; border-top-right-radius: 10px; border-bottom-right-radius: 10px; cursor: pointer; height: 40px; color: #fff; width: 80px; border: 1px solid #3476d2; font-size: 16px; font-weight:bold;} #${CONST.ggyx} input{background: #4e6ef2; border-top-left-radius: 10px; border-bottom-left-radius: 10px; cursor: pointer; height: 40px; color: #fff; width: 80px; border: 1px solid #3476d2; font-size: 16px; font-weight:bold;} #${CONST.ggyx} input:hover, #${CONST.bbyx} input:hover{background: #4662D9; border: 1px solid #3476d2;}`
          : `#form{white-space: nowrap;} #u{z-index: 1!important;} #${CONST.rndidName}{margin-left: 6px} #${CONST.ggyx} input{background: #4e6ef2; border-radius: 10px; cursor: pointer; height: 40px; color: #fff; width: 112px; border: 1px solid #3476d2; text-shadow: 0 0 2px #ffffff !important; font-size: 16px} #${CONST.ggyx} input:hover{background: #4662D9; border: 1px solid #3476d2;}`,
      },
      google: {
        SiteTypeID: 2,
        SiteName: 'Google',
        SplitName: 'tbm',
        MainType: "form button[type='submit']",
        HtmlCode: CONST.isUseBing
          ? String(`
            <span id="${CONST.bdyx}">
                <input type="button" title="百度一下" value="百度一下"/>
            </span>
            <span id="${CONST.bbyx}">
                <input type="button" title="Bing一下" value="Bing一下"/>
            </span>`)
          : String(`
            <span id="${CONST.bdyx}">
                <input type="button" title="百度一下" value="百度一下"/>
            </span>`),
        StyleCode: CONST.isUseBing
          ? `#${CONST.rndidName}{margin: 3px 4px 0 -5px;} #${CONST.rndidName} #${CONST.bdyx}{padding:5px 0 4px 18px; border-left:1px solid #ddd;} #${CONST.rndidName} #${CONST.bbyx}{margin-left:-2px} .scrollspan{padding:1px 0 0 18px!important} .scrollbars{height: 26px!important; font-size: 13px!important; font-weight: normal!important; text-shadow: 0 0 1px #ffffff !important;} #${CONST.bdyx} input{cursor: pointer; padding: 1px 1px 1px 6px!important; border: 1px solid transparent; background: #1a73e8; box-shadow: none; border-top-left-radius: 24px; border-bottom-left-radius: 24px; width: 90px; height: 38px; font-size: 15px; font-weight: 600; color: #fff} #${CONST.bbyx} input{cursor: pointer; padding: 1px 6px 1px 1px!important; border: 1px solid transparent; background: #1a73e8; box-shadow: none; border-top-right-radius: 24px; border-bottom-right-radius: 24px; width: 90px; height: 38px; font-size: 15px; font-weight: 600; color: #fff} #${CONST.bdyx} input:hover, #${CONST.bbyx} input:hover{background: #2b7de9;}`
          : `#${CONST.rndidName}{margin: 3px 4px 0 -5px;} #${CONST.rndidName} #${CONST.bdyx}{padding:5px 0 4px 18px; border-left:1px solid #ddd;} .scrollspan{padding:1px 0 0 18px!important} .scrollbars{height: 26px!important; font-size: 13px!important; font-weight: normal!important; text-shadow: 0 0 1px #ffffff !important;} #${CONST.bdyx} input{cursor: pointer; border: 1px solid transparent; background: #1a73e8; box-shadow: none; border-radius: 24px; width: 90px; height: 38px; font-size: 14px; font-weight: 600; color: #fff;} #${CONST.bdyx} input:hover{background: #2b7de9;}`,
      },
      bing: {
        SiteTypeID: 3,
        SiteName: 'Bing',
        SplitName: 'undefined',
        MainType: '#sb_go_par',
        HtmlCode: String(`
          <span id="${CONST.bdyx}">
              <input type="button" title="百度一下" value="百度"/>
          </span>
          <span id="${CONST.ggyx}">
              <input type="button" title="Google一下" value="Google"/>
          </span>`),
        StyleCode: `#${CONST.rndidName}{height: 44px; width: 120px; margin: 2px 10px 2px 0;} #${CONST.bdyx} input, #${CONST.ggyx} input{cursor: pointer; width: auto 60px; height: 40px; background-color: #f7faff; border: 1px solid #0095B7; color: #0095B7; margin-left: -1px; font-family: 'Microsoft YaHei'!important; font-size: 16px; font-weight: 700; border-radius: 4px;} .scrollspan{height: 32px!important;} .scrollbars{height: 30px!important;} #${CONST.bdyx} input:hover, #${CONST.ggyx} input:hover{background-color: #fff; transition:border linear .1s,box-shadow linear .3s; box-shadow: 1px 1px 8px #08748D; border: 2px solid #0095B7; text-shadow: 0 0 1px #0095B7 !important; color:#0095B7;}`,
      },
      other: { SiteTypeID: 0 },
    };

    const newSiteType = {
      BAIDU: listSite.baidu.SiteTypeID,
      GOOGLE: listSite.google.SiteTypeID,
      BING: listSite.bing.SiteTypeID,
      OTHERS: 0,
    };

    debug('//-> Initialization complete, start running...');

    if (location.host.includes('.baidu.com')) {
      curretSite = listSite.baidu;
    } else if (location.host.includes('.google.')) {
      curretSite = listSite.google;
    } else if (location.host.includes('.bing.com')) {
      curretSite = listSite.bing;
    } else {
      curretSite = listSite.other;
    }
    if (
      (curretSite.SiteTypeID === newSiteType.GOOGLE && location.href.replace(/tbm=(lcl|flm|fin)/, '') !== location.href) ||
      (curretSite.SiteTypeID === newSiteType.BING && location.href.replace(/maps\?/, '') !== location.href) ||
      (curretSite.SiteTypeID === newSiteType.BAIDU && location.href.replace(/tn=(news|ikaslist|vsearch)|detail\?/, '') !== location.href)
    ) {
      CONST.isSecurityPolicy = true;
    }

    let menuManager = {
      menuDisplay: () => {
        const _Use_Bing_ = CONST.isUseBing;
        let _use_Bing_ID, in_Use_feedBack_ID, in_UpdateCheck_ID, vCount;
        if (!CONST.isSecurityPolicy) {
          registerMenuCommand();
        }
        console.log(
          '%c[GB-Status]%c\nInsert the Bing Search Button: %c%s',
          'font-weight:bold;color:darkorange',
          'color:0',
          'font-weight:bold;color:red',
          defCon.titleCase(_Use_Bing_)
        );

        debug(`//-> CONST.isUseBing: ${_Use_Bing_}`);

        function registerMenuCommand() {
          let _Use_Bing__;
          _use_Bing_ID ? GMunregisterMenuCommand(_use_Bing_ID) : () => {};
          in_Use_feedBack_ID ? GMunregisterMenuCommand(in_Use_feedBack_ID) : () => {};
          in_UpdateCheck_ID ? GMunregisterMenuCommand(in_UpdateCheck_ID) : () => {};
          if (_Use_Bing_) {
            _Use_Bing__ = '\u2705';
          } else {
            _Use_Bing__ = '\u274c';
          }
          _use_Bing_ID = GMregisterMenuCommand(`${_Use_Bing__} Bing 搜索跳转`, () => {
            if (!vCount) {
              inUse_switch(_Use_Bing_, '_if_Use_Bing_', 'Bing 按钮');
              vCount = true;
            }
          });
          in_Use_feedBack_ID = GMregisterMenuCommand('\ud83d\udcc3 使用反馈', () => {
            GMopenInTab('https://greasyfork.org/scripts/12909/feedback', {
              active: true,
              insert: true,
              setParent: true,
            });
          });
          if (isVersionDetection) {
            in_UpdateCheck_ID = GMregisterMenuCommand('\ud83d\udd0e 检查更新', () => {
              Update_checkVersion(true);
            });
          }
        }

        function inUse_switch(_status, Name, Tips) {
          const inf = x => {
            return String(`
              <div class='${defCon.rName}'>
                  <dl>
                    <dt>温馨提示：</dt>
                    <dd>${Tips}已${x}完成，网页将在<b>3</b>秒后自动刷新！</dd>
                  </dl>
              </div>`);
          };
          if (_status) {
            GMsetValue(`${Name}`, 0);
            GMnotification(inf('\u6e05\u9664'), 'info', 3);
          } else {
            GMsetValue(`${Name}`, 1);
            GMnotification(inf('\u6dfb\u52a0'), 'info', 3);
          }
          setTimeout(() => {
            let loc = location.href.replace(/&timestamp=(\d+)/, '');
            location.replace(loc + `&timestamp=` + new Date().getTime());
          }, 3e3);
        }
      },
      init: function () {
        this.menuDisplay();
      },
    };

    let searchManager = {
      doSwitch: () => {
        try {
          const idName = `#${CONST.rndidName}`;
          const className = `.${CONST.rndclassName}`;
          if (curretSite.SiteTypeID !== newSiteType.OTHERS) {
            if (CONST.isSecurityPolicy) {
              console.log(
                '%c[GB-Prohibit]%c\nBlocked By: %c%s Security Policy',
                'font-weight:bold;color:indigo',
                'color:0',
                'color:darkred',
                curretSite.SiteName
              );
              return;
            } else {
              const callback = mutations => {
                mutations.forEach(mutation => {
                  if (document.querySelector(className) && document.querySelector(idName)) {
                    debug(`//-> Already Insert Button & CSS.`);
                  } else {
                    debug(
                      '%c[GB-MutationObserver]\n%c(%c%s%c has changed: %c%s%c)',
                      'font-weight:bold;color:olive',
                      'color:0',
                      'color:olive',
                      mutation.type,
                      'color:0',
                      'font-weight:bold;color:red',
                      defCon.titleCase(insertSearchButton() && scrollDetect()),
                      'color:0'
                    );
                  }
                });
              };
              const opts = { childList: true, subtree: true };
              new MutationObserver(callback).observe(document, opts);
              RAFInterval(
                () => {
                  if (!document.querySelector(idName) || !document.querySelector(className)) {
                    return insertSearchButton() && scrollDetect();
                  }
                },
                500,
                true
              );
              console.log(
                '%c[GB-Switch]%c\nWe are using The %c%s%c Search Engine.',
                'font-weight:bold;color:Green',
                'color:0',
                'font-weight:bold;color:darkcyan',
                curretSite.SiteName,
                'font-weight:normal;color:0'
              );
            }
          }
        } catch (e) {
          debug(`//-> %c${e.name}`, 'color:darkred');
        }

        function insertSearchButton() {
          try {
            const getTarget = curretSite.MainType;
            const doHtml = curretSite.HtmlCode;
            const doStyName = `${CONST.rndclassName}`;
            const doStyle = curretSite.StyleCode + CONST.noticeCss;
            const vim = GetUrlParam(curretSite.SplitName);
            const userSpan = document.createElement('span');
            let Target = document.querySelector(getTarget);
            userSpan.id = `${CONST.rndidName}`;
            userSpan.innerHTML = doHtml;
            const SpanID = `#${userSpan.id}`;

            addStyle(doStyle, doStyName, 'head');

            if (!document.querySelector(SpanID) && getSearchValue().length > 0 && Target) {
              if (/^(nws|vid|bks)$/.test(vim.trim())) {
                Target = Target.parentNode.parentNode.firstChild;
                Target.insertBefore(userSpan, Target.firstChild);
                if (document.querySelector(SpanID)) {
                  document.querySelector(SpanID).setAttribute('style', 'float:right');
                }
              } else {
                insterAfter(userSpan, Target);
                // Baidu image fixed
                if (document.querySelector(SpanID) && /^baiduimage$/.test(vim.trim())) {
                  document.querySelector(SpanID).setAttribute('style', 'margin-left:12px');
                }
                // Bing image fixed
                if (
                  document.querySelector('.b_searchboxForm') &&
                  /^images$/.test(vim.trim()) &&
                  location.href.replace(/view=detailV2/, '') !== location.href
                ) {
                  document.querySelector('.b_searchboxForm').setAttribute('style', 'width:640px');
                }
              }

              debug(`//-> Target: ${Target}`);

              document.querySelectorAll(`#${CONST.ggyx}, #${CONST.bbyx}, #${CONST.bdyx}`).forEach(per => {
                per.addEventListener('click', () => {
                  let gotoUrl = 'about:blank';
                  switch (per.id) {
                    case `${CONST.ggyx}`:
                      if (/^(baiduimage|images)$/.test(vim.trim())) {
                        gotoUrl = 'https://www.google.com/search?hl=zh-CN&source=lnms&tbm=isch&sa=X&q=';
                      } else {
                        gotoUrl = 'https://www.google.com/search?hl=zh-CN&source=hp&newwindow=1&q=';
                      }
                      break;
                    case `${CONST.bbyx}`:
                      if (/^(isch|baiduimage)$/.test(vim.trim())) {
                        gotoUrl = 'https://cn.bing.com/images/search?first=1&tsc=ImageBasicHover&q=';
                      } else {
                        gotoUrl = 'https://cn.bing.com/search?q=';
                      }
                      break;
                    case `${CONST.bdyx}`:
                      if (/^(images|isch)$/.test(vim.trim())) {
                        gotoUrl = 'https://image.baidu.com/search/index?tn=baiduimage&ps=1&ie=utf-8&word=';
                      } else {
                        gotoUrl = 'https://www.baidu.com/s?ie=utf-8&rqlang=cn&wd=';
                      }
                      break;
                    default:
                      break;
                  }
                  debug(`//-> ${per.id}`);
                  GMopenInTab(decodeURI(gotoUrl + getSearchValue()), {
                    active: true,
                    insert: true,
                    setParent: true,
                  });
                });
              });
            }
            return true;
          } catch (e) {
            debug(`//-> %c${e}`, 'color:darkred');
            return false;
          }
        }

        function scrollDetect() {
          try {
            const nodeName = `#${CONST.rndidName}`;
            const vim = GetUrlParam(curretSite.SplitName);
            switch (curretSite.SiteTypeID) {
              case newSiteType.GOOGLE:
                scrollButton(`${nodeName} #${CONST.bdyx}`, 'scrollspan', 35);
                scrollButton(`${nodeName} #${CONST.bdyx} input`, 'scrollbars', 35);
                if (CONST.isUseBing) {
                  scrollButton(`${nodeName} #${CONST.bbyx} input`, 'scrollbars', 35);
                }
                break;
              case newSiteType.BING:
                if (/^(images|videos)$/.test(vim.trim())) {
                  scrollButton(`${nodeName}`, 'scrollspan', 50);
                  scrollButton(`${nodeName} #${CONST.bdyx} input`, 'scrollbars', 50);
                  scrollButton(`${nodeName} #${CONST.ggyx} input`, 'scrollbars', 50);
                }
                break;
              default:
                debug(`//-> No scrolling detecting.`);
                break;
            }
            return true;
          } catch (e) {
            debug(`//-> %c${e.name}`, 'color:darkred');
            return false;
          }
        }

        function scrollButton(paraName, classNameIn, scrollSize) {
          debug(`//-> ${curretSite.SiteName} Scrolling Detecting: ${paraName}`);
          const oDiv = document.querySelector(paraName);
          let H = 0;
          let Y = oDiv;
          if (Y !== null) {
            while (Y) {
              H += Y.offsetTop;
              Y = Y.offsetParent;
            }
            document.addEventListener('scroll', () => {
              const s = document.body.scrollTop || document.documentElement.scrollTop;
              debug(`//-> H=${H} S=${s} H-S=(${H - s})`);
              if (s > H + scrollSize) {
                oDiv.setAttribute('class', classNameIn);
              } else {
                oDiv.removeAttribute('class');
              }
            });
          }
        }

        function addStyle(css, className, addToTarget, isReload, initType) {
          RAFInterval(
            () => {
              let addTo = document.querySelector(addToTarget);
              if (typeof addToTarget === 'undefined') {
                addTo = document.head || document.body || document.documentElement || document;
              }
              isReload = isReload || false;
              initType = initType || 'text/css';
              if (typeof addToTarget === 'undefined' || (typeof addToTarget !== 'undefined' && document.querySelector(addToTarget))) {
                if (isReload === true) {
                  safeRemove(`.${className}`);
                } else if (isReload === false && document.querySelector(`.${className}`)) {
                  return true;
                }
                const cssNode = document.createElement('style');
                if (className !== null) {
                  cssNode.className = className;
                }
                cssNode.setAttribute('type', initType);
                cssNode.innerHTML = css;
                try {
                  addTo.appendChild(cssNode);
                } catch (e) {
                  debug(`//-> %c${e.name}`, 'color:darkred');
                }
                return true;
              }
            },
            20,
            true
          );
        }

        function safeRemove(Css) {
          safeFunction(() => {
            const removeNodes = document.querySelectorAll(Css);
            for (let i = 0; i < removeNodes.length; i++) {
              removeNodes[i].remove();
            }
          });
        }

        function safeFunction(func) {
          try {
            func();
          } catch (e) {
            debug(`//-> %c${e.name}`, 'color:darkred');
          }
        }

        function getSearchValue() {
          let val = '';
          document.querySelectorAll('input[name="wd"], input[name="q"], input[name="word"]').forEach((item, index, arr) => {
            val = arr[0].value;
            if (val) {
              debug(`//-> INPUT: ${val} - INDEX: ${index} - OLD: ${item.value}`);
            }
          });
          if (val === null || val === '' || typeof val === 'undefined') {
            const kvl = location.search.substr(1).split('&');
            for (let i = 0; i < kvl.length; i++) {
              let value = kvl[i].replace(/^(wd|word|kw|query|q)=/, '');
              if (value !== kvl[i]) {
                val = value;
              }
            }
            val = val.replace(/\+/g, ' ');
            if (val) {
              debug(`//-> QUERY: ${val}`);
            }
          }
          return encodeURIComponent(val);
        }

        function RAFInterval(callback, period, runNow) {
          const needCount = (period / 1000) * 60;
          let times = 0;
          if (runNow === true) {
            const shouldFinish = callback();
            if (shouldFinish) {
              return;
            }
          }

          function step() {
            if (times < needCount) {
              times++;
              requestAnimationFrame(step);
            } else {
              const shouldFinish = callback() || false;
              if (!shouldFinish) {
                times = 0;
                requestAnimationFrame(step);
              } else {
                return;
              }
            }
          }
          requestAnimationFrame(step);
        }

        function insterAfter(newElement, targetElement) {
          if (targetElement !== null) {
            const parent = targetElement.parentNode;
            if (parent.lastChild === targetElement) {
              parent.appendChild(newElement);
            } else {
              parent.insertBefore(newElement, targetElement.nextSibling);
            }
          }
        }

        function GetUrlParam(paraName) {
          if (paraName === 'undefined') {
            const parameter = document.location.pathname.toString();
            const arr = parameter.split('/');
            return arr[1];
          } else {
            const url = document.location.toString();
            const arrObj = url.split('?');
            if (arrObj.length > 1) {
              const arrPara = arrObj[1].split('&');
              let arr;
              for (let i = 0; i < arrPara.length; i++) {
                arr = arrPara[i].split('=');
                if (arr !== null && arr[0] === paraName) {
                  return arr[1];
                }
              }
              return '';
            } else {
              return '';
            }
          }
        }
      },

      init: function () {
        debug('//-> Loading menu...');
        menuManager.init();
        debug('//-> Insert button...');
        this.doSwitch();
      },
    };

    (function () {
      try {
        searchManager.init();
      } catch (e) {
        console.error('%c[GB-Error]%c\nConsole: %c%s%c.', 'font-weight:bold;color:red', 'color:0', 'font-weight:bold;color:darkred', e, 'color:0');
      }
    })();
  })();
})();
