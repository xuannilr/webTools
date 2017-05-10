var tab = {
	setting:{
		id:"",
		containerId:"",
		className:"tabs",
		tabHead:[],
		tabBody:[]
	},
    extendsSetting: function(obj1,obj2){
		for(var key in obj2 ){
			if(obj2[key])obj1[key] = obj2[key];
		}
    },
	createDomElement:function(tag){
		var thisSetting  ={};
		thisSetting = extendsSetting(thisSetting ,tag);
		var ele = document.createElement(thisSetting.name);
		ele.id =  thisSetting.id;
		ele.className = thisSetting.classname;
		return ele;
	},
	initTabs :function(setting){
		createTab(setting);
	},
	createTab:function(setting){
		var tab = this.createDomElement({tagName:"div",className:"tabs",id:""});
		var tabHeader = this.createDomElement({tagName:"div",className:"tab_head"});
		var tabBody = this.createDomElement({tagName:"div",className:"tab_body"});
		var tabResize = this.createDomElement({tagName:"div",className:"tab_resize"});
		tab.appendChild(tabHeader);
		tab.appendChild(tabBody);
		tab.appendChild(tabResize);
		return tab;
	},
	createHeader:function(heads){
		var tabHeader = this.createDomElement({tagName:"div",className:"tab_head"});
		for(var i = 0;i<heads.length ; i++ ){
			var head = createDomElement({tagName:"a"});
			head.innerHTML = title;
			head.id = "head_"+i;
			head.onClick = switchTab(head);
			tabHeader.appendChild(head);
		}
		return tabHeader;
	},
	createBody:function(bodies){
		
		if(bodies){
			
		}
		for()
		var body  = this.createDomElement({tagName:"div"});
		body.id = "";
		return body;
		
	},
	createResize:function(){
		
	},
	getTabHead:function(){
		
	},
	getTabBody:function(){
		
	},
	refreshTabBody:function(){
		
	},
	closeTab:function(){
		
	},
	moreTabs:function(){
		
	},
	switchTab:function(header){
		
	},
	loadTabContent:function(){
		
	}
	
}
