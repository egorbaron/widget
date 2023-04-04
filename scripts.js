const INSTANCE_NAME = "testWidget";
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
      const type = e?.data?.test_widget?.type;
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
              test_widget: {
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

const loader = (win) => {
  const instanceLoader = win[INSTANCE_NAME];
  if (!instanceLoader || !instanceLoader.q) {
    throw new Error(`Not found loader for [${INSTANCE_NAME}].`);
  }
  const id = guid();
  const buttonID = `button-${id}`;
  const spinKeyframe = `spin-keyframe-${id}`;
  const noScrollClass = `noscroll-${id}`
  
  // async init
  for (let i = 0; i < instanceLoader.q.length; i++) {
    const item = instanceLoader.q[i];
    const method = item[0];
    const args = item[1];

    const style = document.querySelector(`style#style-${id}`);
    if(!style) {
      document.head.insertAdjacentHTML("beforeend", `
        <style id=style-${id}>
          .${noScrollClass} {
            overflow: hidden;
          }
          #${buttonID}:hover {
            opacity: 0.87;
            transition: all 0.2s ease-out;
          }
          @keyframes ${spinKeyframe} {
            to {
              -webkit-transform: rotate(360deg);
            }
          };
        </style>
      `);
    };

    switch (method) { 
      case 'init':
        loadApp(args.url, id);
        break;
      case 'initWithButton':
        const parent = args.parent;
        const button = document.createElement("button");
        button.id = buttonID;
        button.style.cssText = `
          background-color: #256aec;
          border: none;
          color: #ffffff;
          padding: 8px 16px;
          text-align: center;
          font-size: 15px;
          display: inline-block;
          cursor: pointer;
          outline: 0;
          transition: all 0.2s ease-out;
        `;
        button.innerText = args.buttonText;
        button.addEventListener("click", () => win[INSTANCE_NAME]("init", {
          url: args.url,
        }));
        parent.append(button);
        break;
      default:
        console.warn(`Unsupported [${method}]`, args);
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
};

loader(window);
