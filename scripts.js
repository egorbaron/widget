const INSTANCE_NAME = "testWidget";
const APP_URL = "https://test-react-widget.vercel.app/";
// const APP_URL = "http://localhost:3002/";

const guid = () => {
  var S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

let appLoading;

const loadApp = async (payUrl, id) => {
  if(!appLoading) {
    appLoading = true;
    const iframe = document.createElement('iframe');
    iframe.src = APP_URL;
    iframe.onload = () => {
      appLoading = false;
    };
    iframe.name = id;
    iframe.style.cssText = "height: 100% !important; width: 100% !important; position: fixed !important; border: 0px !important; inset: 0px !important; max-height: 100% important; z-index: 99999 !important";
    const receiveMessage = (e) => {
      const type = e?.data?.test_widget?.type;
      switch (type) {
        case `close-iframe-${id}`:
          window.removeEventListener("message", receiveMessage);
          iframe.remove();
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
    document.body.appendChild(iframe);
  }
};

const loader = (win) => {
    const instanceLoader = win[INSTANCE_NAME];
    if (!instanceLoader || !instanceLoader.q) {
        throw new Error(`Not found loader for [${INSTANCE_NAME}].`);
    }
    win[`loaded-${INSTANCE_NAME}`] = true;
    const id = guid();
    
    // async init
    for (let i = 0; i < instanceLoader.q.length; i++) {
      const item = instanceLoader.q[i];
      const method = item[0];
      const args = item[1];

      switch (method) { 
        case 'init':
          loadApp(args.url, id);
          break;
        case 'initWithButton':
          const parent = args.parent;
          const button = document.createElement("button");
          const buttonID = `button-${id}`;
          button.id = buttonID;
          button.innerText = args.buttonText;

          document.head.insertAdjacentHTML("beforeend", `
            <style>
              #${buttonID} {
                background-color: #256aec;
                border: none;
                color: #ffffff;
                padding: 8px 16px;
                text-align: center;
                font-size: 15px;
                cursor: pointer;
                outline: 0;
                transition: all 0.2s ease-out;
              }
              #${buttonID}:hover {
                opacity: 0.87;
                transition: all 0.2s ease-out;
              }
            </style>
          `);

          button.addEventListener("click", () => testWidget("init", {
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
