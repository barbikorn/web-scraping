//tealium universal tag - utag.216 ut4.0.201811131409, Copyright 2018 Tealium.com Inc. All Rights Reserved.
var monetateT=new Date().getTime();var monetateQ=monetateQ||[];try{(function(id,loader){var u={"id":id};utag.o[loader].sender[id]=u;if(utag.ut===undefined){utag.ut={};}
var match=/ut\d\.(\d*)\..*/.exec(utag.cfg.v);if(utag.ut.loader===undefined||!match||parseInt(match[1])<41){u.loader=function(o,a,b,c,l,m){utag.DB(o);a=document;if(o.type=="iframe"){m=a.getElementById(o.id);if(m&&m.tagName=="IFRAME"){b=m;}else{b=a.createElement("iframe");}o.attrs=o.attrs||{};utag.ut.merge(o.attrs,{"height":"1","width":"1","style":"display:none"},0);}else if(o.type=="img"){utag.DB("Attach img: "+o.src);b=new Image();}else{b=a.createElement("script");b.language="javascript";b.type="text/javascript";b.async=1;b.charset="utf-8";}if(o.id){b.id=o.id;}for(l in utag.loader.GV(o.attrs)){b.setAttribute(l,o.attrs[l]);}b.setAttribute("src",o.src);if(typeof o.cb=="function"){if(b.addEventListener){b.addEventListener("load",function(){o.cb();},false);}else{b.onreadystatechange=function(){if(this.readyState=="complete"||this.readyState=="loaded"){this.onreadystatechange=null;o.cb();}};}}if(o.type!="img"&&!m){l=o.loc||"head";c=a.getElementsByTagName(l)[0];if(c){utag.DB("Attach to "+l+": "+o.src);if(l=="script"){c.parentNode.insertBefore(b,c);}else{c.appendChild(b);}}}};}else{u.loader=utag.ut.loader;}
if(utag.ut.typeOf===undefined){u.typeOf=function(e){return({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();};}else{u.typeOf=utag.ut.typeOf;}
u.ev={"view":1,"link":1};u.initialized=false;u.scriptrequested=false;u.queue=[];u.map_func=function(arr,obj,item){var i=arr.shift();obj[i]=obj[i]||{};if(arr.length>0){u.map_func(arr,obj[i],item);}else{obj[i]=item;}};u.pollComplete=false;u.forceBoolean=function(flag){if(u.typeOf(flag)==="string"){if(flag==="true"||flag==="1"){return true;}else{return false;}}else if(u.typeOf(flag)=="number"){if(flag!==0){return true;}else{return false;}}else{return flag;}};u.addRows=function(type,name,value){var config={};if(u.data.order_id){config.purchaseId=u.data.order_id;}
config.productId=name;config.quantity="1";config.unitPrice=value;config.currency=u.data.order_currency;monetateQ.push([type,[config]]);}
u.map={};u.extend=[];u.loader_cb=function(a,b,c){utag.DB("send:216:CALLBACK");u.initialized=true;utag.DB("send:216:CALLBACK:COMPLETE");};u.callBack=function(){var data={};while(data=u.queue.shift()){u.data=data.data;u.loader_cb(data.a,data.b,data.c);}};u.send=function(a,b){if(u.ev[a]||u.ev.all!==undefined){utag.DB("send:216");utag.DB(b);var c,d,e,f;u.data={"qsp_delim":"&","kvp_delim":"=","base_url":"//se.monetate.net/js/2/a-e7a83e6a/p/sainsburys.co.uk.shop.gb.groceries/entry.js","set_debug":"","poll_for_element":"false","poll_element":"","product_id":[],"product_sku":[],"product_category":[],"product_quantity":[],"product_unit_price":[],"product_discount":[],"conversion_id":[],"conversion_quantity":[],"conversion_unit_price":[]};utag.DB("send:216:EXTENSIONS");utag.DB(b);c=[];for(d in utag.loader.GV(u.map)){if(b[d]!==undefined&&b[d]!==""){e=u.map[d].split(",");for(f=0;f<e.length;f++){u.map_func(e[f].split("."),u.data,b[d]);}}}
utag.DB("send:216:MAPPINGS");utag.DB(u.data);u.data.order_id=u.data.order_id||b._corder||"";u.data.order_total=u.data.order_total||b._ctotal||"";u.data.order_discount=u.data.order_discount;u.data.order_subtotal=u.data.order_subtotal||b._csubtotal||"";u.data.order_shipping=u.data.order_shipping||b._cship||"";u.data.order_tax=u.data.order_tax||b._ctax||"";u.data.order_currency=u.data.order_currency||b._ccurrency||"";if(u.data.product_id.length===0&&b._cprod!==undefined){u.data.product_id=b._cprod.slice(0);}
if(u.data.product_sku.length===0&&b._csku!==undefined){u.data.product_sku=b._csku.slice(0);}
if(u.data.product_category.length===0&&b._ccat!==undefined){u.data.product_category=b._ccat.slice(0);}
if(u.data.product_quantity.length===0&&b._cquan!==undefined){u.data.product_quantity=b._cquan.slice(0);}
if(u.data.product_unit_price.length===0&&b._cprice!==undefined){u.data.product_unit_price=b._cprice.slice(0);}
if(!u.data.base_url){utag.DB(u.id+": Tag not fired: Required attribute not populated");return;}
if(!u.data.page_type&&u.data.order_id){u.data.page_type="purchase";}
if(u.data.page_type){monetateQ.push(["setPageType",u.data.page_type]);}
if(u.forceBoolean(u.data.poll_for_element)&&!u.forceBoolean(u.pollComplete)){monetateQ.push(["addPollForElement",u.data.poll_element])
u.pollComplete=true;}
if(u.data.breadcrumbs){if(typeof(u.data.breadcrumbs)==="string"){u.data.breadcrumbs=u.data.breadcrumbs.split(",");}
monetateQ.push(["addBreadcrumbs",u.data.breadcrumbs]);}
if(u.data.product_category){monetateQ.push(["addCategories",u.data.product_category]);}
if(u.data.page_type==="index"||u.data.page_type==="search"||u.data.page_type==="category"){monetateQ.push(["addProducts",u.data.product_id]);}
if(u.data.page_type==="product"){monetateQ.push(["addProductDetails",u.data.product_id]);}
if(u.data.variable){var variable_array=[]
for(item_name in u.data.variable){variable_array.push({"name":item_name,"value":u.data.variable[item_name]});}
monetateQ.push(['setCustomVariables',variable_array]);}
if(u.data.page_type==="cart"){if(u.data.product_id.length>0){for(var i=0;i<u.data.product_id.length;i++){var config={};if(u.data.product_id){config.productId=u.data.product_id[i];}
if(u.data.product_quantity){config.quantity=""+u.data.product_quantity[i];}
if(u.data.product_unit_price){config.unitPrice=""+u.data.product_unit_price[i];}
if(u.data.product_sku){config.sku=u.data.product_sku[i];}
if(u.data.order_currency){config.currency=u.data.order_currency;}
monetateQ.push(["addCartRows",[config]]);}
if(u.data.order_discount){u.addRows("addCartRows","_DISCOUNT",""+u.data.order_discount);}
if(u.data.order_tax){u.addRows("addCartRows","_TAX",""+u.data.order_tax);}
if(u.data.order_shipping){u.addRows("addCartRows","_SHIPPING",""+u.data.order_shipping);}
if(u.data.orderData){for(item in u.data.orderData){u.addRows("addCartRows",item,u.data.orderData[item]);}}}else{monetateQ.push(["addCartRows",[]]);}}
if(u.data.page_type==="purchase"||u.data.page_type==="order"){for(var i=0;i<u.data.product_id.length;i++){var config={};if(u.data.order_id){config.purchaseId=u.data.order_id;}
if(u.data.product_id){config.productId=u.data.product_id[i];}
if(u.data.product_quantity){config.quantity=""+u.data.product_quantity[i];}
if(u.data.product_unit_price){config.unitPrice=""+u.data.product_unit_price[i];}
if(u.data.product_sku){config.sku=u.data.product_sku[i];}
if(u.data.order_currency){config.currency=u.data.order_currency;}
monetateQ.push(["addPurchaseRows",[config]]);}
if(u.data.order_discount){u.addRows("addPurchaseRows","_DISCOUNT",""+u.data.order_discount);}
if(u.data.order_tax){u.addRows("addPurchaseRows","_TAX",""+u.data.order_tax);}
if(u.data.order_shipping){u.addRows("addPurchaseRows","_SHIPPING",""+u.data.order_shipping);}
if(u.data.orderData){for(item in u.data.orderData){u.addRows("addPurchaseRows",item,u.data.orderData[item]);}}}
if(u.data.page_type==="conversion"){var conversionConfig=[];if(typeof(u.data.conversion_id)==="string"){u.data.conversion_id=u.data.conversion_id.split(",");}
if(typeof(u.data.conversion_quantity)==="string"){u.data.conversion_quantity=u.data.conversion_quantity.split(",");}
if(typeof(u.data.conversion_unit_price)==="string"){u.data.conversion_unit_price=u.data.conversion_unit_price.split(",");}
for(var i=0;i<u.data.conversion_unit_price.length;i++){var config={};if(u.data.conversion_id){config.itemId=u.data.conversion_id[i];}
if(u.data.conversion_quantity){config.quantity=""+u.data.conversion_quantity[i];}
if(u.data.conversion_unit_price){config.unitPrice=""+u.data.conversion_unit_price[i];}
conversionConfig.push(config);}
monetateQ.push(["addConversionRows",conversionConfig]);}
monetateQ.push(["trackData"]);if(u.data.track_event){monetateQ.push(["trackEvent",[u.data.event_name]]);}
if(u.initialized){u.loader_cb(a,b,c);}else{u.queue.push({"data":u.data,"a":a,"b":b,"c":c});if(!u.scriptrequested){u.scriptrequested=true;u.loader({"type":"script","src":u.data.base_url,"cb":u.callBack,"loc":"script","id":"utag_216","attrs":{}});}}
utag.DB("send:216:COMPLETE");}};utag.o[loader].loader.LOAD(id);}("216","sainsburys.groceries"));}catch(error){utag.DB(error);}
