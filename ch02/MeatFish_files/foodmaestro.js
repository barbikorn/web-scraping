/**
*  foodmaestro.js Version 1.2.0
*  Copyright (C) 2017  FoodMaestro Limited
* 
*  The JavaScript code in this page is licensed to FoodMaestro Ltd.
*  You may not distribute or modify this code in any format without  
*  prior consent from FoodMaestro Ltd.
*
*  The code is distributed WITHOUT ANY WARRANTY;
*  without even the implied warranty of MERCHANTABILITY or FITNESS
*  FOR A PARTICULAR PURPOSE.
*
**/

var foodmaestro = new function() {
	
	//-- Global vars
	var servicebaseurl = "http://localhost:3000/api";
	var suitabilityIndicator= ".FM_suitability_indicator"; //Default for the suitability indicator
	var nutritionValuesContainer = ".fm-nutrition-value"; //Default for the nutrition info
	var is_authenticated = false;
    var accesskey = ""; //this is the api key to identify the tenant
    var JWTToken = "";
	var uuid = "";
	var profiles = [];

	//Set the service base url for the api endpoints
	this.setServiceBaseUrl = function(url){
		servicebaseurl = url;
    };
    
    //Set the JWT token for the user
    this.setJWTToken = function(token){
        JWTToken = token;
    };

    //Private Method to get the JWT Token 
    function getJWTToken (){
        return typeof JWTToken === "function" ? JWTToken() : JWTToken;
    };

	//Set the jquery class name of the suitability container that should have the info
	//This will be where the HTML lives when the render is returned.
	//Exmaple ".FM_suitability_indicator"
	this.setSuitabilityIndicator = function(indicator){
		suitabilityIndicator = indicator;
	};

	//Get the name of the jQuery class of the suitability container
	//This will be where the HTML lives when the render is returned.
	//Exmaple ".FM_suitability_indicator"
	this.getSuitabilityIndicator = function(){
		return suitabilityIndicator;
	};

	//Set the jquery class name of the suitability container that should have the info
	//This will be where the HTML lives when the render is returned.
	//Exmaple ".fm-nutrition-value"
	this.setNutritionValuesContainer = function(nutritionContainer){
		nutritionValuesContainer = nutritionContainer;
	};

	//Get the name of the jQuery class of the suitability container
	//This will be where the HTML lives when the render is returned.
	//Exmaple ".fm-nutrition-value"
	this.getNutritionValuesContainer= function(){
		return nutritionValuesContainer;
	};

	//Get the array of profiles
	//This will be stall unless you call the authenticate method
	this.getProfiles = function(){
		return profiles;
	};
	
	//-- Authentication method
	//Render call back needs to take one parameter for the profiles
    this.authenticate = function (fm_access_key, uuid_hash, renderCallback, errorCallback) {
		
		//reset from previous session
		is_authenticated = false;
		accesskey = "";
		uuid = "";
		
		//basic checks
        var msg = "";
        var ajaxRequest = {};
        if(!getJWTToken()) {
            if ($.trim(uuid_hash) === "") { 
                if (errorCallback) { errorCallback("Unique User Identifier cannot be empty!"); } else { console.error("Unique User Identifier cannot be empty!"); } 
                return;
            }
            if ($.trim(fm_access_key) === "") { 
                if (errorCallback) { errorCallback("Access key cannot be empty!"); } else { console.error("Access key cannot be empty!"); }
                return;
            }
            ajaxRequest = {
                method: "POST",
                url: servicebaseurl + "/authenticate",
                data: {
                    uuid: uuid_hash
                },
                headers: {
                    "x-api-key": fm_access_key
                }
            }
        } else {
            ajaxRequest = {
                method: "POST",
                url: servicebaseurl + "/authenticate",
                headers: {
                    "Authorization": getJWTToken()
                }
            }
        }

        $.ajax(ajaxRequest)
        .done(function( data ) {
            if (data) {
                if (data.success === false) { 
                    is_authenticated = false; 
                    msg = 'Error: ' + data.message; 
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                }
                else { 
                    is_authenticated = true; 
                    accesskey = fm_access_key;
                    uuid = uuid_hash;
                    profiles = data.Profiles;
                    if (renderCallback) { renderCallback(profiles); } else { console.error("No render callback"); }
                }
            }
            else {
                is_authenticated = false; 
                msg = "Cannot authenticate: Service not responding";
                if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
            }
        })
        .fail(function( data ) {
            is_authenticated = false;
            msg = "Cannot authenticate: Service unavailable";
            if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
        });
	};
	
	//Delete the user account
	this.deleteUserAccount = function (fm_access_key, uuid_hash, renderCallback, errorCallback) {
		
		//reset from previous session
		is_authenticated = false;
		accesskey = "";
		uuid = "";
		
		//basic checks
        var msg = "";
        var ajaxRequest = {};
        if(!getJWTToken()) {
            if ($.trim(uuid_hash) === "") { 
                if (errorCallback) { errorCallback("Unique User Identifier cannot be empty!"); } else { console.error("Unique User Identifier cannot be empty!"); } 
                return;
            }
            if ($.trim(fm_access_key) === "") {
                if (errorCallback) { errorCallback("Access key cannot be empty!"); 
                } else { console.error("Access key cannot be empty!"); }
                return;
            } 
            ajaxRequest = {
                method: "POST",
                url: servicebaseurl + "/deleteuseraccount",
                data: {
                    uuid: uuid_hash
                },
                headers: {
                    "x-api-key": fm_access_key
                }
            }
        } else {
            ajaxRequest = {
                method: "POST",
                url: servicebaseurl + "/deleteuseraccount",
                headers: {
                    "Authorization": getJWTToken()
                }
            }
        }

        $.ajax(ajaxRequest)
        .done(function( data ) {
            if (data) {
                if (data.success === false) { 
                    msg = 'Error: ' + data.message; 
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                }
                else { 
                    if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
                }
            }
            else {
                msg = "Error: Service Unavailable.";
                if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
            }
        })
        .fail(function( data ) {
            msg = "Error: Service unavailable.";
            if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
        });
    };
	
	//Get the conditions available
	//Must specify an access to get the conditions
	this.getConditions = function (fm_access_key, renderCallback, errorCallback){
		var msg = "";

        //basic checks
        var msg = "";
        var ajaxRequest = {};
        if(!getJWTToken()) {
            if ($.trim(fm_access_key) == "") { 
                if (errorCallback) { errorCallback("Access key cannot be empty!"); 
                } else { console.error("Access key cannot be empty!"); } 
                return;
            } 
            ajaxRequest = {
                method: "POST",
                url: servicebaseurl + "/getconditions",
                headers: {
                    "x-api-key": accesskey
                }
            }
        } else {
            ajaxRequest = {
                method: "POST",
                url: servicebaseurl + "/getconditions",
                headers: {
                    "Authorization": getJWTToken()
                }
            }
        }

        $.ajax(ajaxRequest)
        .done(function( data ) {
            if (data) {
                if (data.success === false) { 
                    msg = 'Error: ' +  data.message; 
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                } else {
                    if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
                }
            } else {
                msg = "Error: Service Unavailable.";
                if (errorCallback) { errorCallback(msg) } else { console.error(msg); }
            }
        })
        .fail(function( data ) {
            msg = "Error: Service Unavailable.";
            if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
        });
	};

	// === Profile Section === //
	//Get the profiles conditions selections
    this.getProfileSelections = function(renderCallback, errorCallback) {
		var result = "";
		var msg = "";
		if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
		} else {
			var msg = "";
            var ajaxRequest = {};
            if(!getJWTToken()) {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/getprofileconditions",
                    data: {
                        uuid: uuid
                    },
                    headers: {
                        "x-api-key": accesskey
                    }
                }
            } else {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/getprofileconditions",
                    headers: {
                        "Authorization": getJWTToken()
                    }
                }
            }
			$.ajax(ajaxRequest)
			.done(function( data ) {
				if (data) {
					if (data.success === false) { 
						msg = 'Error: ' + data.message; 
						if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
					} else {
						if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
					}
				} else {
					msg = "Error: Service Unavailable.";
					if (errorCallback) { errorCallback(msg) } else { console.error(msg); }
				}
			})
			.fail(function( data ) {
				msg = "Error: Service Unavailable.";
				if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
			});
		}
    };	
	
	//-- Function to change a single profile condition
	this.updateProfieCondition = function(obj, renderCallback, errorCallback) {
        var msg = "";
        if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
        } else {
			var selectionstatus = (obj.checked) ? "1" : "0";
            var profileID = $(obj).attr("profile");
            
            var ajaxRequest = {};
            if(!getJWTToken()) {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/updateprofilecondition",
                    data: {
                        uuid: uuid,
                        profileid: profileID,
                        conditionid: obj.id,
                        selectionstatus: selectionstatus
                    },
                    headers: {
                        "x-api-key": accesskey
                    }
                }
            } else {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/updateprofilecondition",
                    data: {
                        profileid: profileID,
                        conditionid: obj.id,
                        selectionstatus: selectionstatus
                    },
                    headers: {
                        "Authorization": getJWTToken()
                    }
                }
            }

			$.ajax(ajaxRequest)
			.done(function( data ) {
				if (data) {
					if (data.success === false) { 
						msg = 'Error: ' + data.message; 
						if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
					}
					else { 
						if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
					}
				}
				else {
					msg = "Cannot update: Service Unavailable.";
					if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
				}
			})
			.fail(function( data ) {
				msg = "Cannot update: Service Unavailable.";
				if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
			});
        }
	};

	//-- Function to change all the profile conditions at once
	this.updateProfieConditions = function(profileID, renderCallback, errorCallback) {

        if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
        } else {
            var conditions = [];

            $('input[profile='+profileID+']').each(function(){
                var condition = $(this).attr('id');
                var selection = $(this).prop('checked') ? 1 : 0;

                conditions.push({conditionid: condition, selected: selection})
            });

            var ajaxRequest = {};
            if(!getJWTToken()) {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/updateprofileconditions",
                    data: {
                        uuid: uuid,
                        profileid: profileID,
                        //create a json object for conditions
                        conditions: conditions,
                    },
                    headers: {
                        "x-api-key": accesskey
                    }
                }
            } else {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/updateprofileconditions",
                    data: {
                        profileid: profileID,
                        //create a json object for conditions
                        conditions: conditions,
                    },
                    headers: {
                        "Authorization": getJWTToken()
                    }
                }
            }

            var msg = "";
            $.ajax(ajaxRequest)
            .done(function( data ) {
                if (data) {
                    if (data.success === false) {
                        msg = 'Error: ' + data.message;
                        if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                    } else { 
                        if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
                    }
                }
                else {
                    msg = "Cannot update: Service Unavailable.";
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                }
            })
            .fail(function( data ) {
                msg = "Cannot update: Service Unavailable.";
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
            });
        }
	};

	// -- Update the profiles Firstname and Lastname / Info
	this.updateProfile = function(obj, renderCallback, errorCallback){

        if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
        } else {

            var ajaxRequest = {};
            if(!getJWTToken()) {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/updateprofile",
                    data: {
                        uuid: uuid,
                        profileid: obj.profileID,
                        firstname: obj.firstname,
                        lastname: obj.lastname
                    },
                    headers: {
                        "x-api-key": accesskey
                    }
                }
            } else {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/updateprofile",
                    data: {
                        profileid: obj.profileID,
                        firstname: obj.firstname,
                        lastname: obj.lastname
                    },
                    headers: {
                        "Authorization": getJWTToken()
                    }
                }
            }

            var msg = "";	
            $.ajax(ajaxRequest)
            .done(function( data ) {
                if (data) {
                    if (data.success === false) { 
                        msg = 'Error: ' + data.message;
                        if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                    }
                    else {
                        //Assign the remaining profiles back to the profiles property.
                        profiles = data.Profiles;
                        if (renderCallback) { renderCallback(profiles); } else { console.error("No render callback"); }
                    }
                }
                else {
                    msg = "Cannot update: Service Unavailable.";
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                }
            })
            .fail(function( data ) {
                msg = "Cannot update: Service Unavailable.";
                if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
            });
        }
	};

	// -- Delete the profile for account
	this.deleteProfile = function(profileid, renderCallback, errorCallback){

        if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
        } else {
            var profileObj = profiles.find(function(profile) { 
                if(profile.ProfileID === profileid) {
                    return profile;
                }
            });
            
            var msg = "";

            if(profiles.length === 1) {
                msg = "Cannot delete profile when there is only one profile left.";
                if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                return;
            }
            if (window.confirm("Do you want to delete this profile ("+profileObj.FirstName+" "+profileObj.LastName+")?")) { 

                var ajaxRequest = {};
                if(!getJWTToken()) {
                    ajaxRequest = {
                        method: "POST",
                        url: servicebaseurl + "/deleteprofile",
                        data: {
                            uuid: uuid,
                            profileid: profileid
                        },
                        headers: {
                            "x-api-key": accesskey
                        }
                    }
                } else {
                    ajaxRequest = {
                        method: "POST",
                        url: servicebaseurl + "/deleteprofile",
                        data: {
                            profileid: profileid
                        },
                        headers: {
                            "Authorization": getJWTToken()
                        }
                    }
                }

                $.ajax(ajaxRequest)
                .done(function( data ) {
                    if (data) {
                        if (data.success === false) { 
                            msg = 'Error: ' + data.message;
                            if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                        }
                        else {
                            //Assign the remaining profiles back to the profiles property.
                            profiles = data.Profiles;
                            if (renderCallback) { renderCallback(profiles); } else { console.error("No render callback"); }
                        }
                    }
                    else {
                        msg = "Cannot update: Service Unavailable.";
                        if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                    }
                })
                .fail(function( data ) {
                    msg = "Cannot update: Service Unavailable.";
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                });
            }
        }
	};

	// - Add a profile to this account
	this.createProfile = function(obj, renderCallback, errorCallback){

        if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
        } else {

            var ajaxRequest = {};
            if(!getJWTToken()) {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/createprofile",
                    data: {
                        uuid: uuid,
                        firstname: obj.firstname,
                        lastname: obj.lastname
                    },
                    headers: {
                        "x-api-key": accesskey
                    }
                }
            } else {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/createprofile",
                    data: {
                        firstname: obj.firstname,
                        lastname: obj.lastname
                    },
                    headers: {
                        "Authorization": getJWTToken()
                    }
                }
            }

            var msg = "";	
            $.ajax(ajaxRequest)
            .done(function( data ) {
                if (data) {
                    if (data.success === false) { 
                        msg = 'Error: ' + data.message;
                        if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                    }
                    else {
                        //Assign the remaining profiles back to the profiles property.
                        profiles = data.Profiles;
                        if (renderCallback) { renderCallback(profiles); } else { console.error("No render callback"); }
                    }
                }
                else {
                    msg = "Cannot update: Service Unavailable.";
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
                }
            })
            .fail(function( data ) {
                msg = "Cannot update: Service Unavailable.";
                if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
            });
        }
	};
	// === End Profile Section ===/
	
	//Get the products with suitability containers and return them for the
	//get product siutability method
	this.getProductsForSuitability = function(suitabilityContainer) {
		var products = [];
		
		//only render if the specified target id(s) is/are found
		if ($(suitabilityContainer).length > 0) {
			$(suitabilityContainer).each(function() {
				products.push($(this).attr("barcode"));
			});
		} 

		return products;
	};

	// -- Function to determine suitability and render the HTML for the renderSuitablity method. 
	this.getProductSuitability = function(renderCallback, errorCallback) {

        if (!is_authenticated) { 
            if (errorCallback) { errorCallback("No user authenticated. Call the 'Authenticate' function first."); 
            } else { console.error("No user authenticated. Call the 'Authenticate' function first."); }
            return;
        } else {

            var products = this.getProductsForSuitability(this.getSuitabilityIndicator());
            var msg = "";

            var ajaxRequest = {};
            if(!getJWTToken()) {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/checkproductsuitability",
                    data: {
                        uuid: uuid,
                        products: products,
                    },
                    headers: {
                        "x-api-key": accesskey
                    }
                }
            } else {
                ajaxRequest = {
                    method: "POST",
                    url: servicebaseurl + "/checkproductsuitability",
                    data: {
                        products: products,
                    },
                    headers: {
                        "Authorization": getJWTToken()
                    }
                }
            }	
            $.ajax(ajaxRequest)
            .done(function( data ) {
                //Check for data
                if(data){
                    if(data.success === false) { 
                        msg = 'Error: ' + data.message; 
                    } else {
                    if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
                    }
                } else {
                    msg = "Cannot update: Service Unavailable.";
                    if (errorCallback) { errorCallback(msg); } else { console.error(msg); }	
                }
            }).fail(function(data){
                msg = "Cannot update: Service Unavailable.";
                if (errorCallback) { errorCallback(msg); } else { console.error(msg); }
            });
        }
	};

