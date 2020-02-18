'use strict';

if (typeof JS !== 'undefined' && typeof foodmaestro !== 'undefined') {
    // This will be moved in the big JS inside sainsburys.js

    JS.JWTtokenClear = function() {
        'user strict';

        // key for storage
        var _sesionStorageKey = 'fmKey';

        window.sessionStorage.removeItem(_sesionStorageKey + 'token');
        window.sessionStorage.removeItem(_sesionStorageKey + 'expirytime');
    };

    JS.JWTToken = function() {
        'use strict';

        var _ajaxUrl = 'AjaxGetFMSecureToken'; // url to get the latest token

        // token expiry theshold in seconds
        var _warningThreshold = 60;

        // store the repopulate token cron
        var _timeoutInstance;

        // key for storage
        var _sesionStorageKey = 'fmKey';

        // time untill token expires in seconds
        var _timeuntilExpires;

        // Get the token or refresh and return it
        this.getToken = function() {
            var data = _getSessionData();
            if (data.token && data.expirytime) {
                var now = new Date().valueOf();
                var expiry = new Date(data.expirytime).valueOf();

                if (expiry > now) {
                    return data.token;
                }
            }

            // generate a new token and return it
            var deferred = dojo.xhrGet({
                url: _ajaxUrl,
                handleAs: 'json',
                sync: true,
                load: function(data) {
                    if (data.token) {
                        _setToken(data.token, data.expirytime);
                        return data.token;
                    }
                }.bind(this),
                error: function(response, ioArgs) {
                    // what happens if JWT Token is down
                    // @todo log the error
                    return false;
                }.bind(this)
            });

            return deferred.results[0];
        };

        /**
         * Set a new cookie token and cron to update it
         * @param token
         * @param expirytime in seconds
         */
        var _setToken = function(token, expirytime) {
            var expirytimeMiliseconds = Math.abs(expirytime - 60) * 1000;
            var expiryDateUnix = new Date().valueOf() + expirytimeMiliseconds;
            // set the sessionStorage
            _setSessionData(token, new Date(expiryDateUnix).toUTCString());
        }.bind(this);

        var _getSessionData = function() {
            var data = {
                token: window.sessionStorage.getItem(_sesionStorageKey + 'token')
                    ? window.sessionStorage.getItem(_sesionStorageKey + 'token')
                    : false,
                expirytime: window.sessionStorage.getItem(_sesionStorageKey + 'expirytime')
                    ? window.sessionStorage.getItem(_sesionStorageKey + 'expirytime')
                    : false
            };
            return data;
        };

        var _setSessionData = function(token, expirytime) {
            window.sessionStorage.setItem(_sesionStorageKey + 'token', token);
            window.sessionStorage.setItem(_sesionStorageKey + 'expirytime', expirytime);
        };
    };

    /**
     *
     *
     */
    JS.FoodMaestro = function(foodMaestroLib, serviceUrl, showCreatePopUp) {
        'use strict';
        /**
         * FM right menu widget id
         */
        this.widgetId = 'foodMaestroPanelId';
        /**
         * Store the foodmaestro customer number
         * @private
         * @deprecated not used anymore
         */
        this.customerNumber = null;

        /**
         * Store the food maestro access key
         * @private
         * @deprecated not used anymore
         */
        this.accessKey = null;

        /**
         * Store the food maestro service url
         * @private
         */
        this.serviceUrl = serviceUrl;

        /**
         * Store the FoodMaestroObject
         * foodMaestroLib object comes from foodmaestro.js
         *
         * @private
         * @type foodmaestro
         */
        this.foodMaestroLib = foodMaestroLib;

        /**
         * Is FM Down
         * @private
         */
        var _serviceDown = false;

        /**
         * Should we show the create/edit profile
         */
        var _showCreatePopUp = showCreatePopUp;

        /**
         * Handle the overlay
         */
        this.overlay;

        /**
         * Is it a new profile?
         */
        this.isCreateNewProfile = false;

        /**
         * Count how many times customer saved the profile
         */
        this.profileBeenSaved = 0;

        /**
         * Reload when overlay is closed
         */
        this.reload = false;

        /**
         * store the special group of alergens that needs to be displayed on column 3
         */
        this.specialGroup = 'gluten';

        /**
         * Main entry point for ajax WCS profile commands
         */
        this.ajaxProfileActionsUrl = 'FoodProfileUpdate?requesttype=ajax';

        /**
         *
         */
        this.ajaxProfileContentUrl = 'GetFoodProfileMessages?requesttype=ajax';

        /**
         * Enable debugging messages
         */
        this.isDebug = false;

        /**
         *   Flags for suitability options
         */

        this.suitabilityFlags = {
            nonSuitable: '<span class="fmNonSuitableLogo">&nbsp;</span>'
        };

        /**
         * Store flag if suitability is on
         */
        this.toggleSuitabilityFlag = true;

        /**
         * Id of the overlay for profile edit
         */
        this.overlayBoxId = 'FM_overlayBox';

        this.imageSrc = '/wcsstore/SainsburysStorefrontAssetStore/img/';
        /**
         * Store current profile screen id
         */
        this.activeScreenId;

        /**
         * the error block id
         */
        var _errorBlockId = 'fMaestroErrorMessage';

        /**
         * Instance of JS.JWTToken
         */
        this.jwtToken;

        /**
         * Constructor class
         */
        this.init = function() {
            if (!dojo.byId(this.widgetId) || dojo.byId('fMaestroProfileConnect')) {
                return;
            }

            this.jwtToken = new JS.JWTToken();

            this.foodMaestroLib.setServiceBaseUrl(this.serviceUrl);
            this.foodMaestroLib.setJWTToken(this.jwtToken.getToken);

            if (dojo.byId('fMaestroProfileCreate')) {
                // Actions for creating the profile
                this.isCreateNewProfile = true;
                if (_showCreatePopUp == 'true') {
                    this.showPopup();
                }

                dojo.connect(
                    dojo.byId('fMaestroProfileCreate'),
                    'click',
                    this.showPopup
                );
            } else {
                // Set the toggle is on/off
                this.toggleSuitabilityFlag = dojo.hasClass(dojo.byId('fMaestroSuitabilityToggle'), 'on');
                // If user has profile authenticate
                this.authenticate(
                    function() {
                        // events for when we have a profile
                        // Try render suitability
                        this.tryRenderSuitability();

                        // listen to any product listing update
                        dojo.subscribe('/dojo/productFilter', this.tryRenderSuitability);

                        dojo.connect(
                            dojo.byId('fMaestroProfileEdit'),
                            'click',
                            this.showPopup
                        );
                        dojo.connect(
                            dojo.byId('fMaestroSuitabilityToggle'),
                            'click',
                            this.toggleSuitability
                        );
                        dojo.connect(
                            dojo.byId('fMaestroProfileTC'),
                            'click',
                            function() {
                                digitalData.event.push({
                                    eventInfo: { eventName: 'fmRHWTermsAndConditions' }
                                });
                            }
                        );
                    }.bind(this)
                );
            }
        };

        /**
         * Register event to listen to tickboxes
         * @refactor to generate the ticks when we find inputs[checkbox] with a specific class
         */
        this.handleTickboxes = function(callback) {
            // Handle the checbox click for options edit
            dojo.query('.themedCheckbox').connect(
                'onclick',
                function(event) {
                    var element = dojo.query(event.currentTarget)[0];
                    this.toggleTickbox(element, callback);
                }.bind(this)
            );
        };

        /**
         * Toggle a ticbox element
         */
        this.toggleTickbox = function(element, callback) {
            dojo.toggleClass(element, 'checked');
            // address the associated input if exists
            var inputId = dojo.attr(element, 'data-inputid');
            dojo.byId(inputId).checked = dojo.hasClass(element, 'checked');

            if (callback) {
                callback(element);
            }
        };

        /**
         * Handle when clicking a parent to check the child conditions 2
         */
        this.toggleChildsOfParentGroup = function(element) {
            if (dojo.hasClass(element, 'group_selectall')) {
                var groupName = dojo.attr(element, 'data-group');
                var groupChecked = dojo.hasClass(element, 'checked');
                var childs = dojo.query('button[data-groupparent="' + groupName + '"]');

                // loop through the childs
                childs.forEach(
                    function(node) {
                        dojo.toggleClass(node, 'checked', !groupChecked);
                        this.toggleTickbox(node);
                    }.bind(this)
                );
            } else {
                // see if the parent of the child exists and untick
                var groupName = dojo.attr(element, 'data-groupparent');

                var parentNode = dojo.query('button[data-group="' + groupName + '"')[0];

                if (typeof parentNode !== 'object') {
                    return;
                }

                var childChecked = dojo.hasClass(element, 'checked');

                if (!childChecked) {
                    dojo.toggleClass(parentNode, 'checked', !childChecked);
                    this.toggleTickbox(parentNode);
                } else {
                    // get parent id
                    // count all children
                    // count all unselected children
                    var childs = dojo.query('button.fm_toggle[data-groupparent="' + groupName + '"').length;
                    var checkedChilds = dojo.query('button.checked.fm_toggle[data-groupparent="' + groupName + '"')
                        .length;

                    if (childs == checkedChilds) {
                        dojo.toggleClass(parentNode, 'checked', true);
                    }
                }
            }
        }.bind(this);

        /**
         * Show profile popup: create or edit
         */
        this.showPopup = function() {
            if (this.isServiceDown()) {
                return;
            }

            if (this.isCreateNewProfile) {
                this.createProfile();
            } else {
                this.editProfile();
            }
        }.bind(this);

        /**
         * Handle the overlay generation with the profile
         */
        this.createProfile = function() {
            // Steps:
            // 1. Get the conditions from FM api
            var conditionsPromise = new Promise(
                function(resolve, reject) {
                    this.foodMaestroLib.getConditions(
                        this.accessKey,
                        function(data) {
                            resolve(data);
                        },
                        function(msg) {
                            reject(msg);
                        }
                    );
                }.bind(this)
            );

            // Promise to fetch the screens cms content
            var createProfileCmsJsonPromise = new Promise(
                function(resolve, reject) {
                    dojo.xhrGet({
                        url: this.ajaxProfileContentUrl + '&action=createProfile',
                        handleAs: 'json',
                        load: function(data) {
                            resolve(data);
                        },
                        error: function(response, ioArgs) {
                            /* handle the error... */
                            reject(Error('failed xhrGet - response=' + response + '    ioArgs=  ' + ioArgs)); //!!
                        }
                    });
                }.bind(this)
            );

            Promise.all([conditionsPromise, createProfileCmsJsonPromise]).then(
                function(values) {
                    var conditions = values[0];
                    var cms = values[1];

                    digitalData.event.push({
                        eventInfo: { eventName: 'fmCreateProfile' }
                    });
                    // Render the 4 create profile screen
                    // Open the lightbox and inject the content in there
                    this.renderCreateProfile(conditions, cms);
                }.bind(this),
                function(err) {
                    _errorCallback(err);
                    this.hideAjaxOverly();
                }.bind(this)
            );
        }.bind(this);

        /**
         * Handle the foodmaestro edit profile callback
         */
        this.editProfile = function(event) {
            if (this.isServiceDown()) {
                return;
            }

            var editProfilePromise = new Promise(
                function(resolve, reject) {
                    this.authenticate(this.foodMaestroLib.getProfileSelections(resolve, reject));
                }.bind(this)
            );

            var editProfileCmsJsonPromise = new Promise(
                function(resolve, reject) {
                    dojo.xhrGet({
                        url: this.ajaxProfileContentUrl + '&action=editProfile',
                        handleAs: 'json',
                        load: function(data) {
                            resolve(data);
                        },
                        error: function(response, ioArgs) {
                            /* handle the error... */
                            reject(Error('failed xhrGet - response=' + response + '    ioArgs=  ' + ioArgs)); //!!
                        }
                    });
                }.bind(this)
            );

            Promise.all([editProfilePromise, editProfileCmsJsonPromise]).then(
                function(values) {
                    var data = values[0];
                    var cms = values[1];

                    // render the edit profile screen
                    this.renderEditProfile(data, cms);
                    _hideErrorMessage();
                }.bind(this),
                function(error) {
                    _errorCallback(error);
                }.bind(this)
            );
        }.bind(this);

        /**
         * Render a profile step.
         * If content is provided, use that instead of config.content value
         *
         * params:
         * - config: {
         *       cssClass : ..,
         *        id: ...,
         *        content: ...,
                  buttons: [
                    {
                        id: ...,
                        cssClass: ...,
                        buttonLabel: ...

                    },
                    {}
                  ]
         *    }
         *  - content: ''
         */
        this.renderScreen = function(config, content) {
            var html =
                '<div class="screen one ' +
                config.cssClass +
                '" id="' +
                config.id +
                '"><div class="content">' +
                this.decodeString(content ? content : config.content) +
                '</div>';
            config.buttons.forEach(function(element) {
                html +=
                    '<button class="' +
                    element.cssClass +
                    '" id="' +
                    element.id +
                    '">' +
                    element.buttonLabel +
                    '</button>';
            });

            html += '</div>';
            return html;
        };
        /**
         * decode string
         */
        this.decodeString = function(string) {
            var convertor = document.createElement('textarea');
            convertor.innerHTML = string;
            return convertor.textContent;
        };

        // Store ajax spinner overlay. Show it untill normal one is being rendered
        var _ajaxOverlay = false;

        this.showAjaxOverlay = function() {
            if (!_ajaxOverlay) {
                _ajaxOverlay = new JS.AreaOverlay(
                    {
                        overlayClass: 'ajaxSpinner',
                        overlayId: 'ajaxSpinner',
                        areaId: 'viewSubscriptionDisplay'
                    },
                    true
                );
            }
            _ajaxOverlay.show();
        }.bind(this);

        this.hideAjaxOverly = function() {
            if (_ajaxOverlay) {
                _ajaxOverlay.hide();
            }
        }.bind(this);

        /**
         * Render the create profile screens
         */
        this.renderCreateProfile = function(conditions, cmsConfig) {
            var _config = {
                screen_welcome: {
                    id: 'fmCreateProfilePopup1',
                    cssClass: 'welcome',
                    content: '',
                    buttons: [
                        {
                            id: 'fmProfileWelcomeContinueButton',
                            cssClass: 'button process',
                            buttonLabel: 'Continue'
                        }
                    ]
                },
                screen_conditions: {
                    id: 'fmCreateProfilePopup2',
                    cssClass: 'conditions hidden',
                    content: '',
                    buttons: [
                        {
                            id: 'fmProfileConditionsContinueButton',
                            cssClass: 'button process',
                            buttonLabel: 'Continue'
                        }
                    ]
                },
                screen_review: {
                    id: 'fmCreateProfilePopup3',
                    cssClass: 'review hidden',
                    content: '',
                    buttons: [
                        {
                            id: 'fmProfileReviewContinueButton',
                            cssClass: 'button process',
                            buttonLabel: 'Finish'
                        }
                    ]
                },
                screen_success: {
                    id: 'fmCreateProfilePopup4',
                    cssClass: 'success hidden',
                    content: '',
                    buttons: [
                        {
                            id: 'fmProfileSuccessContinueButton',
                            cssClass: 'button process',
                            buttonLabel: 'Back to shop'
                        }
                    ]
                },
                footer: {
                    content: '<p>Powered by FoodMaestro</p>'
                }
            };

            if (cmsConfig) _config = JS.mixin(_config, cmsConfig);

            var step3Content =
                '<img class="fmLabelExampleImage"  src="' +
                this.imageSrc +
                '/fm_label_example.png" ' +
                'srcset="' +
                this.imageSrc +
                '/fm_label_example@2x.png 2x, ' +
                this.imageSrc +
                '/fm_label_example@3x.png 3x" />' +
                _config.screen_review.content.replace('{{suitableFlag}}', this.suitabilityFlags.nonSuitable);

            var steps =
                '<div class="overlayHeader"><a class="closeLink closeOverlay" href="#">&nbsp;</a></div>' +
                '<div class="overlayBody">' +
                this.renderScreen(_config.screen_welcome) +
                this.renderScreen(
                    _config.screen_conditions,
                    _config.screen_conditions.content + this.renderProfileConditions(conditions)
                ) +
                this.renderScreen(_config.screen_review, step3Content) +
                this.renderScreen(_config.screen_success) +
                '</div>' +
                '<div class="overlayFooter">' +
                dojox.html.entities.decode(_config.footer.content) +
                '</div>';

            this.getOverlay().show(steps, 'undefined', _handleOverlayClose);
            // Set the inital active screen id
            this.activeScreenId = _config.screen_welcome.id;

            // Init the handle tickboxes logic for parent
            this.handleTickboxes(this.toggleChildsOfParentGroup);

            // Attach edit profile events
            dojo.connect(
                dojo.byId('fmProfileWelcomeContinueButton'),
                'click',
                function(event) {
                    this.toggleScreens(_config.screen_conditions.id);
                }.bind(this)
            );
            dojo.connect(
                dojo.byId('fmProfileConditionsContinueButton'),
                'click',
                function(event) {
                    this.toggleScreens(_config.screen_review.id);
                }.bind(this)
            );
            // flat to prevent save multiple times
            var isSaveRunning = false;
            dojo.connect(
                dojo.byId('fmProfileReviewContinueButton'),
                'click',
                function(event) {
                    // try to submit the options to FM, then save the profile and then go to next screen
                    // also set the screen to reload on overlay close

                    // if saveRunning already happening get out
                    if (isSaveRunning) {
                        return;
                    } else {
                        isSaveRunning = true;
                    }

                    var authenticatePromise = new Promise(
                        function(resolve, reject) {
                            this.foodMaestroLib.authenticate(
                                this.accessKey,
                                this.customerNumber,
                                function(profiles) {
                                    resolve(profiles[0]);
                                }, // success method
                                function(error) {
                                    reject(error);
                                } // error method
                            );
                        }.bind(this)
                    );

                    var createProfilePromise = function(profile) {
                        return new Promise(
                            function(resolve, reject) {
                                // update all the input with conditions to have the selected profile as attribute
                                dojo.query('.fm_toggle.condition').attr('profile', profile.ProfileID);
                                this.foodMaestroLib.updateProfieConditions(
                                    profile.ProfileID,
                                    function(data) {
                                        resolve(data);
                                    },
                                    function(msg) {
                                        reject(msg);
                                    }
                                );
                            }.bind(this)
                        );
                    }.bind(this);

                    var _thisHandleErrorProfileScreens = _handleErrorProfileScreens;
                    var self = this;
                    self.eventElement = event.toElement ? event.toElement : event.currentTarget;

                    this.updateProfileBackend('createProfile')
                        .then(function(result) {
                            return authenticatePromise;
                        })
                        .then(function(profile) {
                            return createProfilePromise(profile);
                        })
                        .then(
                            function(data) {
                                isSaveRunning = false;
                                this.reload = true;
                                this.toggleScreens(_config.screen_success.id); // move to the next screen 4
                                digitalData.event.push({
                                    eventInfo: {
                                        eventName: 'fmProfileCreated',
                                        Allergens: this.getSelectedConditions()
                                    }
                                });
                            }.bind(this)
                        )
                        .catch(function(error) {
                            isSaveRunning = false;
                            self.updateProfileBackend('deleteProfile').then(function() {}, function() {});
                            _thisHandleErrorProfileScreens(error, self.eventElement, 'fmCreateProfileUnavailable');
                        });
                }.bind(this)
            );
            dojo.connect(
                dojo.byId('fmProfileSuccessContinueButton'),
                'click',
                function(event) {
                    this.getOverlay().hide();
                }.bind(this)
            );
            dojo.connect(
                dojo.byId('fmCreateProfileTCPopup'),
                'click',
                function() {
                    digitalData.event.push({
                        eventInfo: { eventName: 'fmCreateProfileTermsAndConditions' }
                    });
                }
            );
        };

        /**
         * Return an array of selected conditions names
         */
        this.getSelectedConditions = function() {
            var arrSelectedCond = [];
            dojo.query('.fmCondition button.checked').forEach(function(node, index, arr) {
                arrSelectedCond.push(dojo.attr(node, 'data-condition'));
            });
            return arrSelectedCond;
        };

        /**
         *   Render the edit profile screens
         */
        this.renderEditProfile = function(data, cmsConfig) {
            var _config = {
                screen_conditions: {
                    id: 'fm_show_conditions',
                    cssClass: 'conditions',
                    content: '<h1>My dietary profile</h1><p>Please select any food alleries or intolerances:</p>',
                    buttons: [
                        {
                            id: 'fmProfileConditionsSaveButton',
                            cssClass: 'button process',
                            buttonLabel: 'Save'
                        },
                        {
                            id: 'fmProfileConditionsDeleteButton',
                            cssClass: 'button',
                            buttonLabel: 'Delete profile'
                        }
                    ]
                },
                screen_confirm_delete: {
                    id: 'fm_show_confirm_delete',
                    cssClass: 'confirmDelete hidden',
                    content:
                        '<h1>Are you sure you want to delete your profile?</h1>' +
                        '<p>Please note if you delete your profile, we will no longer be able to flag' +
                        " products we don't think are suitable for you</p>",
                    buttons: [
                        {
                            id: 'fmProfileYesDeleteButton',
                            cssClass: 'button',
                            buttonLabel: 'Yes'
                        },
                        {
                            id: 'fmProfileNoDeleteButton',
                            cssClass: 'button process',
                            buttonLabel: 'No'
                        }
                    ]
                },
                screen_success: {
                    id: 'fm_success',
                    cssClass: 'success delete hidden',
                    content: '<h1>Your profile is now deleted</h1>',
                    buttons: [
                        {
                            id: 'fmProfileSuccessContinueButton',
                            cssClass: 'button process',
                            buttonLabel: 'Back to shop'
                        }
                    ]
                },
                footer: {
                    content: '<p>Powered by FoodMaestro</p>'
                }
            };

            if (cmsConfig) _config = JS.mixin(_config, cmsConfig);

            // Working with only 1 profile per account so extracting the default profile from array
            var conditions = data[0];

            var steps =
                '<div class="overlayHeader"><a class="closeLink closeOverlay" href="#">&nbsp;</a></div>' +
                '<div class="overlayBody">' +
                this.renderScreen(
                    _config.screen_conditions,
                    _config.screen_conditions.content + this.renderProfileConditions(conditions)
                ) +
                this.renderScreen(_config.screen_confirm_delete) +
                this.renderScreen(_config.screen_success) +
                '</div>' +
                '<div class="overlayFooter">' +
                dojox.html.entities.decode(_config.footer.content) +
                '</div>';

            this.getOverlay().show(steps, 'undefined', _handleOverlayClose);
            // Init the handle tickboxes logic
            this.handleTickboxes(this.toggleChildsOfParentGroup);

            // Attach edit profile events
            dojo.connect(
                dojo.byId('fmProfileConditionsDeleteButton'),
                'click',
                function(event) {
                    this.toggleScreens(_config.screen_confirm_delete.id);
                }.bind(this)
            );
            dojo.connect(
                dojo.byId('fmProfileNoDeleteButton'),
                'click',
                function(event) {
                    this.getOverlay().hide();
                }.bind(this)
            );
            // Flag to prevent multiple save
            var isSaveRunning = false;

            dojo.connect(
                dojo.byId('fmProfileConditionsSaveButton'),
                'click',
                function(event) {
                    // if saveRunning already happening get out
                    if (isSaveRunning) {
                        return;
                    } else {
                        isSaveRunning = true;
                    }

                    // 1. send options to FM
                    var savePromise = new Promise(
                        function(resolve, reject) {
                            if (!conditions.ProfileID) {
                                reject(Error("Can't save options"));
                            }
                            this.foodMaestroLib.updateProfieConditions(
                                conditions.ProfileID,
                                function(data) {
                                    resolve(data);
                                },
                                function(msg) {
                                    reject(msg);
                                }
                            );
                        }.bind(this)
                    );

                    var self = this;
                    self.eventElement = event.toElement ? event.toElement : event.currentTarget;

                    var _thisHandleErrorProfileScreens = _handleErrorProfileScreens;
                    savePromise
                        .then(
                            function(data) {
                                digitalData.event.push({
                                    eventInfo: {
                                        eventName: 'fmProfileUpdate',
                                        Allergens: this.getSelectedConditions()
                                    }
                                });
                                isSaveRunning = false;
                                this.getOverlay().hide();
                            }.bind(this)
                        )
                        .catch(function(error) {
                            isSaveRunning = false;
                            _thisHandleErrorProfileScreens(error, self.eventElement, 'fmEditProfileUnavailable');
                        });
                }.bind(this)
            );

            dojo.connect(
                dojo.byId('fmProfileYesDeleteButton'),
                'click',
                function(event) {
                    // Send a delete to FM & to WCS BE
                    var fmDeletePromise = new Promise(
                        function(resolve, reject) {
                            this.foodMaestroLib.deleteUserAccount(this.accessKey, this.customerNumber, resolve, reject);
                        }.bind(this)
                    );

                    var wcsBackendDeletePromise = this.updateProfileBackend('deleteProfile');

                    var self = this;
                    self.eventElement = event.toElement ? event.toElement : event.currentTarget;
                    var _thisHandleErrorProfileScreens = _handleErrorProfileScreens;

                    Promise.all([fmDeletePromise, wcsBackendDeletePromise])
                        .then(
                            function(values) {
                                self.reload = true; // set flag to reload page on overlay close
                                self.toggleScreens(_config.screen_success.id);
                            }.bind(this)
                        )
                        .catch(function(error) {
                            _thisHandleErrorProfileScreens(error, self.eventElement, 'fmDeleteProfileUnavailable');
                        });
                }.bind(this)
            );
            dojo.connect(
                dojo.byId('fmProfileSuccessContinueButton'),
                'click',
                this.getOverlay().hide
            );
        };
        /**
         * Show only the selected id screen
         * @todo add logic to do other actions before switch ( like submit the profile options if needed)
         */
        this.toggleScreens = function(activeId) {
            this.activeScreenId = activeId;
            dojo.query('.screen', this.overlayBoxId).addClass('hidden');
            dojo.query('#' + activeId, this.overlayBoxId).removeClass('hidden');
        }.bind(this);

        /**
         * Render Profile Conditions html
         */
        this.renderProfileConditions = function(conditions) {
            // store the unique groupConditions
            var groupConditions = [];
            // store if parent condition is checked on load
            // if all the children conditions are checked
            var groupConditionsChecked = {};

            // store the conditions by group
            var groupByConditionsName = {};

            for (var i = 0; i < conditions.Conditions.length; i++) {
                var cond = conditions.Conditions[i];
                var groupName = cond.ConditionGroupName.replace(' ', '');

                if (typeof groupByConditionsName[groupName] == 'undefined') {
                    groupByConditionsName[groupName] = [];
                    groupConditions.push(groupName);
                    // set the condition to be checked by default
                    groupConditionsChecked[groupName] = true;
                }
                groupByConditionsName[groupName].push(cond);

                // if a child condition not checked prevent parent to be checked
                if (groupConditionsChecked[groupName] && !cond.ConditionSelected) {
                    groupConditionsChecked[groupName] = false;
                }
            }

            var profileID = conditions.ProfileID ? conditions.ProfileID : false;

            var productsColumn = {
                other: [],
                gluten: []
            };

            // handle the column id
            var getNextColumn = function(groupName) {
                if (groupName.toLowerCase().search(this.specialGroup) >= 0) {
                    return 'gluten';
                } else {
                    return 'other';
                }
            }.bind(this);

            // Go through each condition group and list all of theme
            for (var i = 0; i < groupConditions.length; i++) {
                var groupName = groupConditions[i];
                for (var k = 0; k < groupByConditionsName[groupName].length; k++) {
                    var cond = groupByConditionsName[groupName][k];
                    var groupName = cond.ConditionGroupName.replace(' ', '');

                    var columnToPopulate = getNextColumn(groupName);
                    // add also the condition group name as a selectable option(that ticks all the items in the group)
                    if (k == 0 && groupByConditionsName[groupName].length > 1) {
                        productsColumn[columnToPopulate].push(
                            '<div class="fmCondition groupName">' +
                                '<label class="conditionLabel">' +
                                cond.ConditionGroupName +
                                ' <button class="themedCheckbox group_selectall ' +
                                (groupConditionsChecked[groupName] ? 'checked' : '') +
                                ' "  id="toggle_id_' +
                                groupName +
                                '"' +
                                ' data-inputid="group_' +
                                groupName +
                                '" ' +
                                ' data-group="' +
                                groupName +
                                '" data-condition="' +
                                cond.ConditionGroupName +
                                '">&nbsp;</button>  <input id="group_' +
                                groupName +
                                '" ' +
                                'class="fm_toggle group_selectall hidden" type="checkbox"' +
                                'data-group="' +
                                groupName +
                                '"  />' +
                                '</label>' +
                                '</div>'
                        );
                    }

                    productsColumn[columnToPopulate].push(
                        '<div class="fmCondition">' +
                            '<label class="conditionLabel">' +
                            cond.ConditionName +
                            '<button class="themedCheckbox fm_toggle ' +
                            (cond.ConditionSelected ? 'checked' : '') +
                            '" ' +
                            'data-inputid="' +
                            cond.ConditionID +
                            '" data-groupparent="' +
                            groupName +
                            '" data-condition="' +
                            cond.ConditionName +
                            '">&nbsp;</button>' +
                            '<input id="' +
                            cond.ConditionID +
                            '" ' +
                            'class="fm_toggle condition hidden" type="checkbox" data-groupparent="' +
                            groupName +
                            '" ' +
                            (cond.ConditionSelected ? 'checked' : '') +
                            (profileID ? ' profile="' + profileID + '"' : '') +
                            '/>' +
                            '</label>' +
                            '</div>'
                    );
                }
            }

            var html = '<div class="FMConditionsBlock">';

            if (productsColumn.other.length) {
                var halfLenghtIndex = Math.ceil(productsColumn.other.length / 2);

                html +=
                    '<div class="column one">' +
                    productsColumn.other.splice(0, halfLenghtIndex).join(' ') +
                    '</div>' +
                    '<div class="column two">' +
                    productsColumn.other.join(' ') +
                    '</div>';
            }

            if (productsColumn.gluten.length) {
                html += '<div class="column three">' + productsColumn.gluten.join(' ') + '</div>';
            }

            html += '</div>';
            return html;
        };

        /**
         * Get a new overlay instance if not created
         */
        this.getOverlay = function() {
            if (typeof this.overlay === 'undefined') {
                this.overlay = new JS.Overlay({
                    overlayBoxClass: 'FM_overlayBox overlayBox',
                    overlayBoxId: this.overlayBoxId,
                    pageOverlayId: 'FM_ProfileSettingsPopup'
                });
            }
            return this.overlay;
        };

        /**
         * Return Promise for when we try to update the WCS BEs
         */
        this.updateProfileBackend = function(action) {
            return new Promise(
                function(resolve, reject) {
                    var self = this;
                    switch (action) {
                        case 'createProfile':
                        case 'deleteProfile':
                        case 'toggleOn':
                        case 'toggleOff':
                            // do ajax update to set toggleflag to off on WCS BE
                            dojo.xhrPost({
                                url: this.ajaxProfileActionsUrl + '&action=' + action,
                                handleAs: 'json',
                                load: function(data) {
                                    // set flag
                                    self.log('We se the flag for suitability toggle to ' + action);
                                    resolve(data);
                                },
                                error: function(response, ioArgs) {
                                    /* handle the error... */
                                    reject('failed xhrGet - response=' + response + '    ioArgs=  ' + ioArgs);
                                }
                            });
                            break;
                        default:
                            reject(Error('Actio ' + action + 'not accepted'));
                            break;
                    }
                }.bind(this)
            );
        };

        /**
         * Handle the toggle switch for suitability
         */
        this.toggleSuitability = function(event) {
            if (this.isServiceDown()) {
                return;
            }

            var element = dojo.query(event.currentTarget)[0];
            dojo.toggleClass(element, 'off on');

            var action;
            var actionDA;
            // check class
            if (dojo.hasClass(element, 'off')) {
                // hide suitability
                this.toggleSuitabilityFlag = false;
                action = 'toggleOff';
                actionDA = 'fmToggleOff';
            } else {
                // show suitability
                this.toggleSuitabilityFlag = true;
                action = 'toggleOn';
                actionDA = 'fmToggleOn';
            }
            digitalData.event.push({ eventInfo: { eventName: actionDA } });

            var self = this;
            // do ajax update to set toggleflag to off on WCS BE
            dojo.xhrPost({
                url: this.ajaxProfileActionsUrl + '&action=' + action,
                handleAs: 'json',
                load: function(data) {
                    // set flag
                    self.log('We se the flag for suitability toggle to ' + action);
                    self.tryRenderSuitability();
                    _hideErrorMessage();
                }.bind(this),
                error: function(response, ioArgs) {
                    _errorCallback('failed xhrGet - response=' + response + '    ioArgs=  ' + ioArgs);
                }.bind(this)
            });
        }.bind(this);

        /**
         * Do a food maestro authentication
         * We have 2 scenarios after authentication
         * 1. We authenticate and render suitability ( is Profile already created)
         * 2. We authenticate and render profile if we create profile
         */
        this.authenticate = function(callback, errorCallback) {
            if (!this.foodMaestroLib.getProfiles().length && !this.isServiceDown()) {
                this.foodMaestroLib.authenticate(
                    this.accessKey,
                    this.customerNumber,
                    callback ? callback : _authenticateCallback,
                    errorCallback ? errorCallback : _errorCallback
                );
            } else {
                if (callback) callback(this.foodMaestroLib.getProfiles());
            }
        };

        /**
         * Handle the foodmaestro profile authentication callback
         */
        var _authenticateCallback = function(profiles) {
            _setServiceDownFlag(false);
            // Add logic when to render Suitability, calling for suitability all the time at the moment
            if (this.isCreateNewProfile == false) {
                this.tryRenderSuitability();
            }
        }.bind(this);

        /**
         * manage error on edit/create profile screens
         */
        var _handleErrorProfileScreens = function(error, siblingElement, gaErrorEventName) {
            if (!dojo.byId(_errorBlockId)) {
                return;
            }

            var errorBlock = dojo.byId(_errorBlockId).cloneNode(true);
            errorBlock.removeAttribute('id');
            dojo.removeClass(errorBlock, 'hidden');

            dojo.place(errorBlock, siblingElement, 'after');
            dojo.addClass(siblingElement, 'hidden');
            dojo.setStyle(siblingElement, { display: 'none' });

            _errorCallback(error, gaErrorEventName);
        }.bind(this);

        /**
         * Handle default errorCallback methods
         */
        var _errorCallback = function(error, gaErrorEventName) {
            if (!gaErrorEventName) {
                gaErrorEventName = 'fmRHWUnavailable';
            }
            // track error
            digitalData.event.push({
                eventInfo: { eventName: gaErrorEventName }
            });

            this.log(error);
            _setServiceDownFlag(true);
            _showErrorMessage();
        }.bind(this);

        /**
         * Show error message
         */
        var _showErrorMessage = function() {
            dojo.removeClass(dojo.byId(_errorBlockId), 'hidden');
        }.bind(this);

        /**
         * Hide error message
         */
        var _hideErrorMessage = function() {
            dojo.addClass(dojo.byId(_errorBlockId), 'hidden');
        };

        /**
         * Handle what happens when we close the overlay.
         */
        var _handleOverlayClose = function() {
            if (this.activeScreenId != 'fmCreateProfilePopup4' && this.isCreateNewProfile) {
                digitalData.event.push({
                    eventInfo: { eventName: this.activeScreenId + 'Abandoned' }
                });
            }
            if (this.reload) {
                // reload picture
                location.reload();
            } else if (!this.isCreateNewProfile) {
                this.tryRenderSuitability();
            }
        }.bind(this);

        /**
         * Method to call and render suitability
         */
        this.tryRenderSuitability = function() {
            if (
                this.toggleSuitabilityFlag &&
                dojo.query(this.foodMaestroLib.getSuitabilityIndicator()).length &&
                !this.isServiceDown()
            ) {
                this.foodMaestroLib.getProductSuitability(_renderProductSuitability, _errorCallback);
            } else {
                // empty the suitability flags
                var fm_suitability_indicator = this.foodMaestroLib.getSuitabilityIndicator();
                dojo.query(fm_suitability_indicator).forEach(function(node) {
                    node.innerHTML = '';
                });

                _resetBlocks();
            }
        }.bind(this);

        /**
         * Method that renders the products label
         */
        var _renderProductSuitability = function(data) {
            var profiles = this.foodMaestroLib.getProfiles();
            var fm_suitability_indicator = this.foodMaestroLib.getSuitabilityIndicator();

            for (i = 0; i < data.length; i++) {
                var html = '<span class="hidden">&nbsp;</span>';
                var isSuitable = false;
                var userSuitability = data[i].Suitability.filter(function(product) {
                    return product.isSuitable === 0;
                });

                if (userSuitability.length) {
                    html = this.suitabilityFlags.nonSuitable;
                }

                var element = dojo.query(
                    fm_suitability_indicator + '[barcode*="' + data[i].Product[0].BarcodeNumber + '"]'
                )[0];

                dojo.place(html, element, 'only');
            }

            _resetBlocks();
        }.bind(this);

        /**
         *   Rearange PLP product tiles heights
         */
        var _resetBlocks = function() {
            if (JS && JS.objects && JS.objects.gridView) {
                JS.objects.gridView.getBlocks();
            }
        };

        /**
         * Set service down flag.
         * @param flag Boolean
         */
        var _setServiceDownFlag = function(flag) {
            _serviceDown = flag;
        }.bind(this);
        /**
         * Update service is down from callback message
         */
        var _updateServiceDown = function(msg) {
            _serviceDown = msg.includes('Service not responding') || msg.includes(' Service Unavailable');
        }.bind(this);

        /**
         * Check service down flag
         */
        this.isServiceDown = function() {
            return _serviceDown;
        }.bind(this);

        /**
         * Set Debug true/false
         */
        this.setDebug = function(boolean) {
            this.isDebug = boolean;
        };
        /**
         * Decide console.log can be done
         */
        this.log = function(msg) {
            if (this.isDebug) {
                console.log(msg);
            }
        };
    };

    JS.objects.FoodMaestro = new JS.FoodMaestro(
        foodmaestro,
        foodProfileInfo.serviceUrl,
        foodProfileInfo.foodProfileCreate
    );

    define.amd.jQuery = true;
    /**
     * On Load
     */
    require([
        'dojo/ready',
        'dojo/_base/fx',
        'dojo/fx/easing',
        'dojo/has',
        'NodeList-traverse',
        'dojox/NodeList/delegate',
        'dojo/hash',
        'dojox/html/entities'
    ], function(ready, fx, easing, has) {
        ready(function() {
            // Added as this doesn't always seem to get done when the page loads
            JS.objects.FoodMaestro.init();
        });
    });
}
