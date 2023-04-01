const INSTANCE_NAME = "testWidget";
const APP_URL = "https://test-react-widget.vercel.app/";

const guid = () => {
  var S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

const loadApp = (payUrl) => {
  const iframe = document.createElement('iframe');
  const id = guid();
  iframe.src = "http://localhost:3000/";
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
};

const loader = (win) => {
    const instanceLoader = win[INSTANCE_NAME];
    if (!instanceLoader || !instanceLoader.q) {
        throw new Error(`Not found loader for [${INSTANCE_NAME}].`);
    }
    
    // async init
    for (let i = 0; i < instanceLoader.q.length; i++) {
      const item = instanceLoader.q[i];
      const method = item[0];
      const args = item[1];

      switch (method) { 
        case 'init':
          win[`loaded-${INSTANCE_NAME}`] = true;
          loadApp(args.url);
          break;
        default:
          console.warn(`Unsupported [${method}]`, args);
      }
    }

    // call 
    win[INSTANCE_NAME] = (method, args) => {
      switch (method) {
        case 'init': {
          loadApp(args.url);
          break;
        }
        default:
          console.warn(`Unsupported [${method}]`, args);
      }
    };
};

loader(window);