/* 	//Get the products with nutrition containers and return them for the
	//get product nutrition method
	this.getProductsForNutrition = function(nutritionContainer){
		var products = [];
		
		//only render if the specified target id(s) is/are found
		if ($(nutritionContainer).length > 0) {
			$(nutritionContainer).each(function() {
				products.push($(this).attr("barcode"));
			});
		} 

		return products;

	};

	//Get the nutritional information for the products
	this.getProductNutrition = function(renderCallback, errorCallback) {
		var products = this.getProductsForNutrition(this.getNutritionValuesContainer());

		var request_data = {
			accesskey: accesskey,
			uuid: uuid,
			barcode: products,
		};	
		console.log(request_data);
		$.ajax({
			method: "POST",
			url: servicebaseurl + "/getproductnutrition",
			data: request_data
		})
		.done(function( data ) {
			if (data) {
				if(data.error) { 
					msg = data.error.message; 
				} else {
					if (renderCallback) { renderCallback(data); } else { console.error("No render callback"); }
				}
			} else {
				msg = "Cannot update: Service Unavailable.";
				if (errorCallback) { errorCallback(msg); } else { console.error(msg); }	}
			})
			.fail(function( data ) {
				msg = "Cannot update: Service Unavailable.";
				if (errorCallback) { errorCallback(msg); } else { console.error(msg); }	
			});
    }; */

};

//====== POLYFILLS =======

//polyfill for Array.find since in IE it's not supported.
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}

//Polyfill for array.filter
if (!Array.prototype.filter)
  Array.prototype.filter = function(func, thisArg) {
    'use strict';
    if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
        throw new TypeError();
    
    var len = this.length >>> 0,
        res = new Array(len), // preallocate array
        t = this, c = 0, i = -1;
    if (thisArg === undefined)
      while (++i !== len)
        // checks to see if the key was set
        if (i in this)
          if (func(t[i], i, t))
            res[c++] = t[i];
    else
      while (++i !== len)
        // checks to see if the key was set
        if (i in this)
          if (func.call(thisArg, t[i], i, t))
            res[c++] = t[i];
    
    res.length = c; // shrink down array to proper size
    return res;
  };
