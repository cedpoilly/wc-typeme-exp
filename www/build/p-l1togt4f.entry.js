import{r as t,h as i,g as e}from"./p-8f39645a.js";class s{constructor(i){t(this,i),this.FORWARD=1,this.BACKSPACE=-1,this.LINEBREAK=2,this.PAUSE=3,this.END=0,this.loop=!1,this.childList="",this.mainClassName="",this.hideCursor=!1,this.typingSpeed=500,this.deleteSpeed=800,this.backspaceDelay=500,this.startAnimation=!0,this.onAnimationEnd=()=>{},this.cursorCharacter="|",this.cursorBlinkSpeed=800,this.containerCn="tm",this.cursorCn="tm-cursor",this.deleteChar=0,this.itemIndex=0,this.charIndex=0,this.typedString="",this.newTypedString="",this.typingInterval=6e4/(5*this.typingSpeed),this.deleteInterval=6e4/(5*this.deleteSpeed),this.elapsed=0,this.animationPaused=!1,this.animationEnded=!1,this.instanceId=Math.random().toString(36).substring(2,5)+Math.random().toString(36).substring(2,5)}connectedCallback(){this.setStyles(),this.handleAnimation()}componentDidLoad(){this.handleSlotBaseText()&&this.handleAnimation()}cursorBlinkSpeedHandler(){this.setStyles()}typedStringHandler(){this.handleAnimation(),this.mainClassName&&(this.containerCn=`${this.containerCn} ${this.mainClassName}`),(!this.startAnimation||this.animationEnded||this.animationPaused)&&(this.cursorCn=`${this.cursorCn} tm-blink`)}setStyles(){this.el.style.setProperty("--cursor-blink-speed",`${this.cursorBlinkSpeed}ms`,"!important")}handleAnimation(){if(this.startAnimation){let t=[];if(this.strings&&Array.isArray(this.strings)&&(t=this.strings),this.strings&&"string"==typeof this.strings)if((t=>"["===t.charAt(0))(this.strings)){t=[...this.strings.substr(1,this.strings.length-2).split(",").map(t=>t.split("").filter(t=>"'"!=t).join(""))]}else t=[this.strings];this.childList&&"string"==typeof this.childList&&(t=[this.childList]),this.childList&&Array.isArray(this.childList)&&(t=this.childList);const i=t.map(t=>{if("__LINEBREAK__"===t.trim())return{type:{displayName:"LineBreak"}};if(t.trim().includes("__DELETE__")){const i=t.trim().substring(10,t.trim().length);return{type:{displayName:"Delete"},props:{characters:Number(i)}}}if(t.trim().includes("__DELAY__")){const i=t.trim().substring(9,t.trim().length)||0;return{type:{displayName:"Delay"},props:{ms:Number(i)}}}return t});this.nextItem=this.getNextItem(i);let{direction:e}=this.nextItem;if(e===this.END)this.onAnimationEnd(),this.loop?(this.charIndex=0,this.itemIndex=0,this.typedString="",this.newTypedString=""):this.animationEnded=!0;else if(e===this.FORWARD){let t=`${this.newTypedString}${this.nextItem.string[this.charIndex]}`;this.newTypedString=t,window.setTimeout(this.updateTypedString(this.typingInterval,t),this.typingInterval),this.charIndex>=this.nextItem.string.length-1?(this.charIndex=0,this.itemIndex+=1):this.charIndex+=1}else if(e===this.LINEBREAK){let t=`${this.newTypedString}•`;this.newTypedString=t,window.setTimeout(this.updateTypedString(this.typingInterval,t),this.typingInterval),this.itemIndex+=1,this.charIndex=0}else if(e===this.BACKSPACE){let t=`${this.newTypedString.substring(0,this.newTypedString.length-1)}`;this.newTypedString=t,1===this.nextItem.chars&&(this.itemIndex+=1,this.charIndex=0,this.deleteChar=0),this.nextItem.delay?window.setTimeout(()=>{window.setTimeout(this.updateTypedString(this.deleteInterval,t),this.deleteInterval)},this.backspaceDelay):window.setTimeout(this.updateTypedString(this.deleteInterval,t),this.deleteInterval)}else e===this.PAUSE&&(this.itemIndex+=1,this.charIndex=0,window.setTimeout(()=>{this.animationPaused=!1,window.setTimeout(this.updateTypedString(this.typingInterval,this.newTypedString),this.typingInterval)},this.nextItem.ms),this.animationPaused=!0)}}handleSlotBaseText(){let t=!1;const i=this.el.textContent;return i&&(this.strings=[i],t=!0),t}getNextItem(t){let i;if(this.itemIndex>=t.length)return{direction:this.END};if("string"==typeof(i=t[this.itemIndex]))return{direction:this.FORWARD,string:i};switch(i.type.displayName){case"LineBreak":return{direction:this.LINEBREAK};case"Delete":let t=!1,e=0;return 0===this.deleteChar?(this.deleteChar=e=0===i.props.characters?this.newTypedString.length:i.props.characters,t=!0):this.deleteChar=e=this.deleteChar-1,{delay:t,direction:this.BACKSPACE,chars:e};case"Delay":return{direction:this.PAUSE,ms:i.props.ms};default:throw"Error: Invalid item passed in `strings` props or as children."}}updateTypedString(t,e){return()=>{let s=performance.now();if(0===this.elapsed&&(this.elapsed=s),s>=this.elapsed+t){this.elapsed=s;const t=e.split("•");this.typedString=t.map((e,s)=>i("span",{key:`${this.instanceId}-${s}`},e,t.length-s>1?i("br",null):null))}else window.setTimeout(this.updateTypedString(t,e),t)}}render(){return[i("span",{id:"slot-container"},i("slot",null)),i("span",{class:this.containerCn},this.typedString,i("span",{key:`${this.instanceId}-cur`,class:this.cursorCn},this.animationEnded&&this.hideCursor?"":this.cursorCharacter))]}get el(){return e(this)}static get watchers(){return{cursorBlinkSpeed:["cursorBlinkSpeedHandler"],typedString:["typedStringHandler"]}}static get style(){return":host{--animName:tm-blink;--cursor-blink-speed:800ms}\@keyframes tm-blink{0%{opacity:1}49%{opacity:1}50%{opacity:0}to{opacity:0}}\@-webkit-keyframes tm-blink{0%{opacity:1}49%{opacity:1}50%{opacity:0}to{opacity:0}}.tm-cursor{display:inline-block;-webkit-transform:scale(1.2);transform:scale(1.2);font:inherit;position:relative;font-style:normal!important}.tm-blink{-webkit-animation:var(--animName) var(--cursor-blink-speed) infinite!important;animation:var(--animName) var(--cursor-blink-speed) infinite!important}#slot-container{display:none}"}}export{s as wc_typeme};