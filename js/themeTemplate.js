var themeLayout = function() {
	var that = {};
	var Extend = function(destination, source) { 
	    for (var property in source) { 
	    	if(source[property]===null||source[property]===undefined||source[property]==="")continue;
	        destination[property] = source[property]; 
	    } 
	}; 
	that.prototype={
		init : function(cfg){
			this.setting={
				id:"",
				containerId:"",
				className:"",
				themes:[]   // [theme,theme,theme]
			};
			this.style={
				position:"absolute",
				//display:"none",
				width:"100%",
				height:"100%"
			};
			Extend(this.setting,cfg);
			var ele = this.createDomEle({"name":"div","className":this.setting.className,"id":this.setting.id,"containerId":this.setting.containerId});
			Extend(ele.style,this.style);
			_themes = this.setting.themes;
			if(_themes.length>0){
				for(var t in _themes){
					ele.appendChild(this.careteNewTheme(_themes[t]));
				}
				this.showThemeLayout(_themes[0]);
			}
		},
		createDomEle:function(args){
			var property = {name:"div",className:'',"id":"",containerId:"",attr:{},style:{}};
			Extend(property,args);
			var parent  =  document.getElementById(property.containerId);
			var ele = document.createElement(property.name);
			ele.id = property.id;
			ele.className = property.className;
			ele.containerId = property.containerId;
			Extend(ele,property.attr);
			Extend(ele.style,property.style);
			if(parent){
				parent.appendChild(ele);
			}
			return ele;
		},
		getThemes:function(){
			return this.setting.themes;
		},
		addTheme:function(theme){
			this.setting.themes.put(theme);
		},
		showThemeLayout:function(_t){ //
			document.getElementById(_t.id).style.display = "block";
		},
		hideThemeLayout:function(){  //隐藏
			document.getElementById(_t.id).style.display = "none";
		},
		careteNewTheme:function(theme){  //创建  theme{ id:"","children":[div,div,div] }
			var t = this.createDomEle({name:"div","id":theme.id}); 
			for(var temp in theme.children){
				t.appendChild(this.createDomEle(theme.children[temp]));
			}
			 return t;
		},
		chooseTheme:function(){  //选中
			
		},
		disginTheme:function(contianerId){
			createItem()
			
		},
		/**
		 * type  0 1 2 3 上下左右边框点击
		 * num  生成div的数量
		 */
		Uuid:function() {
		var s = [];
		var hexDigits = "0123456789ABCDEF";
		for ( var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = "-";
		var uuid = s.join("");
		return uuid;
		},
		createItem:function(id ,type ,num){
		    function addPx(val){
		    	return val+"px";
		    }
		    function odd_even_check(val){
		    	return val%2 ==0 ? true:false;
		    }
			var $contianer = $("#"+id);
			var $H = $contianer.height();
			var $W = $contianer.width();
			var _containerId = num==1?id:$contianer[0].containerId; 
			var parent_pos = $contianer.position();    //父元素的位置
			var basicTop = 10;
			var basicleft = 10;
			var marginPx = 0;
			var h = 0;
			var w = 0;
			if(num == 1){ h =$H- basicTop*2; w = $W -basicleft*2 ;}else{				
				h = type%2==0 ? ($H- basicTop*(num-1))/num :$H;
				w = type%2==0 ? $W : ($W-basicleft*(num-1))/num;
			}
			if(num==2){  $contianer.remove(); }
			for ( var int = 1; int <= num; int++) {
				var e_t = 0;   //元素的位置 top
				var e_l = 0;	 //元素的位置 left
				var p_l = 0 ;
				if(num ==1 ){
					e_t = basicTop; e_l = basicleft; 
				}else{
					if(odd_even_check(type)){
						e_l = parent_pos.left;
						e_t = (int-1)*(basicTop+h)+ parent_pos.top ;
					}else{
						e_t = parent_pos.top;
						e_l = (int-1)*(w+basicleft)+ parent_pos.left;
					}
				}
				var ele = this.createDomEle({name:"div",id:this.Uuid(),containerId:_containerId,style:{
					position:"absolute",
					top:addPx(e_t),
					left:addPx(e_l),
					width:addPx(w),
					height:addPx(h)
				}});
				for ( var int2 = 0; int2 < 4; int2++) {
					var iTag =  this.createDomEle({name:"i",containerId:ele.id,id:ele.id+"_i_"+int2,
					attr:{"index":int2},
					style:{
						width:int2%2==0?"100%":"3px",
						height:int2%2==0?"3px":"100%",
						position:"absolute",
						top:int2==0?"0":"",
						right:int2==1?"0":"",
						bottom:int2==2?"0":"",
						left:int2==3?"0":"",
						backgroundColor: "red",
						cursor:"pointer",
						display: "block"
					}});
					var thisObj = this;
					this.bindEvent(iTag, "click", function(){
						that.prototype.createItem(this.containerId,this.index,2);
					});	
				}
				var dragobj = this.createDomEle({name:"i",id:this.Uuid(),containerId:ele.id,style:{
					width:"5px",
						height:"5px",
						position:"absolute",
						right:"0px",
						bottom:"0px",
						backgroundColor: "blue",
						cursor:"move",
						display: "block",
						zIndex: 2
				}});
				that.prototype.lineDragAndResize(dragobj.id);
				
			}	
		},
		praseThemeToJson :function(themeId){ //将模板布局转换为json
			if(!themeId)return;
			var ele  = document.getElementById(themeId);	
			var themeJson =new Object() ;
			themeJson[ele.id] = ele.id;
			themeJson.children = [];
			var childList = ele.childNodes; 
			if(!childList) return;
			for(var i = 0 ;i<childList.length ;i++){
				var t = new Object();
				t["className"] =  childList[i].className;
				t["id"]  = childList[i].id;
				t["attr"] = {};
				t["style"] = {};
				Extend(t["attr"],childList[i].attr);
				Extend(t["style"],childList[i].style);
				themeJson.children.push(t);
				t = null;
			}
			function forArray(){
				
			}
			return JSON.stringify(themeJson);
		},
		fillCont:function(){
			
		},
		lineDragAndResize: function(targetId){
			var confg = {
					posX : 0,     
					posY : 0,
					perX : 0, //初始位置
					perY : 0,
					targetWidth : 0,
					targerHeight : 0,
					setConfg :function(){
						var ele  = arguments[0];
						var e  = arguments[1]? arguments[1] :window.event;
						var pos = $(ele).position();
						this.targetWidth = ele.style.width;
						this.targetHeight = ele.style.height;
						this.perX = parseInt(pos.left);
						this.perY = parseInt(pos.top);
						this.posX = e.clientX;
						this.posY = e.clientY;
					}
			};
			if(!targetId) return;
			var target = document.getElementById(targetId);
			this.bindEvent(target, "mousedown", start);
			function start (ev){
				console.info("start...");
				confg.setConfg(target,ev)
				target.style.cursor = "pointer";
				that.prototype.bindEvent(target, "mouseup", stop);
				that.prototype.bindEvent(target, "mousemove", move);
			}
			function move(ev){
				console.info("move...");
				var event = that.prototype.getEvent(ev);
				target.style.top = event.clientY +"px";
				target.style.left = event.clientX +"px";
			}
			function stop(ev){
				console.info("stop...");
				resize(ev);
				that.prototype.unbindEvent(target,"mousemove");
				that.prototype.unbindEvent(target,"mouseup");
			} 
			function resize(ev){
				var event = that.prototype.getEvent(ev);
				var resizeTarget  = target.parentNode;
				resizeTarget.style.width = (event.clientX - confg.perX) + parseInt(resizeTarget.style.width) +"px";
				resizeTarget.style.height =	(event.clientY - confg.perY) + parseInt(resizeTarget.style.height)  + "px";
 			}
		},
		getEvent: function(ev){
			var e = ev ||window.event;
			return e;
		},
		bindEvent: function(element, e, fn){
			element.addEventListener?element.addEventListener(e,fn,false):element.attachEvent("on" + e,fn); 
		},
		unbindEvent: function(element, e, fn){
			 element.removeEventListener?element.removeEventListener(e,fn,false):element.detachEvent("on" + e,fn);
		}
	};
	return that;
};
