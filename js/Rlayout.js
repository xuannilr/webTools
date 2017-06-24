(function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "Rlayout requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	var tools = {
		getEvent: function(ev){
			var e = ev ||window.event;
			return e;
		},
		bindEvent: function(element, e, fn){
			element.addEventListener?element.addEventListener(e,fn,false):element.attachEvent("on" + e,fn); 
		},
		unbindEvent: function(element, e, fn){
			 element.removeEventListener?element.removeEventListener(e,fn,false):element.detachEvent("on" + e,fn);
		},
		extend : function(destination, source) { 
		    for (var property in source) { 
		    	if(source[property]===null||source[property]===undefined||source[property]==="")continue;
		        destination[property] = source[property]; 
		    } 
		},
		addPx : function (val){
	    	if(val === "undefined"){throw new Error( "val must definiting" );}
			return val+"px";
	    },
	    odd_even_check : function (val){
	    	return val%2 ==0 ? true:false;
	    },
	    Uuid : function() {
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
		percentage : function(number1, number2) { 
		    return (Math.round(number1 / number2 * 10000) / 100.00 + "%");// 小数点后两位百分比
		   
		},
		getEleId:function(eleId){
			return document.getElementById(eleId);
		},
		collection :{
				HashMap : function() {
					return {
						collection : new Array(),
						put : function(key, value) {
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								var option = c[i];
								if (option.key == key) {
									c.splice(i, 1);
									break;
								}
							}
							var option = new Object();
							option.key = key;
							option.value = value;
							c.push(option);
						},
						get : function(key) {
							var resultObj = null;
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								var option = c[i];
								if (option.key == key) {
									resultObj = option.value;
									break;
								}
							}
							return resultObj;
						},
						keyArray : function() {
							var keyArray = new Array();
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								var option = c[i];
								keyArray.push(option.key);
							}
							return keyArray;
						},
						valueArray : function() {
							var valueArray = new Array();
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								var option = c[i];
								valueArray.push(option.value);
							}
							return valueArray;
						},
						remove : function(key) {
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								var option = c[i];
								if (option.key == key) {
									this.collection.splice(i, 1);
									break;
								}
							}
						},
						containsKey : function(key) {
							var isContainsKey = false;
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								if (option.key == key) {
									isContainsKey = true;
									break;
								}
							}
							return isContainsKey;
						},
						isEmpty : function() {
							return this.collection.length == 0;
						},
						size : function() {
							return this.collection.length;
						},
						toJsonString : function() {
							var jsonArray = new Array();
							var c = this.collection;
							for ( var i = 0; i < c.length; i += 1) {
								var option = c[i];
								jsonArray[i] = option;
							}
							return JSON.stringify(jsonArray);
						}
					};
				},
				createList : function() {
				},
				createSet : function() {
					return{
						set:items={},
						has:function(value) {
							 // hasOwnProperty的问题在于
							 // 它是一个方法，所以可能会被覆写
							 return items.hasOwnProperty(value);
							},
						add:function(value) {
								 //先检测元素是否存在。
								 if (!this.has(value)) {
								  items[value] = value;
								  return true;
								 }
								 //如果元素已存在则返回false
								 return false;
								}
					};
				}
			}
	};
	var dataNode = function(id,parentId,bortherIds){
		this.id = id;
		this.parentId = parentId;
		this.bortherIds = bortherIds;
		this.isRoot = false;
	};
	dataNode.fn = dataNode.prototype;
	dataNode.fn.getParent = function(){
		return tools.getEleId(this.parentId);
	};
	dataNode.fn.getBorther = function(){
		var bortherNodes = new Array();
		var i = 0 ,len = this.bortherIds.length;
		for(;i< len;i++){
			if(this.bortherIds[i] == this.id){
				continue;
			}
			bortherNodes.push(tools.getEleId(bortherIds[i]));
		}
		return bortherNodes;
	};
	dataNode.fn.setRoot = function(){
		this.root = true; 
	};
		
	var Rlayout = {
			attrubites:{
				rootChildren:[],
				rootId:"",
				data:tools.collection.HashMap(),
				index:0,
				length:0
			},
			confg:{
				marginPx:10
			},
			init : function(cfg){
				this.setting={
					id:"",
					containerId:"",
					className:"",
					themes:[]   // [theme,theme,theme]
				};
				this.style={
					position:"absolute",
					width:"100%",
					height:"100%"
				};
				tools.extend(this.setting,cfg);
				var ele = this.createDomEle({"name":"div","className":this.setting.className,"id":this.setting.id,"containerId":this.setting.containerId});
				tools.extend(ele.style,this.style);
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
				tools.extend(property,args);
				var parent  =  document.getElementById(property.containerId);
				var ele = document.createElement(property.name);
				ele.id = property.id;
				ele.className = property.className;
				ele.containerId = property.containerId;
				tools.extend(ele,property.attr);
				tools.extend(ele.style,property.style);
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
				createItem();
			},
			createSiGongGe : function(_containerId,row,col,isRoot){
				if(isRoot) {
					Rlayout.attrubites.data.rootId = _containerId;
					this.createDomEle({
						id:_containerId+"_iTagDragY",
						containerId:_containerId,
						className:"iTagDragY"
					});
					this.createDomEle({
						id:_containerId+"_iTagDragX",
						containerId:_containerId,
						className:"iTagDragX"
					});
				}
				var gongGeNum = row*col , i = 0,k = 0;
				//var _w = tools.percentage(1, col) , _h = tools.percentage(1, row); //TODO
				var _w = ($("#"+_containerId).width()-(col+1)*this.confg.marginPx)/col , _h = ($("#"+_containerId).height()-(row+2)*this.confg.marginPx)/row; //TODO
				var style = {
					width:_w,
					height:_h
				};
				var borthers = [];
				var _t = 0 , _l  = 0 ,marginPx = 0;
				for(; i<row ;i++ ){
					this.attrubites.rootChildren[i]  = new Array();
					for (var j = 0 ;j <col ;j++) {
						var _id = tools.Uuid();
						borthers.push(_id);
						this.attrubites.rootChildren[i][j] = _id;
						var node = new dataNode(_id,_containerId,borthers);
						this.attrubites.data.put(_id,node);
						var ele = this.createDomEle({
							id:_id,
							containerId:_containerId,
							className:"item",
							style:style,
							attr:{index:i+"_"+j,isRootChild:true,deep:0}
						});
						k++;
						_t = i*_h+(this.confg.marginPx*(i+1));
						_l = j *_w+(this.confg.marginPx*(j+1));
						$(ele).css({
							top:_t,
							left: _l,
							width:_w,
							height:_h
						});
						$(ele).append("<span class='del-item' >x</span><div class='item-content'></div>");
						tools.bindEvent(ele, "click", function(){
							$(".itemSelected").each(function(){
								$(this).removeClass("itemSelected");
								$(".del-item",this).hide();
								$(".del-item",this).unbind();
							});
							$(this).addClass("itemSelected");
							$(".del-item",this).show();
							var that = this;
							$(".del-item",this).unbind().bind('click',function(){
								Rlayout.deleteItem(that.id);
							});
						});
						this.create_iTags(_id);
					}
					
				}
			},
			/**
			 * type  0 1 2 3 上下左右边框点击
			 */
			createItem:function(id ,type){
			    var _row = 1 , _col = 1 , num = 2;
				if(tools.odd_even_check(type)){
					_col  = num;
				} else {
					_row  = num ;
				}
				//销毁iTag
				$(".iTag","#"+id).each(function(i){
					$(this).remove();
				});			
				Rlayout.createSiGongGe(id, _row, _col);
			},
			create_iTags :function(_containerId){
				var borders = ["border-top","border-right","border-bottom","border-left"];
				for ( var int2 = 0; int2 < 4; int2++) {
					var iTag =  this.createDomEle({name:"i",containerId:_containerId,id:_containerId+"_i_"+int2,className:"iTag",
					attr:{"index":int2},
					style:{
						width:int2%2==0?"100%":"0px",    //TODO 3px
						height:int2%2==0?"0px":"100%",   //TODO 3px
						position:"absolute",
						top:int2==0?"0":"",
						right:int2==1?"0":"",
						bottom:int2==2?"0":"",
						left:int2==3?"0":"",
						cursor:"move",
						display: "block"
					}
					});
					$(iTag).css(borders[int2],"3px dashed red");
//					tools.bindEvent(iTag, "click", function(){
//						Rlayout.createItem(this.containerId,this.index,2);
//					});	
					tools.bindEvent(iTag, "mousedown", function(ev){
						Rlayout.lineDrag.lineDragStart(this.containerId, this.index,ev);
					});	
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
					tools.extend(t["attr"],childList[i].attr);
					tools.extend(t["style"],childList[i].style);
					themeJson.children.push(t);
					t = null;
				}
				function forArray(){
					
				}
				return JSON.stringify(themeJson);
			},
			fillCont:function(){
				
			},
			deleteItem:function(_containerId){
				var $target = tools.getEleId(_containerId);
				if($target.isRootChild){
					var r_c = $target.index;
					var __r = 0, __c = 0;
					alert("元素自动填充默认是右边元素");
					if(r_c){
						__r = parseInt(r_c.split("_")[0]);
						__c = parseInt(r_c.split("_")[1]);
					}
					var f = 0;  // 0 右元素 , 1 下元素 , 左元素
					if(__c+1>=Rlayout.attrubites.rootChildren[0].length){
						if(__r+1>=Rlayout.attrubites.rootChildren.length){
							__c--;
							f = 2; 
						}else{
							__r++;
							f = 1; 
						}
					}else{
						__c++;
						f = 0; 
					}
					var relateEle  = Rlayout.attrubites.rootChildren[__r][__c];
					if(f==0){
						__c--
						$("#"+relateEle).css({"width":$("#"+relateEle).width()+$($target).width()+Rlayout.confg.marginPx,
						"left":$("#"+relateEle).position().left - $($target).width()-Rlayout.confg.marginPx});
					}else if(f==1){
						__r--;
						$("#"+relateEle).css({"height":$("#"+relateEle).height()+$($target).height()+Rlayout.confg.marginPx,
						"top":$("#"+relateEle).position().top - $($target).height()-Rlayout.confg.marginPx});
					}else if(f==2){
						__c++;
						$("#"+relateEle).css({"width":$("#"+relateEle).width()+$($target).width()+Rlayout.confg.marginPx});
					}
					Rlayout.attrubites.rootChildren[__r][__c] = relateEle;
					$($target).remove();
				}else{
					var dataNode = Rlayout.attrubites.data.get(_containerId);
					var borther = dataNode.getBorther()[0];
					
				}
			},
			lineDrag:{
				lineData:{
					ismousedown:false,
					dropFlag : false,					
					rootPos : {left:0,right:0,top:0,bottom:0},
					original:[],
					lineDragObj:{},
					target:"",
					dragDir :0      //拖拽的方向
				},
				getTagDrag :function(type){
					 return tools.getEleId(Rlayout.attrubites.data.rootId+"_iTagDrag"+type);
				},
				/**
				 * 
				 * @param targetId   //目标div的Id
				 * @param flag		// 是否改变同级大小   	
				 */
				lineDragStart: function(containerId,flag,ev){
					Rlayout.lineDrag.lineData.ismousedown = true;
					var e = tools.getEvent(ev);
					var op = e.target||e.srcElement;
					var type = op.index;
					var _containerId = op.containerId;
					this.lineData.target = _containerId;
					this.lineData.original[0] = e.clientX;
					this.lineData.original[1] = e.clientY;
					this.lineData.dragDir = type;
					$(op).css("move","move");
					if(tools.odd_even_check(op.index)){
						this.down(ev,_containerId,type);
					}else{
						this.right(ev,_containerId,type);
					}
					this.lineData.ismousedown = true;
					tools.bindEvent(document, "mousemove", this.lineDragMove);
					tools.bindEvent(document, "mouseup",  this.lineDragEnd);
					
				},
				lineDragMove: function(ev){
					var e  = tools.getEvent(ev);
					var posX = e.clientX;
					var posY = e.clientY;
					var lineOffset = $(Rlayout.lineDrag.lineData.lineDragObj).offset();
					if(Rlayout.lineDrag.lineData.ismousedown){
						if(Rlayout.lineDrag.lineData.lineDragObj.className =="iTagDragY"){
							$(Rlayout.lineDrag.lineData.lineDragObj).css({
								"left":posX
							});
						} else {
							$(Rlayout.lineDrag.lineData.lineDragObj).css({
								"top":posY
							});
						}
						//Rlayout.lineDrag.resize(ev);
					}
								
				},
				lineDragEnd: function(ev){
					Rlayout.lineDrag.lineData.ismousedown = false;
					$(Rlayout.lineDrag.lineData.lineDragObj).css({"display":"none"});
					Rlayout.lineDrag.resize(ev);
					tools.unbindEvent(document, "mousemove",  Rlayout.lineDrag.lineDragMove);
					tools.unbindEvent(document, "mouseup",  Rlayout.lineDrag.lineDragEnd);
				},
				down : function(e,_containerId,type){ 
			    	var offset = $("#"+_containerId).offset();
			    	var dragObj  = this.getTagDrag(tools.odd_even_check(type)?"X":"Y");
			    	var _w = $("#"+_containerId).width() ,_h = $("#"+_containerId).height();
			    	var _t = 0;
			    	this.lineData.lineDragObj = dragObj;
			    	if(type==2){
			    		_t = _h - 2;
			    	}
			    	$(dragObj).css({
			    		"display":"block",
			    		"width":_w,
			    		"top":offset.top + _t -8,
			    		"left":offset.left -8
			    	}); 
			    }, 
			    right : function(e,_containerId,type){
			    	var offset = $("#"+_containerId).offset();
			    	var dragObj  = this.getTagDrag(tools.odd_even_check(type)?"X":"Y");
			    	var _w = $("#"+_containerId).width(),_h = $("#"+_containerId).height();
			    	var _l = 0 ;
			    	this.lineData.lineDragObj = dragObj;
			    	if (type == 1){
			    		_l = _w -2;
			    	}
			    	$(dragObj).css({
			    		"display":"block",
			    		"height":_h,
			    		"top":offset.top-8,
			    		"left":offset.left+_l-8
			    	});
			    	
			    },
				resize:function(e){
					var ev  =  tools.getEvent(e);
					var movePx = 0;
					var dir = Rlayout.lineDrag.lineData.dragDir;  // 0 鼠标上下移动  1 鼠标左右移动
					var oldHW = 0;
					var newHW = 0;
					var r_c = tools.getEleId(Rlayout.lineDrag.lineData.target).index;
					var relateEle = "";
					var $target = $("#"+Rlayout.lineDrag.lineData.target);
					var __r = 0 ,__c = 0;
					if(r_c){
						__r = parseInt(r_c.split("_")[0]);
						__c = parseInt(r_c.split("_")[1]);
					}
					if(dir == 0){
						__r--;
					}else if(dir == 1){
						__c++;
					}else if(dir == 2){
						__r++;
					}else if(dir == 3){
						__c--;
					}
					if(__r<0||__c<0||__r>=Rlayout.attrubites.rootChildren.length||__c>=Rlayout.attrubites.rootChildren[0].length){return;}
					relateEle = Rlayout.attrubites.rootChildren[__r][__c];
					var $relateEle = $("#"+relateEle);
					if(Rlayout.lineDrag.lineData.lineDragObj.className =="iTagDragY"){
						movePx =  ev.clientX - Rlayout.lineDrag.lineData.original[0] ;
						oldHW = $target.width();
					}else{
						movePx =  ev.clientY - Rlayout.lineDrag.lineData.original[1];
						oldHW = $target.height();
					}
					if(dir== 0 ||dir == 3){
						newHW = oldHW - movePx;
					}else{
						newHW = oldHW + movePx;
					}
					console.info("dir-->"+ dir +"  movePx>0: "+movePx);
					if(dir == 0){
						$target.css({"height":newHW,"top":$target.position().top+movePx});  // t
						$relateEle.css({"height":$relateEle.height()+movePx});
					}else if(dir == 1){  // r
						$target.css({"width":newHW});
						$relateEle.css({"width":$relateEle.width()-movePx,"left":$relateEle.position().left+movePx});
					}else if(dir == 2){  // r
						$target.css({"height":newHW});
						$relateEle.css({"height":$relateEle.height()-movePx,"top":$relateEle.position().top+movePx});
					}else if(dir == 3){ //  t
						$target.css({"width":newHW,"left":$target.position().left+movePx});
						$relateEle.css({"width":$relateEle.width()+movePx});
					}

				}
			}
		};

	if ( typeof noGlobal ===  typeof undefined ) {
		window.Rlayout = Rlayout;
	}
	return Rlayout;
}));