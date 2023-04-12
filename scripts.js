const INSTANCE_NAME = "billingWidget";
const APP_URL = "https://test-react-widget.vercel.app/";
// const APP_URL = "http://localhost:4000/";

const guid = () => {
  var S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

let appLoading;

const loadApp = (payUrl, id) => {
  if(!appLoading) {
    appLoading = true;
    
    const spinKeyframe = `spin-keyframe-${id}`;
    const noScrollClass = `noscroll-${id}`;
    document.body.classList.add(noScrollClass);

    const loadingDiv = document.createElement('div');
    const spinner = document.createElement('div');

    loadingDiv.style.cssText = `
      height: 100% !important; 
      width: 100% !important; 
      position: fixed !important;
      border: 0px !important; inset: 0px !important;
      max-height: 100% important;
      z-index: 99998 !important;
      background: rgba(33, 33, 58, 0.54);
    `;
    spinner.style.cssText = `
      display: block;
      width: 34px;
      height: 34px;
      border: 5px solid rgba(255, 255, 255, 0.65);
      border-radius: 50%;
      border-top-color: #256aec;
      animation: ${spinKeyframe} 1s linear infinite;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      margin: auto;
    `;

    const iframe = document.createElement('iframe');
    iframe.onload = () => {
      appLoading = false;
    };
    iframe.src = APP_URL;
    iframe.name = id;
    iframe.style.cssText = `
      height: 100% !important;
      width: 100% !important; 
      position: fixed !important; 
      border: 0px !important; 
      inset: 0px !important;
      max-height: 100% important; 
      z-index: 99999 !important;
    `;

    const receiveMessage = (e) => {
      const type = e?.data?.billing_widget?.type;
      switch (type) {
        case `loaded-${id}`:
          spinner.remove();
          break;
        case `close-iframe-${id}`:
          window.removeEventListener("message", receiveMessage);
          iframe.remove();
          loadingDiv.remove();
          document.body.classList.remove(noScrollClass);
          break;
        case `get-data-${id}`:
          iframe.contentWindow.postMessage(
            {
              billing_widget: {
                type: `send-data-${id}`,
                data: {
                  payUrl,
                }
              },
            },
            APP_URL
          );
          break;
        default:
          console.warn(`Unsupported [${type}]`);
      }
    }
    window.addEventListener("message", receiveMessage);

    loadingDiv.appendChild(spinner);
    document.body.appendChild(loadingDiv);
    document.body.appendChild(iframe);
  };
};

const loader = (win, script) => {
  const instanceLoader = win[INSTANCE_NAME];
  const id = guid();
  const spinKeyframe = `spin-keyframe-${id}`;
  const noScrollClass = `noscroll-${id}`

  const style = document.querySelector(`style#style-${id}`);
  if (!style) {
    document.head.insertAdjacentHTML("beforeend", `
      <style id=style-${id}>
        .${noScrollClass} {
          overflow: hidden;
        }
        @keyframes ${spinKeyframe} {
          to {
            -webkit-transform: rotate(360deg);
          }
        };
      </style>
    `);
  };

  if (instanceLoader?.q) {
    // async init
    for (let i = 0; i < instanceLoader?.q?.length; i++) {
      const item = instanceLoader.q[i];
      const method = item[0];
      const args = item[1];

      switch (method) {
        case 'init':
          loadApp(args.url, id);
          break;
        default:
          console.warn(`Unsupported [${method}]`, args);
      }
    }
  }

  // call 
  win[INSTANCE_NAME] = (method, args) => {
    switch (method) {
      case 'init': {
        loadApp(args.url, id);
        break;
      }
      default:
        console.warn(`Unsupported [${method}]`, args);
    }
  };

  const staticElementsID = script.getAttribute("data-payment-id") || `${INSTANCE_NAME}ID`;
  const staticElements = window.document.querySelectorAll(`[id=${staticElementsID}]`);
  const scriptID = script.getAttribute("id");
  if (staticElements.length && !scriptID) {
    const DATA_URL_ATTR = "data-payment-url";
    for (let i = 0; i < staticElements?.length; i++) {
      const element = staticElements[i];
      const url = element.getAttribute(DATA_URL_ATTR);
      if (url) {
        element.addEventListener("click", () => win[INSTANCE_NAME]("init", { url }));
      }
    }
  }
};

loader(window, document.currentScript);
