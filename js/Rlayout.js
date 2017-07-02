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
		// 防止事件冒泡
		stoppro : function (e){
			e = e||window.event;
			if(e.stopPropagation){
				e.stopPropagation();
			}else{
				e.cancelBubble=true;
			}
		},
		extend : function(destination, source) { 
		    for (var property in source) { 
		    	if(source[property]===null||source[property]===undefined||source[property]==="")continue;
		        destination[property] = source[property]; 
		    } 
		},
		isArray:Array.isArray,
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
			bortherNodes.push(tools.getEleId(this.bortherIds[i]));
		}
		return bortherNodes;
	};
	dataNode.fn.setRoot = function(){
		this.root = true; 
	};
	var theme = function (id,width,height,top,left,index,children){
		this.id = id;
		this.width = width;
		this.height = height;
		this.top = top;
		this.left = left;
		this.index = index;
		this.children = children; 
	};
	theme.prototype.updateCss  = function(_w,_h,_t,_l){
		this.width = _w;
		this.height = _h;
		this.top = _t;
		this.left = _l;
	};
	var Rlayout = {
			attrubites:{
				rootId : "",
				rootChildren : [],     //保存直接子节点    n root   
				data : tools.collection.HashMap(),   //所有节点以map  形式保存   id - dataNode
				addIconId : "iTagAddIcon",   
				themesLayout : [],   //所有节点json
				selected:"",
				index : 0,
				row : 0,
				col : 0,
				length : 0
			},
			confg:{
				marginPx : 5,
				imgsrc :rootPath+"/js/plugin/rLayout/img/"
			},
			init : function(_containerId,themes,isEdit,hasDrag){
				if(!hasDrag){
					Rlayout.attrubites.rootId = _containerId;
					Rlayout.attrubites.rootChildren = [];
				}
				var hasChild  = false;
				var childrenThemes = [];
				if(themes&&themes.length>0){
					for ( var i = 0 ,len = themes.length ;i < len ; i++) {
						var the = themes[i];
						var  style = {
							position : "absolute",
							top : tools.addPx(the.top),
							left : tools.addPx(the.left),
							width :the.width ,
							height : the.height
						};
						if(the.children&&the.children.length>0){
							hasChild  = true;
						}
						var ele = this.createDomEle({
							id:the.id,
							className:'r-item',
							containerId:_containerId,
							attr:{
								index: the.index,
								isRootChild:hasChild
							}
						});
						$(ele).css(style);
						
						if(the.index &&!hasDrag){
							var row = parseInt(the.index.split("_")[0]);
							var col = parseInt(the.index.split("_")[1]);
							if(!tools.isArray(Rlayout.attrubites.rootChildren[row])){
								Rlayout.attrubites.rootChildren[row] = [];
							}
							Rlayout.attrubites.rootChildren[row][col] = ele.id;
							Rlayout.attrubites.themesLayout.push(new theme(the.id,the.width,the.height,the.top,the.left,the.index));
						}else{
							childrenThemes.push(new theme(the.id,the.width,the.height,the.top,the.left,the.index));
						}	
						if(isEdit){
							$(ele).append("<span class='del-item' >x</span><div class='item-content'><img class='addData' src='"+Rlayout.confg.imgsrc+"add_data.png"+"'></div>");
							tools.bindEvent(ele, "click", function(e){
								Rlayout.handleClick.call(this,e);
							});
							if(!the.children){
								this.create_iTags(ele.id);
							}
						}
						if(hasChild){
							Rlayout.init(ele.id, the.children, isEdit,true);
						}
					}	
					if(!hasDrag){
						this.createDragLine(_containerId);
					}	
				} 
				if(childrenThemes.length>0){
					Rlayout.getTheme(_containerId).children = childrenThemes;
					var borther = [];
					for(var o in childrenThemes){
						borther[o] = childrenThemes[o].id;
						Rlayout.attrubites.data.put(childrenThemes[o].id,new dataNode(childrenThemes[o].id,_containerId,borther)); 
					}
				}
			},
			createDomEle : function(args){
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
			getLayoutThemes : function(){
				return this.attrubites.themesLayout;
			},
			getTheme : function(_id){
				var themes = this.attrubites.themesLayout ;
				var i = 0 , len = themes.length;
				if(themes){
					for( ;i<len ; i++){
						if(themes[i].id == _id) break;
					}
				}
				return themes[i];
			},
			praseThemeToJson :function(){ //将模板布局转换为json
				return JSON.stringify(this.attrubites.themesLayout);
			},
			fillCont:function(e){
			},
			createDragLine : function (_containerId){
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
				$("#"+_containerId).append("<div class='item-add-icon' id='"+this.attrubites.addIconId+"'><img ></div>");
			},
			createSiGongGe : function(_containerId,row,col,isRoot){
				this.createDragLine(_containerId);
				Rlayout.attrubites.rootId = _containerId;
				Rlayout.attrubites.row = row;
				Rlayout.attrubites.col = col;
				var gongGeNum = row*col , i = 0,k = 0;
				var _w = ($("#"+_containerId).width()-(col+1)*this.confg.marginPx)/col ,   
					_h = ($("#"+_containerId).height()-(row+2)*this.confg.marginPx)/row; 
//				 _w = tools.percentage(_w, ($("#"+_containerId).width())) , //TODO
//				 _h = tools.percentage(_h, ($("#"+_containerId).height())); //TODO
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
							className:"r-item",
							style:style,
							attr:{index:i+"_"+j,isRootChild:true,deep:0}
						});
						k++;
						_t = i*_h + (this.confg.marginPx*(i+1));
						_l = j *_w + (this.confg.marginPx*(j+1));
						$(ele).css({
							top : _t,
							left : _l,
							width : _w,
							height : _h
						});
						this.attrubites.themesLayout.push(new theme(_id,_w,_h,_t,_l,i+"_"+j));
						$(ele).append("<span class='del-item' >x</span><div class='item-content'><img class='addData' src='"+Rlayout.confg.imgsrc+"add_data.png"+"'></div>");
						tools.bindEvent(ele, "click", function(e){
							Rlayout.handleClick.call(this,e);
						});
						this.create_iTags(_id);
					}
					
				}
			},
			handleClick : function(e){
				tools.stoppro(e);
				$(".itemSelected").each(function(){
					$(this).removeClass("itemSelected");
					$(".del-item",this).hide();
					$(".del-item",this).unbind();
				});
				$(this).addClass("itemSelected");
				Rlayout.attrubites.selected = this.id;
				$(".del-item",this).show();
				var that = this;
				$(".del-item",this).unbind().bind('click',function(){
					Rlayout.deleteItem(that.id);
				});
				if($(".div-css", this)&&$(".div-css", this).length<=0){
					$(".addData",this).show();
				}
				var that = this;
				$(".addData",this).unbind().bind('click',function(){
					JsUtil.asyn.post(rootPath+"/Portal/IcpPortalManager?method=addControl", null, function(jsp){
						var win = JsUtil.popUp.MiddlePopUp("选择控件");
						win.setContent(jsp);
						win.open();
						$(".addData",that).hide();
					}, null);
				});
			
			},
			createItem : function(id ,type){								
				var row = 1 , col = 1 , num = 2 ,_containerId = id ,i = 1 ,k = 0 ,XY = "";
				var _w = "100%" ,
					_h = "100%"; //TODO
				if(tools.odd_even_check(type)){
					row  = num ;
					_h = ($("#"+_containerId).height()-(row-1)*this.confg.marginPx)/row;
					XY = "Y";
				} else {
					col  = num;
					_w = ($("#"+_containerId).width()-(col-1)*this.confg.marginPx)/col;
					XY = "X";
					
				}
				if(!$("#"+_containerId)[0].isRootChild){			
					alert("当前单元格不能拆分");
					return;
				}
				$(".del-item","#"+_containerId).unbind();	
				//销毁iTag
				$("#"+_containerId).empty();
				var style = {
					width:_w,
					height:_h
				};
				var borthers = [];
				var children = [];
				var _t = 0 , _l  = 0 ,marginPx = 0;
				for(; i<=row ;i++ ){
					for (var j = 1 ;j <=col ;j++) {
						var _id = tools.Uuid();
						borthers.push(_id);
						var node = new dataNode(_id,_containerId,borthers);
						this.attrubites.data.put(_id,node);
						var ele = this.createDomEle({
							id:_id,
							containerId:_containerId,
							className:"r-item",
							style:style,
							attr:{
								index:i+"_"+j,
								XY:XY,
								isRootChild:false,
								deep:1
							}
						});
						if(tools.odd_even_check(type)){
							_t = (i-1)*_h + (this.confg.marginPx*(i-1));
							style.top = _t;
						} else {
							_l = (j-1) *_w + (this.confg.marginPx*(j-1));
							style.left = _l;
						}
						children.push(new theme(_id,_w,_h,_t,_l,i+"_"+j));
						$(ele).css(style);
						$(ele).append("<span class='del-item' >x</span><div class='item-content'><img class='addData' src='"+Rlayout.confg.imgsrc+"add_data.png"+"'></div>");
						tools.bindEvent(ele, "click", function(e){
							Rlayout.handleClick.call(this,e);
						});
						this.create_iTags(_id);
					}
				}
				Rlayout.getTheme(_containerId).children = children;	
			},
			showAddItem : function (){
				tools.stoppro(ev);
				var ev = tools.getEvent(arguments[0]);
				var _con = this.containerId;
				var type  = this.index;
				var thatOffset = $("#"+_con).offset();
				var addItemIcon =  tools.getEleId(Rlayout.attrubites.addIconId);
				var bgImg = ["down.png","left.png","up.png","right.png"];
				var sty = {"display":"block"};
				var _w = $("#"+_con).width(),_h  = $("#"+_con).height();
				$(addItemIcon).css({
					"display":"block",
					"top":ev.clientY - 96 -40 - 20,
					"left":ev.clientX -60 
				});
				sty = null;
				$("img",addItemIcon)[0].src = Rlayout.confg.imgsrc + bgImg[type];
				$("img",addItemIcon).unbind().bind("click",function(ev){
					tools.stoppro(ev);
					$(addItemIcon).hide();
					Rlayout.createItem(_con, type);
				});
			},
			create_iTags :function(_containerId){
				var borders = ["border-top","border-right","border-bottom","border-left"];
				for ( var int2 = 0; int2 < 4; int2++) {
					var iTag =  this.createDomEle({name:"i",containerId:_containerId,id:_containerId+"_i_"+int2,className:"iTag",
					attr:{"index":int2},
					style:{
						width:int2%2==0?"100%":"3px",    //TODO 3px
						height:int2%2==0?"3px":"100%",   //TODO 3px
						position:"absolute",
						top:int2==0?"0":"",
						right:int2==1?"0":"",
						bottom:int2==2?"0":"",
						left:int2==3?"0":"",
						cursor:"move",
						display: "block"
					}
					});
					$(iTag).css(borders[int2],"1px dashed red");
					tools.bindEvent(iTag, "mouseover", function(e){
						Rlayout.showAddItem.apply(this,arguments);
					});	
					tools.bindEvent(iTag, "mousedown", function(ev){
						Rlayout.lineDrag.lineDragStart(this.containerId, this.index,ev);
					});	
				}
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
						__c--;
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
					if(borther){
						$(borther).css({"width":"100%","height":"100%","top":"0","left":"0"});
					}else{
						
					}
					$($target).remove();
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
					console.info('--->'+Rlayout.attrubites.rootId+"_iTagDrag"+type);
					 return tools.getEleId(Rlayout.attrubites.rootId+"_iTagDrag"+type);
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
					var posX = e.clientX  - 60 - 20;
					var posY = e.clientY - 96 - 38-30;
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
					}				
				},
				lineDragEnd: function(ev){	
					$(Rlayout.lineDrag.lineData.lineDragObj).css({"display":"none"});
					if(Rlayout.lineDrag.lineData.ismousedown){
						Rlayout.lineDrag.resize(ev);
					}
					Rlayout.lineDrag.lineData.ismousedown = false;
					tools.unbindEvent(document, "mousemove",  Rlayout.lineDrag.lineDragMove);
					tools.unbindEvent(document, "mouseup",  Rlayout.lineDrag.lineDragEnd);
				},
				down : function(e,_containerId,type){ 
			    	var offset = $("#"+_containerId).position();
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
			    		"top":offset.top + _t,
			    		"left":offset.left
			    	}); 
			    }, 
			    right : function(e,_containerId,type){
			    	var offset = $("#"+_containerId).position();
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
			    		"top":offset.top,
			    		"left":offset.left+_l
			    	});	
			    },
				resize:function(e){
					var ev  =  tools.getEvent(e);
					var movePx = 0;
					var dir = Rlayout.lineDrag.lineData.dragDir;  // 0 鼠标上下移动  1 鼠标左右移动
					var oldHW = 0;
					var newHW = 0;
					var $target = $("#"+Rlayout.lineDrag.lineData.target);
					var relateEle = "";
					var $relateEle ;
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
					if($target[0].isRootChild){
						var __r = 0 ,__c = 0;
						var r_c = tools.getEleId(Rlayout.lineDrag.lineData.target).index;
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
						$relateEle = $("#"+relateEle);
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
					}else{
						var dataNode = Rlayout.attrubites.data.get($target[0].id);
						$relateEle = $(dataNode.getBorther()[0]);
						var xy = dataNode.getBorther()[0].XY;
						if(dir == 0){  // t
							if(xy!=="Y"||$target[0].index!='2_1'){return;}
							$target.css({"height":newHW,"top":$target.position().top+movePx}); 
							$relateEle.css({"height":$relateEle.height()+movePx});
						}else if(dir == 1){  // r
							if(xy!=="X"||$target[0].index!='1_1'){return;}
							$target.css({"width":newHW});
							$relateEle.css({"width":$relateEle.width()-movePx,"left":$relateEle.position().left+movePx});
						}else if(dir == 2 ){  // r
							if(xy!=="Y"||$target[0].index!='1_1'){return;}
							$target.css({"height":newHW});
							$relateEle.css({"height":$relateEle.height()-movePx,"top":$relateEle.position().top+movePx});
						}else if(dir == 3){ //  t
							if(xy!=="X"||$target[0].index!='1_2'){return;}
							$target.css({"width":newHW,"left":$target.position().left+movePx});
							$relateEle.css({"width":$relateEle.width()+movePx});
						}
					}	
					Rlayout.getTheme(Rlayout.lineDrag.lineData.target).updateCss($target.width(),$target.height(),$target.position().top,$target.position().left);
					if($relateEle&&$relateEle.length>0){
						Rlayout.getTheme($relateEle[0].id).updateCss($relateEle.width(),$relateEle.height(),$relateEle.position().top,$relateEle.position().left);
					}
				}
			}
		};
	if ( typeof noGlobal ===  typeof undefined ) {
		window.Rlayout = Rlayout;
	}
	return Rlayout;
}));
