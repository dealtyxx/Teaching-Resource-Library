(function(){"use strict";self.onmessage=s=>{if(s.data.type!=="evaluate")return;const e=s.data.selected===s.data.answer;self.postMessage({correct:e,bonus:e?20:5})}})();
