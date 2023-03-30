const INSTANCE_NAME = "testWidget";

const loadApp = (url) => {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.cssText = "height: 100% !important; width: 100% !important; position: fixed !important; border: 0px !important; inset: 0px !important; max-height: 100% important; z-index: 99999 !important";
  document.body.appendChild(iframe);
  const receiveMessage = (e) => {
    "close-iframe" == e.data && iframe.remove();
  }
  iframe.onload = () => {
    iframe.contentWindow.postMessage({
      testData: "some data..."
    }, "*");
  };
  window.addEventListener("message", receiveMessage);
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
