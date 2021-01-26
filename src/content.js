import { createStore } from 'redux';
import storeCreatorFactory from 'reduxed-chrome-storage';
import reducers from './reducers';
import { setStats } from './actions/marker';
import { mark, unmark } from './mark';

let stateJson0;
let toUnmark = false;
let stats = false;

// let mapbox = document.querySelectorAll('div.sc-epnACN.kJBIee')[0]
// shadowHost.id = 'shadowhost'
// let canvas = document.createElement('canvas')
// let nodeList = document.querySelectorAll('div')
// console.log('nodeList', nodeList)
// console.log('shadowHost', shadowHost)
// console.log('mapbox', mapbox)

// mapbox.insertAdjacentElement('beforeend',shadowHost)

// let shadowRoot = shadowHost.attachShadow({mode: 'open'})

// shadowRoot.appendChild(canvas)

// canvas.style.width = '100%'
// canvas.style.height = '100%'
// canvas.style.position = 'absolute'
// canvas.style.zIndex = 99999
// canvas.width = canvas.offsetWidth
// canvas.height = canvas.offsetHeight
// canvas.id = 'overlay'

// let ctx = canvas.getContext('2d')
let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return

    for (let i = 0; i < mutation.addedNodes.length; i++) {
      // do things to your newly added nodes here
      let node = mutation.addedNodes[i]
      console.log('new node', node)
    }
  })
})

observer.observe(document.body, {
    childList: true
  , subtree: true
  , attributes: false
  , characterData: false
})

// stop watching using:
observer.disconnect()

// const backButton = document.getElementsByClassName('sc-bdVaJa.eXXEGz')
// console.log(backButton)

// let shadowHost = document.createElement('div')
// backButton.insertAdjacentElement('afterend',shadowHost)

// let shadowRoot = shadowHost.attachShadow({mode: 'open'})

// loadImage()

// function loadImage() {
//   let base_image = new Image()
//   base_image.src = chrome.extension.getURL("public/icon-filled-64.png")
//   base_image.onload = function() {
//     shadowRoot.appendChild(base_image)
//   }
// }

const render = (store, tabHidden) => {
  const o = store.getState();
  const {account, marker, settings} = o;
  const state = {
    account: account && { keywords: account.keywords },
    marker: marker && { enabled: marker.enabled },
    settings
  };
  const stateJson = JSON.stringify(state);
  if (stateJson === stateJson0)
    return false;
  const toMark = account.keywords && marker.enabled;
  if (toUnmark) {
    unmark();
  }
  stateJson0 = stateJson;
  if (tabHidden)
    return false;
  stats = false;
  if (!toMark)
    return false;
  toUnmark = toMark;
  const {keywords} = account;
  const {matchWhole, matchCase} = settings;
  stats = mark({
    keywords, matchWhole, matchCase, style: style(settings)
  });
  updateStats(store);
  return true;
};

const style = settings => {
  const {color, colorBg, bold, underline} = settings;
  const acc = [];
  color && acc.push( ['color', color] );
  colorBg && acc.push( ['background-color', colorBg] );
  (color || colorBg) && acc.push( ['padding', '0.2em'] );
  bold && acc.push( ['font-weight', 'bold'] );
  underline && acc.push( ['text-decoration', 'underline'] );
  return acc.map( v => v[0] + ':' + v[1] ).join( ';' );
};

const updateStats = (store) => {
  stats && store.dispatch(setStats(stats));
};

//run this script
(async () => {
  // chrome.runtime.onMessage.addListener( data => {
  //   // if current tab received focus, apply mark/unmark operations (if any),
  //   // then, if there was no mark operation, update marker stats
  //   data && data.id === 'tabFocusPass' &&
  //   !render(store) && updateStats(store);
  // });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log('request', request)
      console.log('sender', sender)
      sendResponse({hello: 'hello'})
    }
  )

  const store = await storeCreatorFactory({createStore})(reducers);
  store.subscribe(() => {
    render(store, document.hidden);
  });
  render(store);
})();

