angular.module('starter.controllers', ['ionic','chart.js','nvd3','ngRadialGauge'])
.controller('LoginCtrl',function($scope,$window,$rootScope,$state,datafactory, $ionicLoading, $location, $ionicPopup, $ionicHistory){

    $scope.$on("$ionicView.enter", function () {
       //console.log("Cache Clearer");
       $ionicHistory.clearCache();
       $ionicHistory.clearHistory();
       var masterArray = ["triggerFreshFilter","callDashboardCall","callBulksignoffCall","callAttesationCall","callAttesationRegionCall","callAttesationDefaultCall","callSummaryStatusCall","loadSMFilterApply"]
        for(var i in masterArray){
            if($rootScope.$$listeners[masterArray[i]] != undefined){
                $rootScope.$$listeners[masterArray[i]] = [];
            }
        }
        $scope.roleTriggered = false;
    });
    $scope.soeid;
    $scope.authResults;
    $scope.status;
    $scope.roleTriggered = false;
    $rootScope.setTimeOutLoader = 0;
    $rootScope.avoidInitialLoad = true;
    $scope.adminRoleValue = {
        value : "1"
    };
    $rootScope.misDashboardCallTypeInitial = 'true';
    var isIpad = ionic.Platform.isIPad();
    $rootScope.isIpad = isIpad;
    $rootScope.isService = true;
    $rootScope.enableAnalytics = true;
    $rootScope.enableGlobalDashboardReport = true;
    $rootScope.pageNames = {
        DASHBOARD: 'DASH BOARD PAGE',
        BULKSIGNOFF: 'BULK SIGN OFF PAGE',
        ATTESTATION: 'ATTESTATION PAGE',
        SIGNOFFLIST: 'SIGN OFF DETAIL PAGE'
    }
    $rootScope.signature = "";
    //console.log('login controller initiated');
    $rootScope.loadingMessage = '<ion-spinner icon="spiral"></ion-spinner>';

    $rootScope.showLoading = function(){
        //console.log("Called Loader");
        if($rootScope.isService === true){
            ActivityIndicator.show("Loading");
        }
    }

    $rootScope.hideLoading = function(){
        //console.log("Hide Loader");
        if($rootScope.isService === true){
            ActivityIndicator.hide();
        }
    }

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.applicationConfigSuccess = function(result) {
        try {
            var parsedConfig = JSON.parse(result);
            //console.log("Successfully parsed the configuration JSON format: " + result);
            var userId;
            $rootScope.applicationConfigData = parsedConfig;
            if(parsedConfig.userId.split("@")[0] != undefined){
                userId = parsedConfig.userId.split("@")[0];
                //console.log(userId);
                $scope.doLogin(userId);
            } else{
                //console.log("User Id Not available");
                $rootScope.hideLoading();
                $scope.showFailPopUp('E133');
            }

        } catch(e) {
            //console.log("Unable to parse configuration JSON format: " + result);
            $rootScope.hideLoading();
            $scope.showFailPopUp('E133');
        }
    };

    $scope.applicationConfigFail = function(result) {
          //console.log("An error occurred while retrieving the application configuration: " + result);
          $rootScope.hideLoading();
          $scope.showFailPopUp('E133');
    };

    $scope.getApplicationConfiguration = function(){
        $rootScope.showLoading();
        //console.log($window.plugins);
        if($rootScope.isService === true){
            $window.plugins.GDApplication.getApplicationConfig($scope.applicationConfigSuccess,$scope.applicationConfigFail);
        } else{
            $state.go('app.landing');
            $rootScope.hideLoading();
        }
    };

    $scope.applyAdminAccess = function(roleValue){}
    $scope.showAdminPopup = function(){}

    $scope.loginSuccess = function(loginObj){
            var entitlementObj = JSON.parse(loginObj.responseText);
            //console.log(JSON.stringify(entitlementObj));
            $rootScope.entitlementsData = {
                businessLine: entitlementObj.businessLine,
                hasQlikviewAccess: entitlementObj.hasQlikviewAccess,
                triggerSeparateFilter: (entitlementObj.hasQlikviewAccess == true || entitlementObj.hasQlikviewAccess == "true")?true:false,
                triggeredSeparateFilter: (entitlementObj.hasQlikviewAccess == true || entitlementObj.hasQlikviewAccess == "true")?true:false,
                triggeredForDashboard: (entitlementObj.hasQlikviewAccess == true || entitlementObj.hasQlikviewAccess == "true")?true:false,
                intAttestation: entitlementObj.intAttestation,
                showManagerAttestation: (entitlementObj.intAttestation == 1 || entitlementObj.intAttestation == "1")?true:false,
                showSeniorManagerAttestation: (entitlementObj.intAttestation == 2 || entitlementObj.intAttestation == "2")?true:false,
                isAdmin: entitlementObj.isAdmin,
                isCommentAdmin: entitlementObj.isCommentAdmin,
                isDailySignOff: entitlementObj.isDailySignOff,
                isDailySignOffAdmin: entitlementObj.isDailySignOffAdmin,
                isTradeComment: entitlementObj.isTradeComment,
                lastLogin: entitlementObj.lastLogin,
                lastUnsuccessfulLogin: entitlementObj.lastUnsuccessfulLogin,
                region: entitlementObj.region,
                regions: entitlementObj.regions,
                roleId: entitlementObj.roleId,
                soeId: entitlementObj.soeId,
                userEmailId: entitlementObj.userEmailId,
                userFirstName: entitlementObj.userFirstName,
                userFullName: entitlementObj.userFullName,
                userId: entitlementObj.userId,
                userLastName: entitlementObj.userLastName
            }

            if(entitlementObj.soeId !== undefined && entitlementObj.soeId !== null){
                if(entitlementObj.hasQlikviewAccess === "true" || entitlementObj.hasQlikviewAccess === true){
                    $state.go('app.landing');
                    if($rootScope.enableAnalytics === true){
                        datafactory.irisAnalytics({"uid": $rootScope.entitlementsData.soeId,"PAGE_NAME": $rootScope.pageNames.DASHBOARD, "DETAILS": "DASHBOARD" });
                    }
                } else {
                    $state.go('app.landing');
                    if($rootScope.enableAnalytics === true){
                        datafactory.irisAnalytics({"uid": $rootScope.entitlementsData.soeId,"PAGE_NAME": $rootScope.pageNames.BULKSIGNOFF, "DETAILS": "BULKSIGNOFF" });
                    }
                }
            $rootScope.hideLoading();
        }
    };

    $scope.doLogin = function(userId) {
        if($rootScope.isService === true){
            var creds = {
                "requestType":"validateUser",
                //"uid" : "tk02483",
                "uid":"HS61655",
                //"uid": "AM61960",
                //"uid": "AR50360",
                //"uid": userId,
                "pwd": ""
            };
            $rootScope.creds = creds;
            function sendSuccess(response) {
                console.log("Entitlement Call End:"+ new Date());
                //console.log(response);
                try {
                    ////console.log($window.plugins.GDHttpRequest);
                    var responseObj = JSON.parse(response);//$window.plugins.GDHttpRequest.parseHttpResponse(response);
                    $scope.loginSuccess(responseObj);
                } catch(e) {
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $rootScope.hideLoading();
                    $scope.showFailPopUp('E102');
                }
             }

            function sendFail(response) {
                console.log("Entitlement Call End on error:"+ new Date());
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $rootScope.hideLoading();
                $scope.showFailPopUp('E101');
                //return response;
            }
            console.log("Entitlement Call Start:"+ new Date());
            var authentication = datafactory.getAuthentication(creds);
            //setTimeout(function(){
                authentication.send(sendSuccess,sendFail);
            //}, $rootScope.setTimeOutLoader);
        } else{
            $state.go('app.landing');
        }
        //console.log("Root Scope:" + $rootScope.isService);
   };
})

.controller('AppCtrl', function($rootScope,$scope, $stateParams,$window, $http,$timeout,$ionicPopover,datafactory, $ionicHistory, $ionicPopup, $state, $ionicLoading, $ionicPopup, $ionicTabsDelegate, $ionicSideMenuDelegate) {
    $scope.formatDate = function(dateVal){
        //console.log("Format Date:"+dateVal);
        var fullDate = new Date(dateVal);
        var month = parseInt(fullDate.getMonth()) + 1;
        var dateValue = month+"/"+fullDate.getDate()+"/"+fullDate.getFullYear();
        return ""+dateValue;
    }

    $rootScope.initialBulkSignOffCall = true;
    $rootScope.initialDBCall = true;


    $rootScope.businessFilterHide = true;
    $rootScope.regionFilterHide = true;
    $rootScope.deskFilterHide = true;
    $rootScope.dateFilterHide = true;

    $rootScope.businessDashboardFilterHide = false;
    $rootScope.regionDashboardFilterHide = false;
    $rootScope.deskDashboardFilterHide = false;
    $rootScope.dateDashboardFilterHide = false;

    $rootScope.attestationDeskFilterHide = true;
    $rootScope.attestationRegionFilterHide = true;
    $rootScope.productFilterHide = true;
    $rootScope.businessAttesationFilterHide = true;

    $rootScope.regionSummaryFilterHide = true;
    $rootScope.deskSummaryFilterHide = true;
    $rootScope.businessSummaryFilterHide = true;
    $rootScope.dateSummaryFilterHide = true;

    $rootScope.SMAttestationRegionFilterHide = true;
    $rootScope.SMProductFilterHide = true;
    $rootScope.SMDateDashboardFilterHide = true;

    $rootScope.showSummaryFilter = false;
    $rootScope.showSignOffFilter = false;
    $rootScope.showAttestationFilter = false;
    $rootScope.showDashboardFilter = true;
    $rootScope.showSMAttestFilter = false;

    $rootScope.regionDashboardFilterDisabled = false;
    $rootScope.deskDashboardFilterDisabled = false;
    $rootScope.dateDashboardFilterDisabled = false;

    $rootScope.pageName = "NONE";

    $rootScope.defaultSelectedFilters = {
        businessfilters:"",
        regionfilters: "",
        deskfilter:"",
        deskDashboardfilter:"",
        deskPrefilter:"",
        productfilter:"",
        attestationdeskfilter:"",
        datefilter: $scope.formatDate(new Date()),
        dateDashboardfilter: $scope.formatDate(new Date()),
        regionfiltersSecondary:"",
        regionfiltersAttestation:"",
        deskSummaryfilter: "",
        dateSummaryfilter: $scope.formatDate(new Date()),
        regionSMAttesationfilters: '',
        productSMFilter: '',
        dateSMAttestationfilter: $scope.formatDate(new Date())
    }

    var currFullDate = new Date();
    var currmonth = parseInt(currFullDate.getMonth()) + 1;
    $scope.currDateValue = currFullDate.getFullYear()+"-"+currmonth+"-"+currFullDate.getDate();

    $scope.logoutApp = function(){
        //console.log("Clear Cache");
        $state.go("login");
    }

    $scope.showFilterDatePicker = function(){
        var currDate = new Date();
        var currDateUTC =Date.UTC(currDate.getFullYear(),currDate.getMonth(),currDate.getDate());
        var minDateUTC = parseInt(currDateUTC) - 2592000000;
        var options = {
          date: new Date($rootScope.defaultSelectedFilters.datefilter),
          maxDate: new Date().valueOf(),
          minDate: new Date(minDateUTC).valueOf(),
          mode: 'date'
        };

        function onSuccess(date) {
            if(date !== undefined){
                $rootScope.defaultSelectedFilters.datefilter = $scope.formatDate(date);
                $scope.$apply();
            }
        }

        function onError(error) { // Android only
            //console.log('Error: ' + error);
        }

        datePicker.show(options, onSuccess, onError);
    }

     $scope.showSMFilterDatePicker = function(){
            var currDate = new Date();
            var currDateUTC =Date.UTC(currDate.getFullYear(),currDate.getMonth(),currDate.getDate());
            var minDateUTC = parseInt(currDateUTC) - 2592000000;
            var options = {
              date: new Date($rootScope.defaultSelectedFilters.dateSMAttestationfilter),
              maxDate: (new Date()).valueOf(),
              minDate: (new Date(minDateUTC)).valueOf(),
              mode: 'date'
            };

            function onSuccess(date) {
                if(date !== undefined){
                    $rootScope.defaultSelectedFilters.dateSMAttestationfilter = $scope.formatDate(date);
                    $scope.$apply();
                }
            }

            function onError(error) { // Android only
                //console.log('Error: ' + error);
            }

            datePicker.show(options, onSuccess, onError);
        }


    $scope.showSummaryFilterDatePicker = function(){
        var currDate = new Date();
        var currDateUTC =Date.UTC(currDate.getFullYear(),currDate.getMonth(),currDate.getDate());
        var minDateUTC = parseInt(currDateUTC) - 2592000000;
        var options = {
          date: $rootScope.defaultSelectedFilters.dateSummaryfilter,
          maxDate: (new Date()).valueOf(),
          minDate: (new Date(minDateUTC)).valueOf(),
          mode: 'date'
        };

        function onSuccess(date) {
            if(date !== undefined){
                $rootScope.defaultSelectedFilters.dateSummaryfilter = $scope.formatDate(date);
                $scope.$apply();
            }
        }

        function onError(error) { // Android only
            //console.log('Error: ' + error);
        }

        datePicker.show(options, onSuccess, onError);
    }

    $scope.showFilterDBDatePicker = function(){
        var currDate = new Date();
        var currDateUTC =Date.UTC(currDate.getFullYear(),currDate.getMonth(),currDate.getDate());
        var minDateUTC = parseInt(currDateUTC) - 2592000000;
        var options = {
          date: new Date($rootScope.defaultSelectedFilters.dateDashboardfilter),
          maxDate: (new Date()).valueOf(),
          minDate: (new Date(minDateUTC)).valueOf(),
          mode: 'date'
        };

        function onSuccess(date) {
            //console.log("Test"+ date);
            if(date !== undefined){
                $rootScope.defaultSelectedFilters.dateDashboardfilter = $scope.formatDate(date);
                $scope.$apply();
            }
            //alert('Selected date: ' + dateValue);
        }

        function onError(error) { // Android only
            //console.log('Error: ' + error);
        }

        datePicker.show(options, onSuccess, onError);
    }

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.processBusinessFilter = function(response){
        //console.log(response);
        //console.log("Call Type:"+ $rootScope.filterCallType)
        console.log("Dahsboard Business Call End:"+ new Date());
        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);

            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
                    && $rootScope.filterCallType === "DASHBOARD"){
                //console.log("Business Dashboard");
                $rootScope.businessDashboardfilters = JSON.parse(responseObj.responseText);
                if($rootScope.enableGlobalDashboardReport === true && $rootScope.pageName === "NONE"){
                    $rootScope.businessDashboardfilters.selected = "0";
                }
            }else{
                if(($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "DASHBOARD") && $rootScope.entitlementsData.hasQlikviewAccess === false){
                    //console.log("Business Dashboard");
                    $rootScope.businessDashboardfilters = JSON.parse(responseObj.responseText);

                    if($rootScope.filterCallType === "INITIAL" && $rootScope.enableGlobalDashboardReport === true && $rootScope.pageName === "NONE"){
                        $rootScope.businessDashboardfilters.selected = "0";
                    }
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "SUMMARY"){
                    //console.log("Business Summary");
                    $rootScope.businessfilters = JSON.parse(responseObj.responseText);
                    $rootScope.businessAttesationfilters = JSON.parse(responseObj.responseText);
                }

                if($rootScope.filterCallType === "INITIAL"){
                    $rootScope.defaultSelectedFilters.businessfilters = $rootScope.businessfilters.selected;
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "STATUSSUMMARY"){
                    $rootScope.businessSummaryfilters = JSON.parse(responseObj.responseText);
                }
            }

            //console.log(JSON.stringify($rootScope.businessDashboardfilters));
            $scope.triggerRegionFilter($rootScope.filterCallType);
        } catch(e) {
            //console.log(e);
            //console.log("catch: Invalid response object returned from call to send.");
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }

    $scope.processRegionFilter = function(response){
        //console.log(response);
        //console.log("Call Type:"+ $rootScope.filterCallType);
        console.log("Dahsboard Region Call End:"+ new Date());
        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
            var parsedData = JSON.parse(responseObj.responseText);
           if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
                    && $rootScope.filterCallType === "DASHBOARD"){
                $rootScope.regionDashboardfilters = JSON.parse(responseObj.responseText);
            }else{
               if($rootScope.filterCallType === "INITIAL"){
                    $rootScope.defaultSelectedFilters.regionfiltersSecondary = parsedData.selected;
                    $rootScope.defaultSelectedFilters.regionfilters = parsedData.selected;
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "SUMMARY"){
                    $rootScope.regionfilters = JSON.parse(responseObj.responseText);
                    $rootScope.regionAttesationfilters = JSON.parse(responseObj.responseText);
                }

                if(($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "DASHBOARD") && $rootScope.entitlementsData.hasQlikviewAccess === false){
                    $rootScope.regionDashboardfilters = JSON.parse(responseObj.responseText);
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "STATUSSUMMARY"){
                    $rootScope.regionSummaryfilters = JSON.parse(responseObj.responseText);
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "SMATTESTATION"){
                    $rootScope.regionSMAttesationfilters = JSON.parse(responseObj.responseText);
                }
            }


            //console.log(JSON.stringify(parsedData));
            $scope.triggerDeskFilter($rootScope.filterCallType);
        } catch(e) {
            //console.log(e);
            //console.log("catch: Invalid response object returned from call to send.");
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }

    $scope.processAttestationRegionFilter = function(response){
        console.log("Attesation Business Region Filter Call End:"+ new Date());
        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
            var parsedData = JSON.parse(responseObj.responseText);
            $rootScope.regionAttesationfilters = JSON.parse(responseObj.responseText);
            $scope.triggerAttestationRegionFilter();
        } catch(e) {
            //console.log(e);
            //console.log("catch: Invalid response object returned from call to send.");
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }

    $scope.processDeskFilter = function(response){
        //console.log(response);
        //console.log("Call Type:"+ $rootScope.filterCallType);
        console.log("Dahsboard Desk Call End:"+ new Date());
        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
            var formatData = JSON.parse(responseObj.responseText);
            var selectedId = [];
            //console.log(JSON.stringify(formatData));
            for(var i in formatData){
                for(var j in formatData[i].children){
                    selectedId.push(formatData[i].children[j].id)
                    formatData[i].children[j].deskStatus = true;
                }
            }

            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
                    && $rootScope.filterCallType === "DASHBOARD"){
                $rootScope.deskDashboardfilters = formatData;
                $rootScope.defaultSelectedFilters.deskDashboardfilter = selectedId.join(",");

                if($rootScope.businessDashboardfilters.selected === "0"){
                    $rootScope.regionDashboardFilterDisabled = true;
                    $rootScope.deskDashboardFilterDisabled = true;
                    $rootScope.dateDashboardFilterDisabled = true;
                    $ionicTabsDelegate.select(0);
                } else{
                    $rootScope.regionDashboardFilterDisabled = false;
                    $rootScope.deskDashboardFilterDisabled = false;
                    $rootScope.dateDashboardFilterDisabled = false;
                    $ionicTabsDelegate.select(0);
                }

                $scope.deskCheckAllStatus = true;
                $scope.deskCheckAllDasboardStatus = true;
                $scope.deskSummaryCheckAllStatus = true;
                $rootScope.hideLoading();
                if($rootScope.initialDBCall === true){
                    //$scope.applyBulkSignoff();
                    //$rootScope.$emit("callDashboardCall", {});
                    $rootScope.showLoading();
                }
            }else{
                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "SUMMARY"){
                    $rootScope.deskfilters = formatData;
                    $rootScope.defaultSelectedFilters.deskfilter = selectedId.join(",");
                    $rootScope.defaultSelectedFilters.deskPrefilter = selectedId.join(",");
                    //console.log("Desk Summary");
                }

                if(($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "DASHBOARD") && $rootScope.entitlementsData.hasQlikviewAccess === false){
                    $rootScope.deskDashboardfilters = formatData;
                    $rootScope.defaultSelectedFilters.deskDashboardfilter = selectedId.join(",");
                    //console.log("Desk Dashboard");
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "STATUSSUMMARY"){
                    $rootScope.deskSummaryfilters = formatData;
                    $rootScope.defaultSelectedFilters.deskSummaryfilter = selectedId.join(",");
                    //console.log("Desk Dashboard");
                }
                //console.log($rootScope.defaultSelectedFilters)
                $scope.deskCheckAllStatus = true;
                $scope.deskCheckAllDasboardStatus = true;
                $scope.deskSummaryCheckAllStatus = true;
                $rootScope.hideLoading();
                if($rootScope.initialDBCall === true){
                    //$scope.applyBulkSignoff();
                    //$rootScope.$emit("callDashboardCall", {});
                    $rootScope.showLoading();
                }

                if(($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "DASHBOARD") && $rootScope.entitlementsData.hasQlikviewAccess === false){
                    if($rootScope.businessDashboardfilters.selected === "0"){
                        $rootScope.regionDashboardFilterDisabled = true;
                        $rootScope.deskDashboardFilterDisabled = true;
                        $rootScope.dateDashboardFilterDisabled = true;
                        $ionicTabsDelegate.select(0);
                    } else{
                        $rootScope.regionDashboardFilterDisabled = false;
                        $rootScope.deskDashboardFilterDisabled = false;
                        $rootScope.dateDashboardFilterDisabled = false;
                        $ionicTabsDelegate.select(0);
                    }
                }

                if($rootScope.entitlementsData.triggeredSeparateFilter === true && $rootScope.pageName != "NONE"){
                    if($rootScope.pageName === "STATUSSUMMARY"){
                        $rootScope.entitlementsData.triggeredSeparateFilter = false;
                        $rootScope.$emit("callSummaryStatusCall", {});
                    }

                    if($rootScope.pageName === "ATTESTATION"){
                        $rootScope.entitlementsData.triggeredSeparateFilter = false;
                        $rootScope.$emit("callAttesationDefaultCall", {});
                    }

                    if($rootScope.pageName === "SUMMARY"){
                        $rootScope.entitlementsData.triggeredSeparateFilter = false;
                        $rootScope.$emit("callBulksignoffCall", {});
                    }

                    if($rootScope.pageName === "SMATTESTATION"){
                        $rootScope.entitlementsData.triggeredSeparateFilter = false;
                        $rootScope.$emit("loadSMFilterApply", {
                            type: "FIRST"
                        });
                    }
                }
            }
        } catch(e) {
            //console.log(e);
            //console.log("catch: Invalid response object returned from call to send.");
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }

    $scope.processErrorServiceCall = function(response){
        //console.log(response);
        //console.log("Filter Service Request Fail");
        $rootScope.hideLoading();
        $scope.showFailPopUp('E104');
    }

    $scope.showDatePicker = function(){
        var options = {
          date: new Date(),
          mode: 'date'
        };

        function onSuccess(date) {
            alert('Selected date: ' + date);
        }

        function onError(error) { // Android only
            alert('Error: ' + error);
        }

        datePicker.show(options, onSuccess, onError);
    }

    $scope.triggerBusinessFilter = function(callType){
        $rootScope.filterCallType = callType;
        //console.log("Calling Business Filter");
        console.log("Dashboard Business Call Start:"+ new Date());
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var paramForBusiness = {
                    "uid": (($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"":$rootScope.entitlementsData.userId,
                    "cType":"COMBO",
                    "cName":(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"QLIK_VIEW_BUSINESS_LINE":"BUSINESS_LINE",
                    "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
            //console.log(JSON.stringify(paramForBusiness));
            var businessFilterDetail = datafactory.getBusinessFilter(paramForBusiness);
            setTimeout(function(){
                businessFilterDetail.send($scope.processBusinessFilter,$scope.processErrorServiceCall);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.triggerAllOptions = function(checkOption){
        $scope.deskCheckAllStatus = checkOption;
        for(var i in $rootScope.deskfilters){
            for(var j in $rootScope.deskfilters[i].children){
                $rootScope.deskfilters[i].children[j].deskStatus = checkOption;
            }
        }
    }

    $scope.setCurrentCheckBox = function(checkOption, checkId){
        ////console.log(checkId);
        for(var i in $rootScope.deskfilters){
            for(var j in $rootScope.deskfilters[i].children){
                if($rootScope.deskfilters[i].children[j].id == checkId){
                    //console.log($rootScope.deskfilters[i].children[j].id,+","+checkId+","+checkOption);
                    $rootScope.deskfilters[i].children[j].deskStatus = checkOption;
                }
            }
        }
    }

    $scope.triggerAllOptionsDashboard = function(checkOption){
        $scope.deskCheckAllDasboardStatus = checkOption;
        //console.log("Checkoption:"+checkOption);
        for(var i in $rootScope.deskDashboardfilters){
            for(var j in $rootScope.deskDashboardfilters[i].children){
                $rootScope.deskDashboardfilters[i].children[j].deskStatus = checkOption;
            }
        }
    }

    $scope.setCurrentCheckBoxDashboard = function(checkOption, checkId){
        ////console.log(checkId);
        for(var i in $rootScope.deskDashboardfilters){
            for(var j in $rootScope.deskDashboardfilters[i].children){
                if($rootScope.deskDashboardfilters[i].children[j].id == checkId){
                    //console.log($rootScope.deskDashboardfilters[i].children[j].id,+","+checkId+","+checkOption);
                    $rootScope.deskDashboardfilters[i].children[j].deskStatus = checkOption;
                }
            }
        }
    }

    $scope.triggerAllOptionsSummary = function(checkOption){
        $scope.deskCheckSummaryAllStatus = checkOption;
        for(var i in $rootScope.deskSummaryfilters){
            for(var j in $rootScope.deskSummaryfilters[i].children){
                $rootScope.deskSummaryfilters[i].children[j].deskStatus = checkOption;
            }
        }
    }

    $scope.setCurrentCheckBoxSummary= function(checkOption, checkId){
        ////console.log(checkId);
        for(var i in $rootScope.deskSummaryfilters){
            for(var j in $rootScope.deskSummaryfilters[i].children){
                if($rootScope.deskSummaryfilters[i].children[j].id == checkId){
                    //console.log($rootScope.deskSummaryfilters[i].children[j].id,+","+checkId+","+checkOption);
                    $rootScope.deskSummaryfilters[i].children[j].deskStatus = checkOption;
                }
            }
        }
    }

    $scope.triggerRegionFilter = function(callType){
        $rootScope.filterCallType = callType;
        //console.log("Calling Region Filter");
        //console.log($scope.businessDashboardfilters);
        console.log("Dashboard Region Call Start:"+ new Date());
        var BUSINESSID;
        if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType === "DASHBOARD"){
            BUSINESSID = $scope.businessDashboardfilters.selected;
        } else if(callType === "INITIAL" || callType === "SUMMARY"){
            BUSINESSID = $scope.businessfilters.selected;
        } else if(callType === "DASHBOARD"){
            BUSINESSID = $scope.businessDashboardfilters.selected;
        } else if(callType === "STATUSSUMMARY"){
            BUSINESSID = $scope.businessSummaryfilters.selected;
        } else{
            BUSINESSID = $scope.businessfilters.selected;
        }
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var paramForRegion = {
                //"uid": (($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"":$rootScope.entitlementsData.userId,
                "cType":"COMBO",
                //"cName":"REGION",
                "cName":(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"QLIK_VIEW_REGION":"REGION",
                "BUSINESS_LINE":BUSINESSID,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD"){

            } else{
                paramForRegion.uid = $rootScope.entitlementsData.userId;
            }
            console.log(JSON.stringify(paramForRegion));

            var regionFilterDetail = datafactory.getRegionFilter(paramForRegion);
            setTimeout(function(){
                regionFilterDetail.send($scope.processRegionFilter,$scope.processErrorServiceCall);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.triggerDeskFilter = function(callType){
        //console.log("Calling Desk Filter");
        console.log("Dashboard Desk Call Start:"+ new Date());
        $rootScope.filterCallType = callType;
        if($rootScope.isService === true){
            $rootScope.showLoading();

            var REGIONID;

            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType === "DASHBOARD"){
                REGIONID = $scope.regionDashboardfilters.selected;
            } else if(callType === "INITIAL" || callType === "SUMMARY"){
                REGIONID = $scope.regionfilters.selected;
            } else if(callType === "DASHBOARD"){
                REGIONID = $scope.regionDashboardfilters.selected;
            } else if(callType === "STATUSSUMMARY"){
                REGIONID = $scope.regionSummaryfilters.selected;
            } else{
                REGIONID = $scope.regionfilters.selected;
            }
            var UID, CNAME;
            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD"){
                UID = "";
                CNAME = "QLIK_VIEW_DESK";
            } else{
                UID = $rootScope.entitlementsData.userId;
                CNAME = "DESK_TREE";
            }
            var paramForDesk = {
                "uid": UID,
                "cType":"tree",
                "cName":CNAME,
                "REGION_ID":REGIONID,
                "DESK_ID":""
            };
            console.log(JSON.stringify(paramForDesk));
            var deskFilterDetail = datafactory.getDeskFilter(paramForDesk);
            setTimeout(function(){
                deskFilterDetail.send($scope.processDeskFilter,$scope.processErrorServiceCall);
            }, $rootScope.setTimeOutLoader);

        }
    }
    if($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true"){
        //console.log("QLIKVIEW FILTER CALL INTIATE");
        $scope.triggerBusinessFilter("DASHBOARD");
    } else{
        //console.log("NORMAL FILTER CALL INTIATE");
        $scope.triggerBusinessFilter("INITIAL");
    }


    $rootScope.$on("triggerFreshFilter", function(eventObj,typeCall){
       //console.log("Trigger Fresh Filter");
       //console.log(typeCall);
       $scope.triggerBusinessFilter(typeCall);
    });

    $scope.applyFilter = function(){
        var selectedId = new Array();
        for(var i in $rootScope.deskfilters){
            for(var j in $rootScope.deskfilters[i].children){
                if($rootScope.deskfilters[i].children[j].deskStatus === true || $rootScope.deskfilters[i].children[j].deskStatus === 'true'){
                    ////console.log($rootScope.deskfilters[i].children[j].deskStatus +","+ $rootScope.deskfilters[i].children[j].id);
                    selectedId.push($rootScope.deskfilters[i].children[j].id);
                    ////console.log(selectedId);
                }
            }
        }
        //console.log(selectedId.join(","));
        //console.log($rootScope.businessfilters.selected);
        //console.log($rootScope.regionfilters.selected);
        $rootScope.defaultSelectedFilters.deskfilter = selectedId.join(",");
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var creds = {
                "uid": "",
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","deskId":"'+$rootScope.defaultSelectedFilters.deskfilter+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}')
            };

            //console.log(unescape(creds.DASH_REQ));

            $scope.sendSuccess = function(response) {
                //console.log(response);
                console.log("Bulk Sign off Filter Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var parsedData = JSON.parse(responseObj.responseText)
                    var formatData = parsedData.data;
                    for(var i in formatData){
                        for(var j in formatData[i].records){
                            var uncmntCount = parseInt(formatData[i].records[j].pendingSignoff);
                            var totalCount = parseInt(formatData[i].records[j].count) -  parseInt(formatData[i].records[j].pendingSignoff);
                            formatData[i].records[j].dataset = [
                                {
                                    "key":uncmntCount,
                                    "y": uncmntCount
                                },
                                {
                                    "key":totalCount,
                                    "y": totalCount
                                }
                            ];
                            formatData[i].records[j].labels = ["A","B"];
                            formatData[i].records[j].colours = ["#444","#FF3019"];
                            var exceptionsWidth = 0;
                            var greenTotalVal = formatData[i].records[j].greenTotal.toString();
                            var amberTotalVal = formatData[i].records[j].amberTotal.toString();
                            var redTotalVal = formatData[i].records[j].redTotal.toString();
                            var totalVal = (parseInt(formatData[i].records[j].greenTotal) + parseInt(formatData[i].records[j].amberTotal) + parseInt(formatData[i].records[j].redTotal)).toString();

                            if(greenTotalVal.length > exceptionsWidth){
                                exceptionsWidth = greenTotalVal.length;
                            }

                            if(amberTotalVal.length > exceptionsWidth){
                                exceptionsWidth = amberTotalVal.length;
                            }

                            if(redTotalVal.length > exceptionsWidth){
                                exceptionsWidth = redTotalVal.length;
                            }

                            formatData[i].records[j].exceptionWidth = 30;
                            formatData[i].records[j].totalWidth = 30;
                            if(exceptionsWidth >= 4){
                                formatData[i].records[j].exceptionWidth += exceptionsWidth * 3;
                            }

                            if(totalVal.length >= 4){
                                formatData[i].records[j].totalWidth += totalVal.length * 3;
                            }
                        }
                    }
                    $rootScope.defaultSelectedFilters.regionfiltersSecondary = $rootScope.regionfilters.selected;
                    ////console.log(formatData);
                    $rootScope.listData = formatData;
                    $rootScope.hideLoading();
                    $scope.$apply();
                } catch(e) {
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $scope.showFailPopUp('E110');
                    $rootScope.hideLoading();
                }

            }

            $scope.sendFail = function(response) {
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $scope.showFailPopUp('E109');
                $rootScope.hideLoading();
                //return response;
            }
            console.log("Bulk Sign off Filter Call Start:"+ new Date());
            var signOffList = datafactory.getSignoffList(creds);
            setTimeout(function(){
                signOffList.send($scope.sendSuccess,$scope.sendFail);
            }, $rootScope.setTimeOutLoader);
        }
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.triggerAttesationBusinessRegionFilter = function(callType){
        //console.log("Calling Attesartion Region Filter");
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var paramForRegion = {
                "uid": $rootScope.entitlementsData.userId,
                "cType":"COMBO",
                "cName":"REGION",
                "BUSINESS_LINE":$scope.businessAttesationfilters.selected,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
            //console.log(JSON.stringify(paramForRegion));
            console.log("Attesation Business Region Filter Call Start:"+ new Date());
            var regionFilterDetail = datafactory.getRegionFilter(paramForRegion);
            setTimeout(function(){
                regionFilterDetail.send($scope.processAttestationRegionFilter,$scope.processErrorServiceCall);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.applyAttestationFilter = function(){
        $rootScope.$emit("callAttesationCall", {});
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.triggerAttestationRegionFilter = function(){
        $rootScope.defaultSelectedFilters.regionfiltersAttestation = $rootScope.regionAttesationfilters.selected;
        $rootScope.attestationDeskFilter.selected = "";
        $rootScope.$emit("callAttesationRegionCall", {});
    }

    $scope.applyDashboardFilter = function(){
        var selectedId = new Array();
        for(var i in $rootScope.deskDashboardfilters){
            for(var j in $rootScope.deskDashboardfilters[i].children){
                if($rootScope.deskDashboardfilters[i].children[j].deskStatus === true || $rootScope.deskDashboardfilters[i].children[j].deskStatus === 'true'){
                    ////console.log($rootScope.deskfilters[i].children[j].deskStatus +","+ $rootScope.deskfilters[i].children[j].id);
                    selectedId.push($rootScope.deskDashboardfilters[i].children[j].id);
                    ////console.log(selectedId);
                }
            }
        }
        $rootScope.defaultSelectedFilters.deskDashboardfilter = selectedId.join(",");
        $rootScope.loadedExceptionByWeek = false;
        $rootScope.misDashboardCallTypeInitial = "false";
        $rootScope.$emit("callDashboardCall", {type:$rootScope.misDashboardCallTypeInitial});
        //$rootScope.$$listeners["callDashboardCall"] = [];
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.applySummaryFilter = function(){
        var selectedId = new Array();
        for(var i in $rootScope.deskSummaryfilters){
            for(var j in $rootScope.deskSummaryfilters[i].children){
                if($rootScope.deskSummaryfilters[i].children[j].deskStatus === true || $rootScope.deskSummaryfilters[i].children[j].deskStatus === 'true'){
                    ////console.log($rootScope.deskfilters[i].children[j].deskStatus +","+ $rootScope.deskfilters[i].children[j].id);
                    selectedId.push($rootScope.deskSummaryfilters[i].children[j].id);
                    ////console.log(selectedId);
                }
            }
        }
        $rootScope.defaultSelectedFilters.deskSummaryfilter = selectedId.join(",")
        $rootScope.$emit("callSummaryStatusCall", {});
        $rootScope.loadedExceptionByWeek = false;
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.resetAttestationFilter = function(){
        $rootScope.businessfilters.selected = $rootScope.defaultSelectedFilters.businessfilters;
        $rootScope.regionfilters.selected = $rootScope.defaultSelectedFilters.regionfilters;

        $rootScope.$emit("callAttesationDefaultCall", {});
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.applyBulkSignoff = function(){
        $rootScope.businessfilters.selected = $rootScope.defaultSelectedFilters.businessfilters;
        $rootScope.regionfilters.selected = $rootScope.defaultSelectedFilters.regionfilters;
        $rootScope.$emit("callBulksignoffCall", {});
    }


    $scope.resetSummaryFilter = function(){
        $rootScope.businessfilters.selected = $rootScope.defaultSelectedFilters.businessfilters;
        $rootScope.regionfilters.selected = $rootScope.defaultSelectedFilters.regionfilters;
        $rootScope.defaultSelectedFilters.dateSummaryfilter = $scope.formatDate(new Date());
        $rootScope.defaultSelectedFilters.deskSummaryfilter = $rootScope.defaultSelectedFilters.deskPrefilter;
        $rootScope.$emit("callSummaryStatusCall", {});
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.getAttestationDeskFilter = function(){
        $rootScope.showLoading();
        var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "REGION_ID":$rootScope.regionAttesationfilters.selected,
                "PRODUCT":$rootScope.productFilter.selected,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
        function attestationFilterSuccess(response){
            //console.log(response);
            console.log("Attesation Desk Filter Call End:"+ new Date());
            try {
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
                //console.log(JSON.stringify(parsedData));
                $rootScope.attestationDeskFilter = parsedData;
                $rootScope.hideLoading();
            } catch(e) {
                //console.log(e);
                //console.log("catch: Invalid response object returned from call to send.");
                $scope.showFailPopUp('E105');
                $rootScope.hideLoading();
            }
        }

        function attestationFilterFail(response){
            //console.log(response);
            //console.log("sendFail: The send request resulted in an error.");
            $scope.showFailPopUp('E104');
            $rootScope.hideLoading();
        }
        console.log("Attesation Desk Filter Call Start:"+ new Date());
        var attesationDeskFilterList = datafactory.getAttesationDeskFilter(creds);
        setTimeout(function(){
                attesationDeskFilterList.send(attestationFilterSuccess,attestationFilterFail);
            }, $rootScope.setTimeOutLoader);

    }

    $rootScope.resetDBFilterOptions = function(){
        $rootScope.businessDashboardfilters.selected = "0"
        $rootScope.defaultSelectedFilters.dateDashboardfilter = $scope.formatDate(new Date());
        $rootScope.regionDashboardFilterDisabled = true;
        $rootScope.deskDashboardFilterDisabled = true;
        $rootScope.dateDashboardFilterDisabled = true;
        $rootScope.misDashboardCallTypeInitial = "true";
        $rootScope.setDBFilterOptions("true");
    }

    $rootScope.setDBFilterOptions = function(stateCall){
        $rootScope.businessFilterHide = true;
        $rootScope.regionFilterHide = true;
        $rootScope.deskFilterHide = true;
        $rootScope.dateFilterHide = true;

        $rootScope.businessDashboardFilterHide = false;
        $rootScope.regionDashboardFilterHide = false;
        $rootScope.deskDashboardFilterHide = false;
        $rootScope.dateDashboardFilterHide = false;

        $rootScope.attestationDeskFilterHide = true;
        $rootScope.productFilterHide = true;
        $rootScope.attestationRegionFilterHide = true;
        $rootScope.businessAttesationFilterHide = true;

        $rootScope.regionSummaryFilterHide = true;
        $rootScope.deskSummaryFilterHide = true;
        $rootScope.businessSummaryFilterHide = true;
        $rootScope.dateSummaryFilterHide = true;

        $rootScope.SMAttestationRegionFilterHide = true;
        $rootScope.SMProductFilterHide = true;
        $rootScope.SMDateDashboardFilterHide = true;

        $rootScope.showSummaryFilter = false;
        $rootScope.showSignOffFilter = false;
        $rootScope.showAttestationFilter = false;
        $rootScope.showDashboardFilter = true;
        $rootScope.showSMAttestFilter = false;
        $ionicTabsDelegate.select(0);
        if(stateCall === "true"){
            $scope.applyDashboardFilter();
        }
    }

    $rootScope.resetFilterOptions = function(){
        $rootScope.regionFilterHide = false;
        $rootScope.deskFilterHide = false;
        $rootScope.businessFilterHide = false;
        $rootScope.dateFilterHide = false;

        $rootScope.businessDashboardFilterHide = true;
        $rootScope.regionDashboardFilterHide = true;
        $rootScope.deskDashboardFilterHide = true;
        $rootScope.dateDashboardFilterHide = true;

        $rootScope.attestationDeskFilterHide = true;
        $rootScope.attestationRegionFilterHide = true;
        $rootScope.productFilterHide = true;
        $rootScope.businessAttesationFilterHide = true;

        $rootScope.regionSummaryFilterHide = true;
        $rootScope.deskSummaryFilterHide = true;
        $rootScope.businessSummaryFilterHide = true;
        $rootScope.dateSummaryFilterHide = true;

        $rootScope.SMAttestationRegionFilterHide = true;
        $rootScope.SMProductFilterHide = true;
        $rootScope.SMDateDashboardFilterHide = true;

        $rootScope.showSummaryFilter = false;
        $rootScope.showSignOffFilter = true;
        $rootScope.showAttestationFilter = false;
        $rootScope.showDashboardFilter = false;
        $rootScope.showSMAttestFilter = false;
        //console.log("Called Reset Dahsboard");
        $ionicTabsDelegate.select(4);

        //$scope.applyBulkSignoff();
    }


    $rootScope.resetSummaryFilterOptions = function(){
        $rootScope.regionFilterHide = true;
        $rootScope.deskFilterHide = true;
        $rootScope.businessFilterHide = true;
        $rootScope.dateFilterHide = true;

        $rootScope.businessDashboardFilterHide = true;
        $rootScope.regionDashboardFilterHide = true;
        $rootScope.deskDashboardFilterHide = true;
        $rootScope.dateDashboardFilterHide = true;

        $rootScope.attestationDeskFilterHide = true;
        $rootScope.attestationRegionFilterHide = true;
        $rootScope.productFilterHide = true;
        $rootScope.businessAttesationFilterHide = true;

        $rootScope.regionSummaryFilterHide = false;
        $rootScope.deskSummaryFilterHide = false;
        $rootScope.businessSummaryFilterHide = false;
        $rootScope.dateSummaryFilterHide = false;

        $rootScope.SMAttestationRegionFilterHide = true;
        $rootScope.SMProductFilterHide = true;
        $rootScope.SMDateDashboardFilterHide = true;

        $rootScope.showSummaryFilter = true;
        $rootScope.showSignOffFilter = false;
        $rootScope.showAttestationFilter = false;
        $rootScope.showDashboardFilter = false;
        $rootScope.showSMAttestFilter = false;
        $ionicTabsDelegate.select(12);

        //$scope.applyBulkSignoff();
    }

    $rootScope.updateFilterOptions = function(){
        $rootScope.regionFilterHide = true;
        $rootScope.deskFilterHide = true;
        $rootScope.businessFilterHide = true;
        $rootScope.dateFilterHide = true;

        $rootScope.businessDashboardFilterHide = true;
        $rootScope.regionDashboardFilterHide = true;
        $rootScope.deskDashboardFilterHide = true;
        $rootScope.dateDashboardFilterHide = true;

        $rootScope.attestationDeskFilterHide = false;
        $rootScope.productFilterHide = false;
        $rootScope.attestationRegionFilterHide = false;
        $rootScope.businessAttesationFilterHide = false;

        $rootScope.regionSummaryFilterHide = true;
        $rootScope.deskSummaryFilterHide = true;
        $rootScope.businessSummaryFilterHide = true;
        $rootScope.dateSummaryFilterHide = true;

        $rootScope.SMAttestationRegionFilterHide = true;
        $rootScope.SMProductFilterHide = true;
        $rootScope.SMDateDashboardFilterHide = true;

        $rootScope.showSummaryFilter = false;
        $rootScope.showSignOffFilter = false;
        $rootScope.showAttestationFilter = true;
        $rootScope.showDashboardFilter = false;
        $rootScope.showSMAttestFilter = false;
        $ionicTabsDelegate.select(8);

        //$scope.resetAttestationFilter();
    }

    $rootScope.updateSignOffFilterOptions = function(){
        $rootScope.regionFilterHide = true;
        $rootScope.deskFilterHide = false;
        $rootScope.businessFilterHide = true;
        $rootScope.dateFilterHide = false;

        $rootScope.businessDashboardFilterHide = true;
        $rootScope.regionDashboardFilterHide = true;
        $rootScope.deskDashboardFilterHide = true;
        $rootScope.dateDashboardFilterHide = true;

        $rootScope.attestationDeskFilterHide = true;
        $rootScope.attestationRegionFilterHide = true;
        $rootScope.productFilterHide = true;
        $rootScope.businessAttesationFilterHide = true;

        $rootScope.regionSummaryFilterHide = true;
        $rootScope.deskSummaryFilterHide = true;
        $rootScope.businessSummaryFilterHide = true;
        $rootScope.dateSummaryFilterHide = true;

        $rootScope.SMAttestationRegionFilterHide = true;
        $rootScope.SMProductFilterHide = true;
        $rootScope.SMDateDashboardFilterHide = true;

        $rootScope.showSummaryFilter = false;
        $rootScope.showSignOffFilter = true;
        $rootScope.showAttestationFilter = false;
        $rootScope.showDashboardFilter = false;
        $rootScope.showSMAttestFilter = false;
        $ionicTabsDelegate.select(6);
    }

    $rootScope.updateSAFilterOptions = function() {
        $rootScope.regionFilterHide = true;
        $rootScope.deskFilterHide = true;
        $rootScope.businessFilterHide = true;
        $rootScope.dateFilterHide = true;

        $rootScope.businessDashboardFilterHide = true;
        $rootScope.regionDashboardFilterHide = true;
        $rootScope.deskDashboardFilterHide = true;
        $rootScope.dateDashboardFilterHide = true;

        $rootScope.attestationDeskFilterHide = true;
        $rootScope.productFilterHide = true;
        $rootScope.attestationRegionFilterHide = true;
        $rootScope.businessAttesationFilterHide = true;

        $rootScope.regionSummaryFilterHide = true;
        $rootScope.deskSummaryFilterHide = true;
        $rootScope.businessSummaryFilterHide = true;
        $rootScope.dateSummaryFilterHide = true;

        $rootScope.SMAttestationRegionFilterHide = false;
        $rootScope.SMProductFilterHide = false;
        $rootScope.SMDateDashboardFilterHide = false;

        $rootScope.showSignOffFilter = false;
        $rootScope.showAttestationFilter = false;
        $rootScope.showDashboardFilter = false;
        $rootScope.showSMAttestFilter = true;
        $ionicTabsDelegate.select(16);
    }
        $rootScope.applySMAttestFilter = function() {
            $rootScope.$emit("loadSMFilterApply", {
                type: "Apply"
            });
            $ionicSideMenuDelegate.toggleRight(0);
        }
        $scope.triggerSMAttestationRegionFilter = function() {
            $rootScope.$emit("loadSMFilterApply", {
                type: "Product"
            });
        }
        $rootScope.resetSMFilterOptions = function() {
            $rootScope.$emit("loadSMFilterApply", {
                type: "INITIAL"
            });
            $ionicSideMenuDelegate.toggleRight(0);
        }

    $scope.onClickBack = function(){
        //console.log($state);
        if($state.current.name === "app.details"){
           $rootScope.resetFilterOptions();
           $state.go("app.metrics");
        } else if($state.current.name === "app.smEscalation"){
           $rootScope.updateSAFilterOptions();
           $state.go("app.smAttestation");
        } else{
            $rootScope.setDBFilterOptions("true");
            $state.go('app.landing');
        }
    }
})

.controller('LandingCtrl', function($scope,$rootScope,$window,$ionicNavBarDelegate,$state,datafactory, $ionicLoading, $http, $ionicPopup, $ionicPopover) {

    $scope.slideoptions = { loop: false, effect: 'fade', speed: 500 };
    $rootScope.loadedExceptionByWeek = false;
    $scope.pielabels = ["Awaiting Report","No Exceptions"];
    $scope.pieData = [25,36];
    $ionicNavBarDelegate.title('some other title');
    $scope.redAmberData1 = [];
    $scope.outStandingData1 = [];

    $scope.isIpad = $rootScope.isIpad;

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.createExceptionsDashboard1 = function(){

        $scope.outStandingOptions1 = {
            chart: {
                type: 'pieChart',
                donut: true,
                donutRatio: 0.4,
                color: ['#00b9d4', '#cccccc'],
                height: 170,
                width: $window.innerWidth/2,
                margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: -15
                },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                showControls: false,
                showLegend: false,
                pie: {
                    startAngle: function(d) { return d.startAngle -Math.PI/2 },
                    endAngle: function(d) { return d.endAngle -Math.PI/2 }
                },
                duration: 500,
                legend: {
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                }
            }
        };

        $scope.redAmberOptions1 = {
            chart: {
                type: 'pieChart',
                donut: true,
                donutRatio: 0.4,
                labelsOutside: false,
                color: ['#bb0000','#ff8a00','#cccccc'],
                height: 170,
                width: $window.innerWidth/2,
                margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: -15
                },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                showControls: false,
                showLegend: false,
                pie: {
                    startAngle: function(d) { return d.startAngle -Math.PI/2 },
                    endAngle: function(d) { return d.endAngle -Math.PI/2 }
                },
                duration: 500,
                legend: {
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                }
            }
        };
    }

    $scope.createTopDials=function(outstandingData,redAmberData)
    {

        if(redAmberData.length > 0){
            var redCount = parseInt(redAmberData[0].redexceptions);
            var amberCount = parseInt(redAmberData[0].amberexceptions);
            var totalExp = parseInt(redAmberData[0].totalexceptions);

            var redPercent = parseInt(redCount/totalExp*100);
            var amberPercent = parseInt(amberCount/totalExp*100);
            var remainigPercent = parseInt(100-(redPercent+amberPercent));

            $scope.redAmberData1 =[
            {
                    key: redPercent+'%',
                    y: redPercent
                },
                {
                    key: amberPercent+'%',
                    y: amberPercent
                },
                {
                    key: remainigPercent+'%',
                    y: remainigPercent
                }
            ];
        } else{
            $scope.redAmberData1 = [];
        }

        if(outstandingData.length > 0){
            var exceptionsCount =  outstandingData[0].totalexceptions;
            var pendigCount =     outstandingData[0].pendingCommentary;

            var pendingPercent = parseInt(pendigCount/exceptionsCount * 100);


            $scope.outStandingData1=[

                {
                    key: 100-pendingPercent+'%',
                    y: 100-pendingPercent
                },{
                   key: pendingPercent+'%',
                   y: pendingPercent
                }
            ];
        } else{
            $scope.outStandingData1 = [];
        }
    }


    $scope.createPendingSingoffProgress = function(pendingData)
    {
        $scope.pendingSignOffCount = parseInt(pendingData.pendingSignoff);
        $scope.totalExceptionCount = parseInt(pendingData.totalexceptions);
        $scope.pendingSignoffPercent =  parseInt(($scope.pendingSignOffCount/$scope.totalExceptionCount) *100);
        //console.log("pendingSignoffPecent "+$scope.pendingSignoffPercent);
    }

    $scope.lineChart = function(dataset){
        //console.log(dataset);
        var dataArray = [];
        var xValues = [];
        var maxValue = 0;
        for(i=0;i<dataset.length;i++)
        {
            var dateParse = dataset[i].reportDate.split("/");
            if(dateParse.length === 3){
                var asDate = Date.UTC(dateParse[0],parseInt(dateParse[1])-1,parseInt(dateParse[2]))//new Date();
            } else{
                var currDate = new Date();
                var asDate = Date.UTC(currDate.getFullYear(),parseInt(dateParse[0])-1,parseInt(dateParse[1]))//new Date();
            }
            if(parseInt(dataset[i].exceptions) > maxValue){
                maxValue = dataset[i].exceptions;
            }
            //console.log("Max Line Value:"+maxValue)
            //console.log(asDate);
            xValues.push(asDate);
            dataArray.push([asDate,parseInt(dataset[i].exceptions)]);
        }

        $scope.linechartoptions = {
            chart: {
                type: 'lineChart',
                height: 220,
                width: $window.innerWidth,
                margin : {
                    top: 10,
                    right: 40,
                    bottom: 20,
                    left: 55
                },
                x: function(d){ return d[0]; },
                y: function(d){ return d[1]; },
                /*average: function(d) { return d.mean/100; },*/

                color: d3.scale.category10().range(),
                duration: 300,
                useInteractiveGuideline: false,
                clipVoronoi: false,
                showLegend: false,
                forceY: [0, 5],
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {

                        var nDate = new Date(d);
                        var mnthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        ////console.log(nDate);
                        ////console.log(parseInt(nDate.getDate()) +"-"+ (parseInt(nDate.getMonth())+1) +"-"+ nDate.getFullYear());
                        return parseInt(nDate.getDate()) +"-"+ mnthArray[nDate.getMonth()]//(parseInt(nDate.getMonth())+1); // +"-"+ nDate.getFullYear(); //d3.date.format('%h/%m/%s')(new Date(d))
                    },
                    showMaxMin: false,
                    tickValues: xValues,
                    staggerLabels: false
                },

                yAxis: {
                    axisLabel: 'Y Axis',
                    tickFormat: function(d){
                        return d;
                    },
                    axisLabelDistance: 20
                }
            }
        };

        $scope.linechartdata = [
            {
            key:"Exceptions",
            //values: [[0,44],[1,20]],
           // values: [[2016/6/16,45],[2016/6/24,45],[2016/7/1,15],[2016/7/8,10],[2016/7/15,25],[2016/7/22,30]],
            values:dataArray,
            mean: 0
            }
        ];
    }

    $ionicPopover.fromTemplateUrl('templates/iPhone/dashboard-popover.html', {
            scope: $scope,
            options: {
                cssClass: 'dashboard-popup'
            }
        }).then(function(popover) {
            $scope.myDetailsPopup = popover;
        });

    $scope.horzBarChart = function(maxLength){
        $scope.horzbaroptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 220,
                margin : {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: maxLength * 7
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                showLegend: false,
                duration: 500,
                valueFormat: function(d){
                    return d;
                },
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Values',
                    tickFormat: function(d){
                        return d3.format(',r')(d);
                    }
                }
            }
        };
    }


    $scope.createCategoryGraph =function(labelset,dataset)
    {

        var dataArray = [];
        for (var i = 0; i < 10; i++) { //labelset.length
            dataArray.push({"label":labelset[i],"value":dataset[i]})
        };

        $scope.horzbardata =[{
                "values": dataArray
                }];
    } //"key": "","color": "#09D8D2",

    $scope.showDetailsPopup = function($event,currentDetailData){
        $scope.currentData = currentDetailData;
        $scope.myDetailsPopup.show();
    }

    $scope.closeDetailsPopup = function(){
        $scope.myDetailsPopup.hide();
    }

    $scope.callChangeFunction = function(index){
            // note: the indexes are 0-based
            //console.log("IONIC SLIDES");
            //console.log(index);
            if(index === 1 || index === "1"){
                if($rootScope.isService === true){
                    if($rootScope.loadedExceptionByWeek === false){
                        $rootScope.showLoading();
                        var regionId = $rootScope.regionDashboardfilters.selected;
                        var deskIds = $rootScope.defaultSelectedFilters.deskDashboardfilter;
                        var dateVal = $scope.formatDate($rootScope.defaultSelectedFilters.dateDashboardfilter);
                        var businessId = $rootScope.businessDashboardfilters.selected;
                        if($rootScope.businessDashboardfilters.selected == "0"){
                            regionId = "";
                            deskIds = "";
                            //dateVal = "";
                            businessId = "";
                        }
                        var creds = {
                            "uid": $rootScope.entitlementsData.userId,
                            "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+regionId+'","deskId":"'+deskIds+'","date":"'+dateVal+'","businessLine":"'+businessId+'"}')

                        };
                        //console.log(unescape(creds.DASH_REQ));
                        $scope.sendDBByWeekCallSuccess = function(response) {
                            console.log("dashboardExceptionWeekList Call End:"+ new Date());
                            //console.log(response);
                            try {
                                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                                var formatData = JSON.parse(responseObj.responseText);
                                var recordData = formatData;
                                $rootScope.loadedExceptionByWeek = true;
                                //console.log(recordData);
                                //console.log(recordData.exceptionsByMonth);
                                $scope.lineChart(recordData.exceptionsByMonth);
                            } catch(e) {
                                //console.log(e);
                                //console.log("catch: Invalid response object returned from call to send.");
                                $scope.showFailPopUp("E108");
                            }
                            $rootScope.hideLoading();
                            $scope.$broadcast('scroll.refreshComplete');
                        }

                        $scope.sendDBByWeekCallFail = function(response) {
                            //console.log(response);
                            //console.log("sendFail: The send request resulted in an error.");
                            $rootScope.hideLoading();
                            $scope.showFailPopUp("E106");
                            $scope.$broadcast('scroll.refreshComplete');
                            //return response;
                        }
                        console.log("dashboardExceptionWeekList Call Start:"+ new Date());
                        var dashboardExceptionWeekList = datafactory.getExceptionByWeekDashboard(creds);
                        setTimeout(function(){
                            dashboardExceptionWeekList.send($scope.sendDBByWeekCallSuccess,$scope.sendDBByWeekCallFail);
                        }, $rootScope.setTimeOutLoader);
                    }
                }
            }
        }

    $scope.renderDashboardGraph = function(formatData,scopeApply){
        var productData = [], productDataLabel = [];
        var categoryData = [], categoryDataLabel = []; var categoryGraphData = [];
        var functionData = [], functionDataLabel = [];

        var parsedFunctionData=[];
        var parsedManagerData=[];
        var parsedProductData=[];
        var parsedExceptionsByMonth = [];
        var productMaxLength = 0, functionMaxLength = 0, categoryMaxLength = 0;

        var parsedRedAmberExceptions = [];
        var parsedOutstandingExceptions = [];
        var parsedPendingSignoff = [];
        var recordData = formatData;
        //console.log(recordData);
        parsedFunctionData = recordData.exceptionsByFunction;
        parsedProductData = recordData.exceptionsByProduct;
        parsedManagerData = recordData.exceptionsByManager;
        //parsedExceptionsByMonth = recordData.exceptionsByMonth;
        parsedPendingSignoff = recordData.pendingSignoff;

        if(recordData.outstandingExceptions != undefined && recordData.outstandingExceptions.length > 0){
        parsedOutstandingExceptions = recordData.outstandingExceptions;
        //console.log("Show OutStanding");
        $scope.showOutStandingExceptions = true;
        } else{
        //console.log("Dont Show OutStanding");
        $scope.showOutStandingExceptions = false;
        }

        if(recordData.exceptionsRedAndAmber != undefined && recordData.exceptionsRedAndAmber.length > 0 && recordData.exceptionsRedAndAmber[0].totalexceptions != ""){
        parsedRedAmberExceptions = recordData.exceptionsRedAndAmber;
        //console.log("Show RedAmber");
        $scope.showRedAmberExceptions = true;
        } else{
        //console.log("Dont Show ReDAmber")
        $scope.showRedAmberExceptions = false;
        }

        if(recordData.pendingSignoff != undefined && recordData.pendingSignoff.length > 0 && recordData.pendingSignoff[0].totalexceptions != ""){
        //console.log("Show Pending Sign off");
            $scope.showPendingSignOffExceptions = true;
        } else{
        //console.log("Dont Show Pending Sign off");
            $scope.showPendingSignOffExceptions = false;
        }

        if(recordData.exceptionsByFunction != undefined && recordData.exceptionsByFunction.length > 0){
        //console.log("Show Exception By Function");
            $scope.showExceptionsByFunction = true;
        } else{
        //console.log("Dont Show Exception By Function");
            $scope.showExceptionsByFunction = false;
        }

        if(recordData.exceptionsByProduct != undefined && recordData.exceptionsByProduct.length > 0){
            $scope.showExceptionsByProduct = true;
        } else{
            $scope.showExceptionsByProduct = false;
        }

        if(recordData.exceptionsByManager != undefined && recordData.exceptionsByManager.length > 0){
            $scope.showExceptionsByManager = true;
        } else{
            $scope.showExceptionsByManager = false;
        }

        for(var i in recordData.exceptionsByCategory){
            categoryDataLabel.push(recordData.exceptionsByCategory[i].ReportCategory);
            categoryData.push([i, parseInt(recordData.exceptionsByCategory[i].exceptions)]);
            categoryGraphData.push(parseInt(recordData.exceptionsByCategory[i].exceptions));
            if(recordData.exceptionsByCategory[i].ReportCategory.length > categoryMaxLength){
                categoryMaxLength = recordData.exceptionsByCategory[i].ReportCategory.length;
            }
        }

        //console.log(productMaxLength);
        //console.log(functionMaxLength);
        var totalRecord  = parseInt(formatData.totalGreenExceptions) + parseInt(formatData.totalAmberExceptions) + parseInt(formatData.totalredExceptions);
        $scope.dbProductData = productData;
        $scope.dbFunctionData = functionData;
        $scope.productMaxLength = productMaxLength;
        $scope.functionMaxLength = functionMaxLength;

        $scope.productListData = parsedProductData;
        $scope.functionListData = parsedFunctionData;
        $scope.managerListData = parsedManagerData;
        //$scope.$apply();
        //console.log("ExceptionByManagerStatus:"+$scope.showExceptionsByManager);
        //console.log(parsedManagerData);
        $scope.createExceptionsDashboard1();
        $scope.createTopDials(parsedOutstandingExceptions,parsedRedAmberExceptions);
        if(recordData.pendingSignoff != undefined && recordData.pendingSignoff.length > 0 && recordData.pendingSignoff[0].totalexceptions != ""){
            //console.log("Calling PendingSignoff");
            $scope.createPendingSingoffProgress(parsedPendingSignoff[0]);
        }
        //$scope.lineChart(parsedExceptionsByMonth);
        $scope.horzBarChart(categoryMaxLength);
        $scope.createCategoryGraph(categoryDataLabel,categoryGraphData);
        $rootScope.initialDBCall = false;
        if(scopeApply === true){
            $scope.$apply();
        }
        $rootScope.hideLoading();
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.callLocalOrService = function(isService, callTypeInitial){
        //console.log("DB Call");

        console.log("Dahsboard Call Start:"+ new Date());
        if(isService === true){
            $rootScope.showLoading();
            if(callTypeInitial === 'true'){
                var regionId = "";
                var deskIds = "";
                var dateVal = $scope.formatDate($rootScope.defaultSelectedFilters.dateDashboardfilter);
                var businessId = "";
            } else{
                var regionId = $rootScope.regionDashboardfilters.selected;
                var deskIds = $rootScope.defaultSelectedFilters.deskDashboardfilter;
                var dateVal = $scope.formatDate($rootScope.defaultSelectedFilters.dateDashboardfilter);
                var businessId = $rootScope.businessDashboardfilters.selected;

                if($rootScope.businessDashboardfilters.selected == "0"){
                    regionId = "";
                    deskIds = "";
                    //dateVal = "";
                    businessId = "";
                }
            }

            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+regionId+'","deskId":"'+deskIds+'","date":"'+dateVal+'","businessLine":"'+businessId+'"}')

            };
            console.log(unescape(creds.DASH_REQ));
            $scope.sendDBCallSuccess = function(response) {
                console.log("Dashboard Call End:"+ new Date());
                //console.log(response);
                try {
                    $scope.outStandingOptions1 = {};
                    $scope.outStandingData1 = [];
                    $scope.redAmberOptions1 = {};
                    $scope.redAmberData1 = [];
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    formatData.currDate = new Date();
                    ////console.log(JSON.stringify(formatData));
                    $scope.dashboardRawData = formatData;
                    $scope.renderDashboardGraph(formatData, false);
                    $rootScope.loadedExceptionByWeek = false;
                } catch(e) {
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $scope.showFailPopUp("E107");
                }
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }

            $scope.sendDBCallFail = function(response) {
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $rootScope.hideLoading();
                $scope.showFailPopUp("E106");
                $rootScope.initialDBCall = false;
                $scope.$broadcast('scroll.refreshComplete');
                //return response;
            }

            var dashboardList = datafactory.getDashboard(creds);
            setTimeout(function(){
                dashboardList.send($scope.sendDBCallSuccess,$scope.sendDBCallFail);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $rootScope.$on("callDashboardCall", function(){
        //console.log("RootScope On");
       $scope.callLocalOrService($rootScope.isService, 'false');
    });

    $scope.goDetails = function(){
        $state.go('app.details');
    };
})

.controller('DetailsCtrl', function($rootScope,$scope, $stateParams, $http,$timeout,$ionicPopover,datafactory, $ionicPopup, $window, $ionicLoading, $ionicPopup, $ionicTabsDelegate) {

    $rootScope.signOffComments = "";
    $ionicPopover.fromTemplateUrl('templates/iPhone/signoff-popover.html', {
      scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.showMessagePopUp = function(message){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Message',
            template: message,
            okText: 'Ok'
        });
    }

    $scope.checkBoxStatus = function(checkOption, cateDeskId){
        for(var i in $scope.playlists){
            if(cateDeskId == $scope.playlists[i].intCatDeskId){
                $scope.playlists[i].checkboxStatus = checkOption;
            }
        }
    }

    $scope.parseInt = parseInt;

    $scope.callLocalOrService = function(isService){
        if(isService){
            $rootScope.showLoading();
            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "categoryId": $rootScope.listCategoryId,
                "vcrReportCat": $rootScope.listCategoryName,
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","deskId":"'+$rootScope.defaultSelectedFilters.deskfilter+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'","intReportCatId":"'+$rootScope.listCategoryName+'","intCategory":"'+$rootScope.listCategoryId+'"}')

            };

            //console.log(unescape(creds.DASH_REQ));

            $scope.sendSuccess = function(response) {
                //console.log(response);
                console.log("Bulk Signoff Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    for(var i in formatData.records){
                        formatData.records[i].checkboxStatus = false;
                        var flagCheckClass = "";
                        var flagCheck = (formatData.records[i].pendingSignoff === "1")?false:true;
                        if(formatData.records[i].EligibleUser === 0 || formatData.records[i].EligibleUser === "0"){
                            formatData.records[i].pendingSignoff = "0";
                            flagCheck = true;
                        }

                        switch(formatData.records[i].pendingSignoff){
                            case "-1": flagCheckClass = "signoffcheckbox"; break;
                            case "0": flagCheckClass = "nocheckbox"; break;
                            case "1": flagCheckClass = "enablecheckbox"; break;
                            default: flagCheckClass = "disablecheckbox";
                        }
                        formatData.records[i].checkboxDisabled = flagCheck;
                        //console.log(flagCheckClass);
                        formatData.records[i].checkboxClass = flagCheckClass;
                        var exceptionsWidth = 0;
                        var greenTotalVal = formatData.records[i].greenTotal.toString();
                        var amberTotalVal = formatData.records[i].amberTotal.toString();
                        var redTotalVal = formatData.records[i].redTotal.toString();
                        var totalVal = (parseInt(formatData.records[i].greenTotal) + parseInt(formatData.records[i].amberTotal) + parseInt(formatData.records[i].redTotal)).toString();

                        if(greenTotalVal.length > exceptionsWidth){
                            exceptionsWidth = greenTotalVal.length;
                        }

                        if(amberTotalVal.length > exceptionsWidth){
                            exceptionsWidth = amberTotalVal.length;
                        }

                        if(redTotalVal.length > exceptionsWidth){
                            exceptionsWidth = redTotalVal.length;
                        }

                        formatData.records[i].exceptionWidth = 30;
                        formatData.records[i].totalWidth = 30;
                        if(exceptionsWidth >= 4){
                            formatData.records[i].exceptionWidth += exceptionsWidth * 3;
                        }

                        if(totalVal.length >= 4){
                            formatData.records[i].totalWidth += totalVal.length * 3;
                        }
                    }
                    //console.log(JSON.stringify(formatData));
                    $scope.collection = formatData;
                    $scope.playlists = $scope.collection.records;
                    $scope.$apply();
                    $rootScope.hideLoading();
                    if($rootScope.enableAnalytics === true){
                        datafactory.irisAnalytics({"uid": $rootScope.entitlementsData.soeId,"PAGE_NAME": $rootScope.pageNames.SIGNOFFLIST, "DETAILS": "SIGNOFFLIST"  });
                    }
                } catch(e) {
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $rootScope.hideLoading();
                    $scope.showFailPopUp("E112");
                }
            }

            $scope.sendFail = function(response) {
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $rootScope.hideLoading();
                $scope.showFailPopUp("E111");
                //return response;
            }
            console.log("Bulk Signoff Call Start:"+ new Date());
            var bulkSignOff = datafactory.getBulkSignoff(creds);
            setTimeout(function(){
                bulkSignOff.send($scope.sendSuccess,$scope.sendFail);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.callLocalOrService($rootScope.isService);

    $scope.goSignOff = function($event)
    {
       $scope.popover.show($event);
    };

    $scope.showDetailsPopup = function($event, catDeskId, reportId)
    {
        //console.log("CatDeskId:"+catDeskId+","+reportId);
        var postParam = {
            /* Report Id, Category Id*/
            "TRADE_REQ" : escape('{"intCatDeskId":"'+catDeskId+'"}'),
            "TRADE_DETAILS_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","categoryId":"","reportCategory":"","deskId":"'+catDeskId+'","reportId":"'+reportId+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}'),
            //"TRADE_DETAILS_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","categoryId":"","reportCategory":"","deskId":"'+catDeskId+'","reportId":"'+reportId+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}'),
            "intCatDeskId": catDeskId
        }

        //console.log(unescape(postParam.TRADE_DETAILS_REQ));

        if($rootScope.isService === true){
            $rootScope.showLoading();
            $scope.tradeDetailsSuccess = function(response) {
                //console.log(response);
                console.log("Trade Details Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.popupDetailsData = formatData.data[0];
                    //console.log(JSON.stringify(formatData));
                    var urlTemplates;
                    if(!ionic.Platform.isIPad()){
                        //console.log('view is iPad');
                        urlTemplates = 'templates/iPhone/details-popover.html';
                      } else{
                        urlTemplates = 'templates/details-popover.html';
                      }
                    $scope.myPopup = $ionicPopup.show({
                        templateUrl: urlTemplates,
                        cssClass: 'custom-detail-popup',
                        scope: $scope
                    });

                } catch(e) {
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $scope.showFailPopUp("E113");
                }
                $rootScope.hideLoading();
            }

            $scope.tradeDetailsFail = function(response) {
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $rootScope.hideLoading();
                $scope.showFailPopUp("E111");
            }
            console.log("Trade Details Call Start:"+ new Date());
            var tradeDetails = datafactory.getTradeDetails(postParam);
            setTimeout(function(){
                tradeDetails.send($scope.tradeDetailsSuccess,$scope.tradeDetailsFail);
            }, $rootScope.setTimeOutLoader);
        }
    };

    $scope.closeDetailsPopup = function(){
        $scope.myPopup.close();
    };

    $scope.commentsDone = function(){
        var selectedId = new Array();

        for(var i in $scope.playlists){
            if($scope.playlists[i].checkboxStatus === true || $scope.playlists[i].checkboxStatus === 'true'){
                selectedId.push($scope.playlists[i].intCatDeskId);
            }
        }
        //console.log("CatDeskId:"+selectedId.join(","));
        //console.log("signOffComments:"+ $scope.popover.textcomments);
        //console.log($scope.popover);
            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "signoffComments":$scope.popover.textcomments,
                "isAdmin": $rootScope.entitlementsData.isDailySignOffAdmin,
                "regionId":$rootScope.regionfilters.selected,
                "intCatDeskId":selectedId.join(",")
            };
            //console.log(JSON.stringify(creds));
        if($rootScope.isService === true){
            if(selectedId.length > 0){
                $rootScope.showLoading();
                $scope.signOffSuccess = function(response) {
                console.log("Bulk Sign off Comments Call End:"+ new Date());
                try{
                    //console.log(response);
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    //console.log(JSON.stringify(formatData));
                    if(formatData.K_MSG != undefined && formatData.K_MSG === 'Signoff Successful'){
                        $scope.showMessagePopUp(formatData.K_MSG);
                        for(var i in $scope.playlists){
                            if($scope.playlists[i].checkboxStatus === true || $scope.playlists[i].checkboxStatus === 'true'){
                                $scope.playlists[i].checkboxDisabled = true;
                            }
                        }
                    } else{
                        $scope.showMessagePopUp(formatData.K_MSG);
                    }
                } catch(e) {
                        //console.log(e);
                        //console.log("catch: Invalid response object returned from call to send.");
                        $scope.showFailPopUp("E114");
                    }
                    $rootScope.hideLoading();
                }

                $scope.signOffFail = function(response) {
                    //console.log(response);
                    //console.log("sendFail: The send request resulted in an error.");
                    $scope.showFailPopUp("E111");
                    $rootScope.hideLoading();
                    //return response;
                }
                console.log("Bulk Sign off Comments Call Start:"+ new Date());
                var signOffComments = datafactory.signOffComments(creds);
                setTimeout(function(){
                    signOffComments.send($scope.signOffSuccess,$scope.signOffFail);
                }, $rootScope.setTimeOutLoader);
                $scope.popover.hide();
            } else{
                $scope.showFailPopUp("E133");
            }
        }
    };

    $scope.closePopover = function() {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
      // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });
})

// App Controller

.controller('SignoffCtrl', function($scope, $stateParams, $http,$rootScope,$timeout,$ionicPopover,datafactory,$state,$window, $ionicLoading,$ionicPopup, $ionicTabsDelegate) {

    $scope.parseInt = parseInt;

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.labels = ["A","B","C"];
    $scope.data = [100,200,300];
    $scope.showNoDataAvail = false;

    $scope.formatDate = function(dateVal){
        var fullDate = new Date(dateVal);
        var month = parseInt(fullDate.getMonth()) + 1;
        var dateValue = month+"/"+fullDate.getDate()+"/"+fullDate.getFullYear();
        return ""+dateValue;
    }

    $scope.reportsPendingOptions = {
            chart: {
                type: 'pieChart',
                donut: true,
                donutRatio: 0.4,
                color: ['#ff3019', '#cccccc'],
                height: 50,
                margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: -15
                },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: false,
                showControls: false,
                showLegend: false,
                pie: {
                    startAngle: function(d) { return d.startAngle -Math.PI/2 },
                    endAngle: function(d) { return d.endAngle -Math.PI/2 }
                },
                duration: 500,
                legend: {
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }
                }
            }
        };

    $scope.callLocalOrService = function(isService){
        //console.log("Calling Function");
        if(isService === true){
            $rootScope.showLoading();
            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","deskId":"'+$rootScope.defaultSelectedFilters.deskfilter+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}')
            };
            //console.log($rootScope.regionfilters);
            //console.log(unescape(creds.DASH_REQ));
            $scope.sendSuccess = function(response) {
                //console.log(response);
                console.log("Bulk Sign off List Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var parsedData = JSON.parse(responseObj.responseText)
                    var formatData = parsedData.data;
                    //console.log(JSON.stringify(formatData));
                    for(var i in formatData){
                        for(var j in formatData[i].records){
                            var uncmntCount = parseInt(formatData[i].records[j].pendingSignoff);
                            var totalCount = parseInt(formatData[i].records[j].count) - parseInt(formatData[i].records[j].pendingSignoff);
                            formatData[i].records[j].dataset = [
                                {
                                    "key":uncmntCount,
                                    "y": uncmntCount
                                },
                                {
                                    "key":totalCount,
                                    "y": totalCount
                                }
                            ];
                            //console.log(formatData[i].records[j].dataset);
                            formatData[i].records[j].labels = ["A","B"];
                            formatData[i].records[j].colours = ["#444","#FF3019"]
                            var exceptionsWidth = 0;
                            var greenTotalVal = formatData[i].records[j].greenTotal.toString();
                            var amberTotalVal = formatData[i].records[j].amberTotal.toString();
                            var redTotalVal = formatData[i].records[j].redTotal.toString();
                            var totalVal = (parseInt(formatData[i].records[j].greenTotal) + parseInt(formatData[i].records[j].amberTotal) + parseInt(formatData[i].records[j].redTotal)).toString();

                            if(greenTotalVal.length > exceptionsWidth){
                                exceptionsWidth = greenTotalVal.length;
                            }

                            if(amberTotalVal.length > exceptionsWidth){
                                exceptionsWidth = amberTotalVal.length;
                            }

                            if(redTotalVal.length > exceptionsWidth){
                                exceptionsWidth = redTotalVal.length;
                            }

                            formatData[i].records[j].exceptionWidth = 30;
                            formatData[i].records[j].totalWidth = 30;
                            if(exceptionsWidth >= 4){
                                formatData[i].records[j].exceptionWidth += exceptionsWidth * 3;
                            }

                            if(totalVal.length >= 4){
                                formatData[i].records[j].totalWidth += totalVal.length * 3;
                            }
                        }
                    }
                    //console.log(JSON.stringify(formatData));
                    if(formatData == undefined){
                        $scope.showNoDataAvail = true;
                    } else{
                        $scope.showNoDataAvail = false;
                    }
                    $rootScope.listData = formatData;
                    $scope.$apply();
                    if($rootScope.enableAnalytics === true){
                        datafactory.irisAnalytics({"uid": $rootScope.entitlementsData.soeId,"PAGE_NAME": $rootScope.pageNames.BULKSIGNOFF, "DETAILS": "BULKSIGNOFF"  });
                    }

                } catch(e) {
                    console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $scope.showFailPopUp("E110");
                }
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }

            $scope.sendFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E109");
                $scope.$broadcast('scroll.refreshComplete');
                //return response;
            }
            console.log("Bulk Sign off List Call Start:"+ new Date());
            var signOffList = datafactory.getSignoffList(creds);
            setTimeout(function(){
                signOffList.send($scope.sendSuccess,$scope.sendFail);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $rootScope.$on("callBulksignoffCall", function(){
       $scope.callLocalOrService($rootScope.isService);
    });

    if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
        && $rootScope.entitlementsData.triggeredSeparateFilter === true){
        $rootScope.pageName = "SUMMARY";
        $rootScope.$emit("triggerFreshFilter", "INITIAL");
    } else{
        $scope.callLocalOrService($rootScope.isService);
    }

    $scope.navigateToDetails = function(listCategoryId, listCategoryName){
        //console.log("Navigate");
        $rootScope.listCategoryId = listCategoryId;
        $rootScope.listCategoryName = listCategoryName;
        //console.log(listCategoryId+","+listCategoryName);
        $state.go('app.details');
        $rootScope.updateSignOffFilterOptions();
    }
})

.controller('attestationCtrl', function($scope, $stateParams, $http, $ionicScrollDelegate, $cordovaToast, $ionicPosition, $rootScope,$timeout,$ionicPopover,datafactory, $window, $ionicLoading, $ionicPopup, $ionicTabsDelegate) {
    $scope.formatDate = function(dateVal){
        var fullDate = new Date(dateVal);
        var month = parseInt(fullDate.getMonth()) + 1;
        var dateValue = month+"/"+fullDate.getDate()+"/"+fullDate.getFullYear();
        return ""+dateValue;
    }

    $scope.toggleType = "INITIAL";
    $scope.disableButtonSubmit = false;
    $scope.noCategoryData = false;
    $scope.attestationControlQuestions = {
        attested: false,
        attestedBy:"",
        vcrNewBusinessRltdIssues: "",
        vcrKeyprocessnonMainStream: "",
        vcrPotentialExpToFirm: "",
        vcrIssuesCommToSnr: "",
        vcrAuditItem: "",
        vcrAssignedTo: "",
        vcrSummary: "",
        vcrDueDate: $scope.formatDate(new Date()),
        vcrCorrActionSummary: "",
        vcrprintName: "",
        vcrDate: $scope.formatDate(new Date()),
        vcrSignature: "",
        vcrLegend: "test",
        productId: "",
        deskId:"",
        attestationCycleDate:"",
        userId:"",
        vcrPDFFileName: "test",
        vcrFileName: "test",
        regionId:"",
        vcrConcerns: "",
        deskName:"test",
        managerName:"test",
        srManagerName:"test",
        attestationDate: $scope.formatDate(new Date())
    }

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

     $scope.showSubmitPop = function(){
        $scope.submitSuccessPopup = $ionicPopup.alert({
            title: 'Alert!',
            template: 'Success',
            okText: 'Ok'
        });
    }

    $scope.toggleGroup = function(item) {
        if ($scope.isGroupShown(item)) {
          $scope.shownGroup = null;
          $rootScope.hideLoading();
        } else {
          $scope.shownGroup = item;
          for(var i in $scope.listData){
                if($scope.listData[i].categoryId == item.categoryId){
                    if($scope.listData[i].records.length === undefined || $scope.listData[i].records.length === 0){
                        $rootScope.showLoading();
                        $scope.triggerAttestationCaregoryData(item.categoryId,"FLOW");
                    }
                }
            }
        }

    };

    $scope.isGroupShown = function(item) {
        var statusVariable;
        if($scope.shownGroup !== undefined && $scope.shownGroup !== null && $scope.shownGroup.categoryId !== undefined && $scope.shownGroup.categoryId !== null){
            statusVariable = (parseInt($scope.shownGroup.categoryId) === parseInt(item.categoryId));
        } else{
            statusVariable = false;
        }
        return statusVariable;
    };

    $scope.submitAttestationCtrlquestions = function(){
            $rootScope.showLoading();
            $scope.attestationControlQuestions.deskId = $rootScope.attestationDeskFilter.selected;
            $scope.attestationControlQuestions.regionId = $rootScope.regionAttesationfilters.selected;
            $scope.attestationControlQuestions.productId = $rootScope.productFilter.selected;
            var postparam = {
                "INSERT_CTRL_QSTNS_REQ": escape(JSON.stringify($scope.attestationControlQuestions))
            }
            //console.log($scope.attestationControlQuestions);
            //console.log(unescape(postparam.INSERT_CTRL_QSTNS_REQ));

            function submitServiceSuccess(response){
                //console.log(response);
                console.log("Attestation Submit Call End:"+ new Date());
                try{
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var parsedData = JSON.parse(responseObj.responseText);
                    //console.log(JSON.stringify(parsedData));
                    //console.log("Successfully Submitted");
                    if(parsedData.status === "1" || parsedData.status === 1){
                        $scope.showSubmitPop();
                        $scope.disableButtonSubmit = true;
                    } else{
                        $scope.showFailPopUp('E119');
                        $scope.disableButtonSubmit = false;
                    }

                } catch(e){
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $scope.showFailPopUp('E119');
                    $scope.disableButtonSubmit = false;
                }
                $rootScope.hideLoading();
            }

            function submitServiceFail(response){
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $rootScope.hideLoading();
                $scope.showFailPopUp('E115');
            }
            console.log("Attestation Submit Call Start:"+ new Date());
            var submitReponseAttestation = datafactory.submitAttestationQuestions(postparam);
            setTimeout(function(){
                submitReponseAttestation.send(submitServiceSuccess, submitServiceFail);
            }, $rootScope.setTimeOutLoader);
    }

    $scope.checkControlQuestions = function(){
        var postparam = {
            "BIND_CTRL_QSTNS_REQ": escape('{"productId":"'+$rootScope.productFilter.selected+'","attestationDate":"'+$rootScope.attestationLastDate+'","userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionAttesationfilters.selected+'","deskId":"'+$rootScope.attestationDeskFilter.selected+'"} ')
        }
        //console.log(unescape(postparam.BIND_CTRL_QSTNS_REQ));
        function serviceSuccess(response){
            //console.log(response);
            console.log("Attestation Control Question Status Call End:"+ new Date());
             try{
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
                //console.log(JSON.stringify(parsedData));
                if(parsedData.dtmAddedOn !== undefined){
                    //console.log("Disable the button");
                    $scope.attestationControlQuestions.vcrNewBusinessRltdIssues  =  parsedData.vcrNewBusinessRelatedIssues;
                    $scope.attestationControlQuestions.vcrKeyprocessnonMainStream =  parsedData.vcrkeyprocessesnonmainstream;
                    $scope.attestationControlQuestions.vcrPotentialExpToFirm = parsedData.vcrpotentialexposuretotheFirm;
                    $scope.attestationControlQuestions.vcrIssuesCommToSnr = parsedData.vcrissueshavecommunicatedtoSenior;
                    $scope.attestationControlQuestions.vcrConcerns = parsedData.vcrconcerns;
                    $scope.attestationControlQuestions.vcrAuditItem =  parsedData.vcrAuditItem;
                    $scope.attestationControlQuestions.vcrAssignedTo =  parsedData.vcrAssignedTo;
                    $scope.attestationControlQuestions.vcrSummary =  parsedData.vcrSummary;
                    $scope.attestationControlQuestions.vcrDueDate =  parsedData.vcrDueDate;
                    $scope.attestationControlQuestions.vcrCorrActionSummary =  parsedData.vcrCorrectiveActionSummary;
                    $scope.attestationControlQuestions.vcrprintName =  parsedData.vcrPrintName;
                    $scope.attestationControlQuestions.vcrDate =  parsedData.vcrDate;
                    $scope.attestationControlQuestions.vcrSignature =  parsedData.vcrSignature;
                   // $scope.disableButtonSubmit = true;
                    $cordovaToast.show('This Desk has been already attested!','short','top').then(function(success) {
                        //console.log("The toast was shown");
                    }, function (error) {
                        //console.log("The toast was not shown due to " + error);
                    });
                } else{
                    //console.log("Allow to Submit");
                    $scope.attestationControlQuestions.vcrNewBusinessRltdIssues  =  "";
                    $scope.attestationControlQuestions.vcrKeyprocessnonMainStream =  "";
                    $scope.attestationControlQuestions.vcrPotentialExpToFirm = "";
                    $scope.attestationControlQuestions.vcrIssuesCommToSnr = "";
                    $scope.attestationControlQuestions.vcrConcerns = "";
                    $scope.attestationControlQuestions.vcrAuditItem =  "";
                    $scope.attestationControlQuestions.vcrAssignedTo =  "";
                    $scope.attestationControlQuestions.vcrSummary =  "";
                    $scope.attestationControlQuestions.vcrDueDate =  $scope.formatDate(new Date());
                    $scope.attestationControlQuestions.vcrCorrActionSummary =  "";
                    $scope.attestationControlQuestions.vcrprintName =  "";
                    $scope.attestationControlQuestions.vcrDate =  $scope.formatDate(new Date());
                    $scope.attestationControlQuestions.vcrSignature =  "";
                    //$scope.disableButtonSubmit = false;
                }

            } catch(e){
                //console.log(e);
                //console.log("catch: Invalid response object returned from call to send.");
                $scope.showFailPopUp('E118');
            }
            $rootScope.hideLoading();
            $scope.$broadcast('scroll.refreshComplete');
        }

        function serviceFail(responseObj){
            //console.log(responseObj);
            //console.log("sendFail: The send request resulted in an error.");
            $rootScope.hideLoading();
            $scope.showFailPopUp('E115');
            $scope.$broadcast('scroll.refreshComplete');
        }
        console.log("Attestation Control Question Status Call Start:"+ new Date());
        var attestationQuestionStatus = datafactory.getAttestationQuestionStatus(postparam);
        setTimeout(function(){
            attestationQuestionStatus.send(serviceSuccess, serviceFail);
        }, $rootScope.setTimeOutLoader);
    }

    $scope.triggerAttestationCaregoryData = function(categoryId,callType){
        var creds = {
            "categoryId": categoryId
        };

        $scope.attestationDataSuccess = function(response){
            //console.log(response);
            console.log("Attestation Data List Call End:"+ new Date());
            try{
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
                //console.log(JSON.stringify(parsedData));
                for(var i in $scope.listData){
                    if($scope.listData[i].categoryId == parsedData.data.categoryId){
                        for(var j in parsedData.data.records){
                            var flagCheckClass = "";
                            if(parsedData.data.records[j].EligibleUser === 0 || parsedData.data.records[j].EligibleUser === "0"){
                                parsedData.data.records[j].pendingSignoff = "0";
                            }
                            switch(parsedData.data.records[j].pendingSignoff){
                                case "-1": flagCheckClass = "disablecheckbox"; break;
                                case "0": flagCheckClass = "nocheckbox"; break;
                                case "1": flagCheckClass = "enablecheckbox"; break;
                                default: flagCheckClass = "disablecheckbox";
                            }
                            parsedData.data.records[j].checkboxDisabled = true;
                            //console.log(flagCheckClass);
                            parsedData.data.records[j].checkboxClass = flagCheckClass;

                            var exceptionsWidth = 0;
                            var greenTotalVal = parsedData.data.records[j].greenTotal.toString();
                            var amberTotalVal = parsedData.data.records[j].amberTotal.toString();
                            var redTotalVal = parsedData.data.records[j].redTotal.toString();
                            var totalVal = (parseInt(parsedData.data.records[j].greenTotal) + parseInt(parsedData.data.records[j].amberTotal) + parseInt(parsedData.data.records[j].redTotal)).toString();

                            if(greenTotalVal.length > exceptionsWidth){
                                exceptionsWidth = greenTotalVal.length;
                            }

                            if(amberTotalVal.length > exceptionsWidth){
                                exceptionsWidth = amberTotalVal.length;
                            }

                            if(redTotalVal.length > exceptionsWidth){
                                exceptionsWidth = redTotalVal.length;
                            }

                            parsedData.data.records[j].exceptionWidth = 30;
                            parsedData.data.records[j].totalWidth = 30;
                            if(exceptionsWidth >= 4){
                                parsedData.data.records[j].exceptionWidth += exceptionsWidth * 3;
                            }

                            if(totalVal.length >= 4){
                                parsedData.data.records[j].totalWidth += totalVal.length * 3;
                            }
                        }
                        //console.log(JSON.stringify(parsedData.data.records));
                        $scope.listData[i].records = parsedData.data.records;

                    }
                }
                $scope.$apply();
                $ionicScrollDelegate.scrollTop();
                $scope.checkControlQuestions();
            } catch(e){
                //console.log(e);
                //console.log("catch: Invalid response object returned from call to send.");
                $scope.showFailPopUp('E117');
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }

        }

        $scope.attestationDataFail = function(response){
            $rootScope.hideLoading();
            $scope.showFailPopUp('E115');
            $scope.$broadcast('scroll.refreshComplete');
        }
        console.log("Attestation Data List Call Start:"+ new Date());
        var attestationDataList = datafactory.getManagerAttestationCategoryData(creds);
        setTimeout(function(){
            attestationDataList.send($scope.attestationDataSuccess,$scope.attestationDataFail);
        }, $rootScope.setTimeOutLoader);

    }

    $rootScope.$on("callAttesationCall", function(){
       $scope.callLocalOrService($rootScope.isService, "FILTER");
    });

    $rootScope.$on("callAttesationRegionCall", function(){
       $scope.callLocalOrService($rootScope.isService, "REGIONFILTER");
    });

    $rootScope.$on("callAttesationDefaultCall", function(){
       $scope.callLocalOrService($rootScope.isService, "INITIAL");
    });

    $scope.callLocalOrService = function(isService, callType){
        var DESK_ID = "";
        var REGION_ID = $rootScope.regionAttesationfilters.selected;
        var PRODUCT_ID = "";
        //console.log(callType);
        if(callType !== undefined && callType === "FILTER"){
            DESK_ID = $rootScope.attestationDeskFilter.selected;
            PRODUCT_ID = $rootScope.productFilter.selected;
            //REGION_ID = $rootScope.defaultSelectedFilters.regionfiltersAttestation;
            //console.log("DESK_ID:"+DESK_ID);
        }

        if(callType !== undefined && callType === "REGIONFILTER"){
            DESK_ID = $rootScope.attestationDeskFilter.selected;
            PRODUCT_ID = "";
            REGION_ID = $rootScope.defaultSelectedFilters.regionfiltersAttestation;
            //console.log("DESK_ID:"+DESK_ID);
        }


        if(isService){
            $rootScope.showLoading();
            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "REGION_ID":REGION_ID,
                "PRODUCT": PRODUCT_ID,
                "intAttestation":"1",
                "DESK": DESK_ID,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""}, "IRIS_GLOBALS":{"IRIS_ReqType":"FLEX", "IRIS_RenderAs":"SingleSelect"}}')
            };
            $scope.sendSuccess = function(response) {
                ////console.log(response);
                console.log("Attestation Set List Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var parsedData = JSON.parse(responseObj.responseText);
                    //console.log(parsedData);
                    if(callType === "INITIAL"){
                        $rootScope.productFilter = parsedData.product;
                        //$rootScope.attestationRegionFilter = parsedData.region;
                        $rootScope.attestationDeskFilter = parsedData.desk;
                        $rootScope.attestationLastDate = parsedData.attestationDate,
                        //$rootScope.defaultSelectedFilters.regionfiltersAttestation = parsedData.region.selected;
                        $scope.attestationControlQuestions.deskId = parsedData.desk.selected;
                        $scope.attestationControlQuestions.userId = ""+$rootScope.entitlementsData.userId;
                        $scope.attestationControlQuestions.regionId = $rootScope.regionAttesationfilters.selected;
                        $scope.attestationControlQuestions.productId = parsedData.product.selected;
                        $scope.attestationControlQuestions.attestationCycleDate = parsedData.attestationDate;

                    } else if(callType === "REGIONFILTER"){
                        $rootScope.productFilter = parsedData.product;
                        $rootScope.attestationDeskFilter = parsedData.desk;
                        $rootScope.attestationLastDate = parsedData.attestationDate,
                        $scope.attestationControlQuestions.deskId = parsedData.desk.selected;
                        $scope.attestationControlQuestions.userId = ""+$rootScope.entitlementsData.userId;
                        $scope.attestationControlQuestions.regionId = $rootScope.defaultSelectedFilters.regionfiltersAttestation;
                        $scope.attestationControlQuestions.productId = parsedData.product.selected;
                        $scope.attestationControlQuestions.attestationCycleDate = parsedData.attestationDate;
                    }

                    if(parsedData.checkAttestationSignoff.attested != undefined){
                        $scope.attestationControlQuestions.attested = parsedData.checkAttestationSignoff.attested;
                        $scope.attestationControlQuestions.attestedBy = parsedData.checkAttestationSignoff.attestedBy;
                    }

                    if(parsedData.categories.length > 0){
                        $scope.noCategoryData = false;
                        var tempData = parsedData.categories;
                        for(var i in tempData){
                            tempData[i].records = {};
                        }
                        $scope.shownGroup = tempData[0];
                        $scope.listData = tempData;
                        if(callType === "INITIAL" || callType === "FILTER"){
                            $scope.triggerAttestationCaregoryData($scope.listData[0].categoryId, "INITIAL");
                            if($scope.attestationControlQuestions.attested === true){
                                $scope.disableButtonSubmit = true;
                                $cordovaToast.show('This Desk has been already attested!','short','top').then(function(success) {
                                    //console.log("The toast was shown");
                                }, function (error) {
                                    //console.log("The toast was not shown due to " + error);
                                });
                            } else{
                               $scope.disableButtonSubmit = false;
                            }
                            if($rootScope.enableAnalytics === true){
                                datafactory.irisAnalytics({"uid": $rootScope.entitlementsData.soeId,"PAGE_NAME": $rootScope.pageNames.ATTESTATION, "DETAILS": "ATTESTATION" });
                            }
                        } else{
                            $rootScope.hideLoading();
                            $scope.$broadcast('scroll.refreshComplete');
                        }
                    } else{
                        //console.log("No Category available");
                        $scope.noCategoryData = true;
                        $rootScope.hideLoading();
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$apply();
                        $ionicScrollDelegate.scrollTop();
                    }
                } catch(e) {
                    //console.log(e);
                    //console.log("catch: Invalid response object returned from call to send.");
                    $rootScope.hideLoading();
                    $scope.showFailPopUp('E116');
                    $scope.$broadcast('scroll.refreshComplete');
                }
            }

            $scope.sendFail = function(response) {
                //console.log(response);
                //console.log("sendFail: The send request resulted in an error.");
                $rootScope.hideLoading();
                $scope.showFailPopUp('E115');
                $scope.$broadcast('scroll.refreshComplete');
            }
            //console.log(new Date());
            console.log("Attestation Set List Call Start:"+ new Date());
            var attestationList = datafactory.getManagerAttestationData(creds);
            setTimeout(function(){
                attestationList.send($scope.sendSuccess,$scope.sendFail);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.showDueDatePicker = function(){
        //console.log("Check");
        var options = {
          date: $scope.attestationControlQuestions.vcrDueDate,
          mode: 'date'
        };

        function onSuccess(date) {
            //console.log("Test"+ date);
            if(date !== undefined){
                $scope.attestationControlQuestions.vcrDueDate = $scope.formatDate(date);
                $scope.$apply();
            }
            //alert('Selected date: ' + dateValue);
        }

        function onError(error) { // Android only
            //console.log('Error: ' + error);
        }

        datePicker.show(options, onSuccess, onError);
    }

    $scope.showCurrDatePicker = function(){
        var options = {
          date: $scope.attestationControlQuestions.vcrDate,
          mode: 'date'
        };

        function onSuccess(date) {
            if(date !== undefined){
                $scope.attestationControlQuestions.vcrDate = $scope.formatDate(date);
                $scope.$apply();
            }
        }

        function onError(error) { // Android only
            //console.log('Error: ' + error);
        }

        datePicker.show(options, onSuccess, onError);
    }

    $scope.showDetailsPopup = function($event, catDeskId, reportId, reportDate)
    {
        //console.log("CatDeskId:"+catDeskId)
        var postParam = {
            /* Report Id, Category Id*/
            "TRADE_REQ" : escape('{"intCatDeskId":"'+catDeskId+'"}'),
            "TRADE_DETAILS_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionAttesationfilters.selected+'","businessLine":"'+$rootScope.businessAttesationfilters.selected+'","categoryId":"","reportCategory":"","deskId":"'+catDeskId+'","reportId":"'+reportId+'","date":"'+reportDate+'"}'),
            "intCatDeskId": catDeskId
        }

        //console.log(unescape(postParam.TRADE_DETAILS_REQ));

        if($rootScope.isService === true){
            $rootScope.showLoading();
            $scope.tradeDetailsSuccess = function(response) {
                console.log("Trade Details Call End:"+ new Date());
                //console.log(response);
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.popupDetailsData = formatData.data[0];
                    //console.log(JSON.stringify(formatData));
                    var urlTemplates;
                    if(!ionic.Platform.isIPad()){
                        //console.log('view is iPad');
                        urlTemplates = 'templates/iPhone/details-popover.html';
                      } else{
                        urlTemplates = 'templates/details-popover.html';
                      }
                    $scope.myPopup = $ionicPopup.show({
                        templateUrl: urlTemplates,
                        cssClass: 'custom-detail-popup',
                        scope: $scope
                    });

                } catch(e) {
                    $scope.showFailPopUp("E134");
                }
                $rootScope.hideLoading();
            }

            $scope.tradeDetailsFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E115");
            }
            console.log("Trade Details Call Start:"+ new Date());
            var tradeDetails = datafactory.getTradeDetails(postParam);
            setTimeout(function(){
                tradeDetails.send($scope.tradeDetailsSuccess,$scope.tradeDetailsFail);
            }, $rootScope.setTimeOutLoader);

        }
    };

    $scope.closeDetailsPopup = function(){
        $scope.myPopup.close();
    };

    $scope.goToSubmitForm = function(){
         var quotePosition = $ionicPosition.position(angular.element(document.getElementById('cQuestions')));
         $ionicScrollDelegate.$getByHandle('control-question').scrollTo(quotePosition.left, quotePosition.top, true);
    }

    if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
        && $rootScope.entitlementsData.triggeredSeparateFilter === true){
        $rootScope.pageName = "ATTESTATION";
        $rootScope.$emit("triggerFreshFilter", "INITIAL");
    } else{
        $scope.callLocalOrService($rootScope.isService, "INITIAL");
    }

    $scope.signEnabled = false;
    $scope.closeSignPopup = function() {
        $scope.signaturepopup.close();
    };

    $scope.clearCanvas = function() {
        $scope.signaturePad.clear();
    };

    $scope.saveCanvas = function() {
        var sigImg = $scope.signaturePad.toDataURL();
        $rootScope.signature = sigImg;
        $scope.signaturepopup.close();
    };

    $scope.createSignModal = function(signEnabled){
            //console.log("Open Modal");
            $scope.signaturepopup = $ionicPopup.show({
                        title: 'Add Signature',
                        templateUrl: 'signature-popover.html',
                        cssClass: 'custom-detail-popup signaturepopup',
                        scope: $scope
                    });
            setTimeout(function(){
                //console.log(document.getElementById('signatureCanvas'));
                $scope.canvas = document.getElementById('signatureCanvas');
                $scope.signaturePad = new SignaturePad($scope.canvas);
            }, 1000);
    };
})
.controller('settingsCtrl',function($scope, $stateParams, $http,$rootScope,$timeout,$ionicPopover,$ionicModal,datafactory,$state,$window, $ionicLoading,$ionicPopup, $ionicTabsDelegate){

})
.controller('SummaryCtrl',function($scope, $stateParams, $http,$rootScope,$timeout,$ionicPopover,$ionicModal,datafactory,$state,$window, $ionicLoading,$ionicPopup, $ionicTabsDelegate){

    $scope.currentDeskName = "";
        $scope.currentReportName = "";
        $ionicModal.fromTemplateUrl('templates/iPhone/summarynotify.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.notifymodal = modal;
        });

        $scope.openNotifyModal = function(reportName, deskName) {
            $scope.currentDeskName = deskName;
            $scope.currentReportName = reportName;
            if($rootScope.isService === true){
                var postParam = {
                    "DASH_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionSummaryfilters.selected+'","businessLine":"'+$rootScope.businessSummaryfilters.selected+'","deskId":"'+$rootScope.defaultSelectedFilters.deskSummaryfilter+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.dateSummaryfilter)+'"}')
                }
                //console.log(unescape(postParam.DASH_REQ));
                $rootScope.showLoading();
                $scope.mobileActionableUserListSuccess = function(response) {
                    //console.log(response);
                    console.log("Action User List Call End:"+ new Date());
                    try {
                        var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                        var formatData = JSON.parse(responseObj.responseText);
                        for(var i in formatData.pendingActionableUserList){
                            formatData.pendingActionableUserList[i].checkBoxStatus = false;
                        }
                        $scope.actionableUserList = formatData;
                        $scope.notifymodal.show();
                    } catch(e) {
                        $scope.showFailPopUp("E130");
                    }
                    $rootScope.hideLoading();
                }

                $scope.mobileActionableUserListFail = function(response) {
                    $rootScope.hideLoading();
                    $scope.showFailPopUp("E128");
                }
                console.log("Action User List Call Start:"+ new Date());
                var mobileActionableUserList = datafactory.getMobileActionableUserList(postParam);
                setTimeout(function(){
                    mobileActionableUserList.send($scope.mobileActionableUserListSuccess,$scope.mobileActionableUserListFail);
                }, $rootScope.setTimeOutLoader);
            }
        };

        $scope.closeNotifyModal = function() {
            $scope.notifymodal.hide();
        };

        $scope.triggetNotificationMail = function(commentText){
            $rootScope.showLoading();
            var userList = [];
            for(var i in $scope.actionableUserList.pendingActionableUserList){
                if($scope.actionableUserList.pendingActionableUserList[i].checkBoxStatus === true || $scope.actionableUserList.pendingActionableUserList[i].checkBoxStatus === "true"){
                   //console.log($scope.actionableUserList.pendingActionableUserList[i]);
                   userList.push($scope.actionableUserList.pendingActionableUserList[i].vcrEmailId);
                }
            }
            var postParam = {
                "DASH_REQ": escape('{"reportName":"'+$scope.currentReportName+'","subject":"Pending comments for red items","bodyContent":"'+$scope.notifymodal.escalationComment+'","emailFrom":"'+$rootScope.entitlementsData.userEmailId+'","emailTo":"'+userList.join(";")+'", "fullNameFrom":"'+$rootScope.entitlementsData.userFullName+'", "deskName":"'+$scope.currentDeskName+'"}')
            }

            //console.log(unescape(postParam.DASH_REQ));
            $scope.sendNotificationEmailSuccess = function(response){
                console.log("Send Notification Call End:"+ new Date());
                try{
                    $rootScope.hideLoading();
                    $scope.notifymodal.hide();
                } catch(e){
                    $rootScope.hideLoading();
                    $scope.showFailPopUp("E131");
                }
            }

            $scope.sendNotificationEmailFail = function(response){
                $rootScope.hideLoading();
                $scope.showFailPopUp("E128");
            }
            console.log("Send Notification Call Start:"+ new Date());
            var sendNotificationEmail = datafactory.sendEmailNotificationMail(postParam);
            setTimeout(function(){
                sendNotificationEmail.send($scope.sendNotificationEmailSuccess,$scope.sendNotificationEmailFail);
            }, $rootScope.setTimeOutLoader);
        }

    $ionicPopover.fromTemplateUrl('templates/iPhone/summarysignoff.html', {
      scope: $scope
    }).then(function(popover) {
        $scope.summarypopover = popover;
    });

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.showMessagePopUp = function(message){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Message',
            template: message,
            okText: 'Ok'
        });
    }

    $scope.showSummarySignoffPopup = function(){
        $scope.summarypopover.show();
    }

    $scope.showDetailsPopup = function($event, catDeskId, reportId)
    {
        var postParam = {
            "TRADE_REQ" : escape('{"intCatDeskId":"'+catDeskId+'"}'),
            "TRADE_DETAILS_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionSummaryfilters.selected+'","businessLine":"'+$rootScope.businessSummaryfilters.selected+'","categoryId":"","reportCategory":"","deskId":"'+catDeskId+'","reportId":"'+reportId+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.dateSummaryfilter)+'"}'),
            "intCatDeskId": catDeskId
        }

        if($rootScope.isService === true){
            $rootScope.showLoading();
            $scope.tradeDetailsSuccess = function(response) {
                //console.log(response);
                console.log("Trade Details Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.popupDetailsData = formatData.data[0];
                    //console.log(JSON.stringify(formatData));
                    var urlTemplates;
                    if(!ionic.Platform.isIPad()){
                        //console.log('view is iPad');
                        urlTemplates = 'templates/iPhone/details-popover.html';
                      } else{
                        urlTemplates = 'templates/details-popover.html';
                      }
                    $scope.myPopup = $ionicPopup.show({
                        templateUrl: urlTemplates,
                        cssClass: 'custom-detail-popup',
                        scope: $scope
                    });

                } catch(e) {
                    $scope.showFailPopUp("E135");
                }
                $rootScope.hideLoading();
            }

            $scope.tradeDetailsFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E128");
            }
            console.log("Trade Details Call Start:"+ new Date());
            var tradeDetails = datafactory.getTradeDetails(postParam);
            setTimeout(function(){
                tradeDetails.send($scope.tradeDetailsSuccess,$scope.tradeDetailsFail);
            }, $rootScope.setTimeOutLoader);

        }
    };

    $scope.closeDetailsPopup = function(){
        $scope.myPopup.close();
    };

    $scope.setData = function(data){
        var formatData = data;
        $scope.loopRedItems = false;
        $scope.loopAwaitingReports = false;
        for(var i in formatData.pendingSignoff){
            for(var m in formatData.pendingSignoff[i].records){
                formatData.pendingSignoff[i].records[m].checkboxStatus = false;
                var flagCheckClass = "";
                var flagCheck = (formatData.pendingSignoff[i].records[m].pendingSignoff === "1")?false:true;
                if(formatData.pendingSignoff[i].records[m].EligibleUser != undefined && (formatData.pendingSignoff[i].records[m].EligibleUser === 0 || formatData.pendingSignoff[i].records[m].EligibleUser === "0")){
                    formatData.pendingSignoff[i].records[m].pendingSignoff = "0";
                    flagCheck = true;
                }
                switch(formatData.pendingSignoff[i].records[m].pendingSignoff){
                    case "-1": flagCheckClass = "signoffcheckbox"; break;
                    case "0": flagCheckClass = "nocheckbox"; break;
                    case "1": flagCheckClass = "enablecheckbox"; break;
                    default: flagCheckClass = "disablecheckbox";
                }
                formatData.pendingSignoff[i].records[m].checkboxDisabled = flagCheck;
                formatData.pendingSignoff[i].records[m].checkboxClass = flagCheckClass;
                var exceptionsWidth = 0;
                var greenTotalVal = formatData.pendingSignoff[i].records[m].greenTotal.toString();
                var amberTotalVal = formatData.pendingSignoff[i].records[m].amberTotal.toString();
                var redTotalVal = formatData.pendingSignoff[i].records[m].redTotal.toString();
                var totalVal = (parseInt(formatData.pendingSignoff[i].records[m].greenTotal) + parseInt(formatData.pendingSignoff[i].records[m].amberTotal) + parseInt(formatData.pendingSignoff[i].records[m].redTotal)).toString();

                if(greenTotalVal.length > exceptionsWidth){
                    exceptionsWidth = greenTotalVal.length;
                }

                if(amberTotalVal.length > exceptionsWidth){
                    exceptionsWidth = amberTotalVal.length;
                }

                if(redTotalVal.length > exceptionsWidth){
                    exceptionsWidth = redTotalVal.length;
                }

                formatData.pendingSignoff[i].records[m].exceptionWidth = 30;
                formatData.pendingSignoff[i].records[m].totalWidth = 30;
                if(exceptionsWidth >= 4){
                    formatData.pendingSignoff[i].records[m].exceptionWidth += exceptionsWidth * 3;
                }

                if(totalVal.length >= 4){
                    formatData.pendingSignoff[i].records[m].totalWidth += totalVal.length * 3;
                }
            }
        }

        for(var j in formatData.awaitingReports){
            formatData.awaitingReports[j].recordsGroup = new Object();
            formatData.awaitingReports[j].show = false;
            formatData.awaitingReports[j].showCategory = (formatData.awaitingReports[j].records.length > 0)?true:false;
            if(formatData.awaitingReports[j].records.length > 0){
                $scope.loopAwaitingReports = true;
            }


            for(var k in formatData.awaitingReports[j].records){
                if(formatData.awaitingReports[j].recordsGroup[formatData.awaitingReports[j].records[k].ReportName] == undefined){
                    formatData.awaitingReports[j].recordsGroup[formatData.awaitingReports[j].records[k].ReportName] = new Object();
                    formatData.awaitingReports[j].recordsGroup[formatData.awaitingReports[j].records[k].ReportName]["name"] = formatData.awaitingReports[j].records[k].ReportName;
                    formatData.awaitingReports[j].recordsGroup[formatData.awaitingReports[j].records[k].ReportName]["data"] = new Array();
                }
                formatData.awaitingReports[j].recordsGroup[formatData.awaitingReports[j].records[k].ReportName]["data"].push({intDeskId: formatData.awaitingReports[j].records[k].intDeskId,intsheetID: formatData.awaitingReports[j].records[k].intsheetID ,vcrDesc: formatData.awaitingReports[j].records[k].vcrDesc});

            }
        }

        for(var m in formatData.uncommentedRedItems){
            formatData.uncommentedRedItems[m].recordsGroup = new Object();
            formatData.uncommentedRedItems[m].show = false;
            formatData.uncommentedRedItems[m].showCategory = (formatData.uncommentedRedItems[m].records.length > 0)?true:false;
            if(formatData.uncommentedRedItems[m].records.length > 0){
                $scope.loopRedItems = true;
            }
            for(var n in formatData.uncommentedRedItems[m].records){
                if(formatData.uncommentedRedItems[m].recordsGroup[formatData.uncommentedRedItems[m].records[n].ReportName] == undefined){
                    formatData.uncommentedRedItems[m].recordsGroup[formatData.uncommentedRedItems[m].records[n].ReportName] = new Object();
                    formatData.uncommentedRedItems[m].recordsGroup[formatData.uncommentedRedItems[m].records[n].ReportName]["name"] = formatData.uncommentedRedItems[m].records[n].ReportName;
                    formatData.uncommentedRedItems[m].recordsGroup[formatData.uncommentedRedItems[m].records[n].ReportName]["data"] = new Array();
                }

                formatData.uncommentedRedItems[m].recordsGroup[formatData.uncommentedRedItems[m].records[n].ReportName]["data"].push(formatData.uncommentedRedItems[m].records[n]);

            }
        }
        $scope.showUncommentedRedItems = (formatData.uncommentedRedItems.length === 0 || $scope.loopRedItems === false)?true:false;
        $scope.showAwaitingReports = (formatData.awaitingReports.length === 0 || $scope.loopAwaitingReports === false)?true:false;
        $scope.summaryStatusData = formatData;
        $scope.disableSignOff = false;
        if($scope.summaryStatusData.pendingSignoff.length === 0){
            $scope.disableSignOff = true;
        }
        $scope.$apply();
    }

    $scope.commentsDone = function(){
        var selectedId = new Array();
        for(var i in $scope.summaryStatusData.pendingSignoff){
            for(var j in $scope.summaryStatusData.pendingSignoff[i].records){
                if($scope.summaryStatusData.pendingSignoff[i].records[j].checkboxStatus === true || $scope.summaryStatusData.pendingSignoff[i].records[j].checkboxStatus === 'true'){
                    selectedId.push($scope.summaryStatusData.pendingSignoff[i].records[j].intCatDeskId);
                }
            }
        }

        var creds = {
            "uid": $rootScope.entitlementsData.userId,
            "signoffComments":$scope.summarypopover.textcomments,
            "isAdmin": $rootScope.entitlementsData.isDailySignOffAdmin,
            "regionId":$rootScope.regionSummaryfilters.selected,
            "intCatDeskId":selectedId.join(",")
        };

        if($rootScope.isService === true){
            if(selectedId.length > 0){
                $rootScope.showLoading();
                $scope.signOffSuccess = function(response) {
                console.log("Sign off comments Call End:"+ new Date());
                try{
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    if(formatData.K_MSG != undefined && formatData.K_MSG === 'Signoff Successful'){
                        $scope.showMessagePopUp(formatData.K_MSG);
                        for(var i in $scope.summaryStatusData.pendingSignoff){
                            if($scope.summaryStatusData.pendingSignoff[i].checkboxStatus === true || $scope.summaryStatusData.pendingSignoff[i].checkboxStatus === 'true'){
                                $scope.summaryStatusData.pendingSignoff[i].checkboxDisabled = true;
                            }
                        }
                    } else{
                        $scope.showMessagePopUp(formatData.K_MSG);
                    }
                } catch(e) {
                        $scope.showFailPopUp("E114");
                    }
                    $rootScope.hideLoading();
                }

                $scope.signOffFail = function(response) {
                    $scope.showFailPopUp("E128");
                    $rootScope.hideLoading();
                }
                console.log("Sign off comments Call Start:"+ new Date());
                var signOffComments = datafactory.signOffComments(creds);
                setTimeout(function(){
                    signOffComments.send($scope.signOffSuccess,$scope.signOffFail);
                }, $rootScope.setTimeOutLoader);
                $scope.summarypopover.hide();
            } else{
                $scope.showFailPopUp("E133");
            }
        }
    };

    $scope.callLocalOrService = function(isService){
        if(isService){
            $rootScope.showLoading();
            var postParam = {
                "DASH_REQ" : escape('{"userId": "'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionSummaryfilters.selected+'","deskId": "'+$rootScope.defaultSelectedFilters.deskSummaryfilter+'","businessLine": "'+$rootScope.businessSummaryfilters.selected+'","date": "'+$rootScope.defaultSelectedFilters.dateSummaryfilter+'"}')
            };

            $scope.summaryStatusSuccess = function(response) {
                console.log("Summary Status Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var data = JSON.parse(responseObj.responseText);
                    $scope.setData(data);
                } catch(e) {
                    $scope.showFailPopUp("E129");
                }
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }

            $scope.summaryStatusFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E128");
                $scope.$broadcast('scroll.refreshComplete');
            }
            console.log("Summary Status Call Start:"+ new Date());
            var summaryStatus = datafactory.getSummaryStatus(postParam);
            setTimeout(function(){
                summaryStatus.send($scope.summaryStatusSuccess,$scope.summaryStatusFail);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $rootScope.$on("callSummaryStatusCall", function(){
        $scope.callLocalOrService($rootScope.isService);
    });

    if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
        && $rootScope.entitlementsData.triggeredSeparateFilter === true){
        $rootScope.pageName = "STATUSSUMMARY";
        $rootScope.$emit("triggerFreshFilter", "INITIAL");
    } else{
        $scope.callLocalOrService($rootScope.isService)
    }

    $scope.toggleGroup = function(group) {
        group.show = !group.show;
    };

    $scope.isGroupShown = function(group) {
        return group.show;
    };
})
.controller('SMAttestation', function($scope, datafactory, $window, $http, $ionicPopup, $ionicPopover, $location, $state, $rootScope, $ionicModal, $ionicLoading) {
        $scope.recSwipable = false;
        $scope.attestDisable = true;
        $scope.productId;
        $scope.regionId;
        $scope.attMonth;
        $scope.attYear;
        $scope.currPdfData;
        $scope.currPage=1;
        $scope.pdfTotalPage;

        $scope.reqparams = {
            IRIS_KEYS: {
                DUMMY_PARAM: ""
            },
            IRIS_GLOBALS: {
                IRIS_ReqType: "FLEX",
                IRIS_RenderAs: "SingleSelect"
            }
        }

        $ionicPopover.fromTemplateUrl('templates/iPhone/pdfpopover.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.pdfPopover = modal;
        });
        $rootScope.$on("loadSMFilterApply", function(scope, param) {
            $scope.populateSenMgrData(param.type);
        });

        $scope.showFailPopUp = function(ecode){
            $scope.loginFailPopup = $ionicPopup.alert({
                title: 'Error - '+ecode,
                template: errorCodeUtility.getErrorCode(ecode),
                okText: 'Ok'
            });
        }

        $scope.showMessagePopUp = function(message){
            $scope.loginFailPopup = $ionicPopup.alert({
                title: 'Message',
                template: message,
                okText: 'Ok'
            });
        }

        $scope.populateSenMgrData = function(option) {
            $rootScope.showLoading();
            var attParams = {
                userId: ""+$rootScope.entitlementsData.userId,
                intAttestation: ""+$rootScope.entitlementsData.intAttestation
            };

            if (option == "INITIAL") {
                attParams['regionId'] = $rootScope.defaultSelectedFilters.regionSMAttesationfilters.selected;
                attParams['productId'] = $rootScope.defaultSelectedFilters.productSMFilter.selected;
                $rootScope.regionSMAttesationfilters.selected = attParams['regionId'];
                $rootScope.productSMFilter = $rootScope.defaultSelectedFilters.productSMFilter;
                $rootScope.productSMFilter.selected = attParams['productId'];
                var d = new Date();
                attParams['attestationMonth'] = (d.getMonth() > 9) ? d.getMonth() + '' : '0' + (d.getMonth());
                attParams['attestationYear'] = d.getFullYear() + '';
            } else {
                if ($rootScope.regionSMAttesationfilters)
                    attParams['regionId'] = $rootScope.regionSMAttesationfilters.selected;
                else
                    option = "INITIAL";

                //attParams['regionId'] = "10";
                //attParams['productId'] = "1";

                if ($rootScope.productSMFilter && option != "Product")
                    attParams['productId'] = $rootScope.productSMFilter.selected;

                if ($scope.attYear && $scope.attMonth) {
                    attParams['attestationMonth'] = $scope.attMonth;
                    attParams['attestationYear'] = $scope.attYear;
                } else {
                    var d = new Date();
                    attParams['attestationMonth'] = (d.getMonth() > 9) ? d.getMonth() + '' : '0' + (d.getMonth());
                    attParams['attestationYear'] = d.getFullYear() + '';
                }
            }

            //attParams['attestationMonth'] = "09";
            //attParams['attestationYear'] = "2016";
            //attParams['regionId'] = "10";
            //attParams['productId'] = "72";
            var params = {
                ATTESTATION_DASH_REQ: escape(JSON.stringify(attParams)),
                REQ_PARAM: escape(JSON.stringify($scope.reqparams))
            }
            var serviceData = datafactory.getSeniorAttesationCall(params);
            var successFun = function(responseObj) {
                console.log("SM Attesation Call End:"+ new Date());
               try {
                    var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
                    var response = JSON.parse(responseObjData.responseText);
                    var mainData = JSON.stringify(response.data);
                    $scope.attestationData = $scope.convertToObj(response.data);
                    $scope.archiveData = response.archive_data;
                    $scope.pendingAttestationData = $scope.convertToObj(response.pendingAttestationData);
                    if (response.product) {
                        $rootScope.productSMFilter = response.product;
                    }
                    if (response.region) {
                        $rootScope.regionSMAttesationfilters = response.region;
                    }
                    if(option == "FIRST" && response.product && response.region){
                        $rootScope.defaultSelectedFilters.productSMFilter = response.product;
                        $rootScope.defaultSelectedFilters.regionSMAttesationfilters = response.region;

                    }
                    if ($scope.pendingAttestationData.length == 0 && $scope.archiveData.length == 0)
                        $scope.attestDisable = false;
                    else
                        $scope.attestDisable = true;

                    if ($scope.archiveData.length > 0) {
                        $scope.recSwipable = true;
                    } else {
                        $scope.recSwipable = true;
                    }

                    if($scope.pendingAttestationData.length == 0 && $scope.archiveData.length == 0 && $scope.attestationData.length === 0){
                        $scope.attestDisable = true;
                        $scope.showNotAvailable = true;
                        $scope.viewPDFDisable = true;
                    }

                    $rootScope.hideLoading();
                    $scope.$broadcast('scroll.refreshComplete');
               } catch(e) {
                  $scope.showFailPopUp("E122");
                  $rootScope.hideLoading();
                  $scope.$broadcast('scroll.refreshComplete');
               }
            }
            var errorFun = function(response) {
                //Handle error
                $scope.showFailPopUp("E120");
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }
            var HTTPObject = {
                params: params,
                serviceData: serviceData,
                successFun: successFun,
                errorFun: errorFun
            };
            $scope.customGoodHTTP(HTTPObject);
        }
        $scope.convertToObj = function(array) {
            var objArray = [];
            array.forEach(function(item) {
                var obj = {};
                item.forEach(function(innerItems) {
                    var key = Object.keys(innerItems)[0];
                    obj[key] = innerItems[key];
                });
                objArray.push(obj);
            })
            return objArray;
        }

        $scope.reject = function(item) {
            $scope.data = {};
            var recToReject = item;
            var confirmPopup = $ionicPopup.show({
                title: 'Reject',
                subTitle: 'This signed document will be rejected. Are you sure?',
                template: '<textarea type="text"  cols="40" rows="5" ng-model="data.rejectComment"/>',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Reject</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.rejectAttestation(recToReject, $scope.data.rejectComment);
                    }
                }]
            });
        }
        $scope.attest = function() {
            $scope.data = {};
            var confirmPopup = $ionicPopup.show({
                title: 'Attest',
                subTitle: 'All records will be attested. Are you sure?',
                template: '<textarea type="text"  cols="40" rows="5" ng-model="data.attestComment"/>',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>Attest</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.attestCombined($scope.data.attestComment);
                    }
                }]
            });
        }

        $scope.escalate = function(list) {
            $state.go('app.smEscalation', {
                deskName: list['Desk Name'],
                pdfFileName: list['PDFFileName']
            });
        }

        $scope.viewPDF = function(singleData) {
            $rootScope.showLoading();
            var pdfData = $scope.attestationData;
            if(singleData)
                pdfData=[singleData];
            var csvFileName=[];
            pdfData.forEach(function(item) {
                       csvFileName.push(item.PDFFileName+"");
            });

            $scope.pdfPopover.show();
            var pdfParams = {
                pdfFileNames: csvFileName
            }
            var params = {
                ATTESTATION_DASH_REQ: escape(JSON.stringify(pdfParams))
            }
            var successFun = function(responseObj) {
                console.log("SM Attesation Call End:"+ new Date());
                try{
                    var respObj = JSON.parse(responseObj);
                    var response = respObj.responseText;
                    $scope.currPdfData = atob(response);
                    $scope.renderPDF();
                } catch(e){
                    $rootScope.hideLoading();
                    $scope.closePDF();
                    $scope.showFailPopUp("E123");
                }
            }
            var errorFun = function(response) {
                $rootScope.hideLoading();
                $scope.closePDF();
                $scope.showFailPopUp("E120");
                //Handle error
            }
            var sendURL = datafactory.getViewPDFCall(params);
            var HTTPObject = {
                params: params,
                url: sendURL,
                serviceData: sendURL,
                successFun: successFun,
                errorFun: errorFun
            };
            $scope.customGoodPDFHTTP(HTTPObject);
        }

        $scope.closePDF = function() {
            $scope.pdfPopover.hide();
            $scope.currPage = 1;
            $scope.currPdfData = null;
            $scope.pdfTotalPage=1;
            var parentCanvasHolder = document.getElementById('parentCanvasHolder');
            var oldCanvas = document.getElementById('pdfcanvas');
            parentCanvasHolder.removeChild(oldCanvas);
            var newCanvas = document.createElement("CANVAS");
            newCanvas.id = "pdfcanvas";
            parentCanvasHolder.appendChild(newCanvas);
        }

        $scope.zoomScale = 1;

        $scope.zoominPDF = function() {
            if($scope.zoomScale <= 5){
                $scope.zoomScale++;
            }
            $scope.zoomContent($scope.currentPageContext,$scope.zoomScale);
        }
        $scope.zoomoutPDF = function() {
            if($scope.zoomScale != 1){
                $scope.zoomScale--;
            }
            $scope.zoomContent($scope.currentPageContext,$scope.zoomScale);
        }

        $scope.renderPDF = function(dir,scaleOut) {
            PDFJS.workerSrc = 'lib/pdf/pdf.worker.js';
            var num = $scope.currPage;
            $scope.pdfTotalPage=$scope.pdfTotalPage;
            var pdfData = $scope.currPdfData;
            if(dir=="next" && $scope.currPage < $scope.pdfTotalPage){
                $scope.currPage++;
                num++;
            }else if(dir=="prev" && $scope.currPage>1){
                $scope.currPage--;
                num--;
            }
            var url = "data/pdfdata.dat";
            var scaleInner = (scaleOut)?scaleOut:2;
            PDFJS.getDocument({data: pdfData}).then(function getPdfHelloWorld(pdf) {
                $scope.pdfObjectData = pdf;
                $scope.pdfTotalPage = pdf.numPages;
                $scope.$apply();
                $scope.getPdfPage(dir,pdf);
            });
            $rootScope.hideLoading();
        }

        $scope.getPdfPage = function(dir,pdf,scaleOut){
            var num = $scope.currPage;
            if(dir=="next" && $scope.currPage < $scope.pdfTotalPage){
                $scope.currPage++;
                num++;
            }else if(dir=="prev" && $scope.currPage>1){
                $scope.currPage--;
                num--;
            }
            pdf.getPage(num).then(function getPageHelloWorld(page) {
                $scope.currentPageContext = page;
                $scope.zoomContent(page,scaleOut);
                $rootScope.hideLoading();
            });
        }

        $scope.zoomContent = function(pageContext, scaleOut){
            //console.log("Called Zoom Content Functon");
            var scale = (scaleOut)?scaleOut:1;
            var viewport = pageContext.getViewport(scale);
            var parentCanvasHolder = document.getElementById('parentCanvasHolder');
            var oldCanvas = document.getElementById('pdfcanvas');
            parentCanvasHolder.removeChild(oldCanvas);
            var newCanvas = document.createElement("CANVAS");
            newCanvas.id = "pdfcanvas";
            parentCanvasHolder.appendChild(newCanvas);
            var canvas = document.getElementById('pdfcanvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width,canvas.height);
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            pageContext.render(renderContext);
        }

        $scope.customPDFHTTP = function(HTTPObject) {};

        $scope.customGoodHTTP = function(HTTPObject) {
            console.log("SM Attesation Call Start:"+ new Date());
            setTimeout(function(){
                HTTPObject.serviceData.send(HTTPObject.successFun, HTTPObject.errorFun);
            }, $rootScope.setTimeOutLoader);
        };

        $scope.customGoodPDFHTTP = function(HTTPObject) {
                console.log("SM Attesation Call Start:"+ new Date());
                HTTPObject.serviceData.send(HTTPObject.successFun, HTTPObject.errorFun);
        };

        $scope.customHTTP = function(HTTPObject) {};

        $scope.rejectAttestation = function(record, rejectComment) {
            var rejectParams = {
                intAttestation: record.intAttestationId + '',
                comments: rejectComment,
                emailFrom: $rootScope.entitlementsData.userEmailId,
                emailTo: record.Email,
                fullNameFrom: $rootScope.entitlementsData.userFullName,
                deskName: record['Desk Name'],
                firstNameTo: ""
            }
            var params = {
                ATTESTATION_DASH_REQ: escape(JSON.stringify(rejectParams)),
                REQ_PARAM: escape(JSON.stringify($scope.reqparams))
            }
            var sendURL = datafactory.getRejectAttesationCall(params);
            var successFun = function(response) {
                console.log("SM Attesation Call End:"+ new Date());
                $scope.populateSenMgrData();
            }
            var errorFun = function(response) {
                $scope.showFailPopUp("E120");
                $rootScope.hideLoading();
                //Handle error
            }
            var HTTPObject = {
                params: params,
                serviceData: sendURL,
                successFun: successFun,
                errorFun: errorFun
            };

            $scope.customGoodHTTP(HTTPObject);
        }

        $scope.attestCombined = function(attestComment) {

            var intAttestCombined = '';
            var pdfFileName = [];
            $scope.attestationData.forEach(function(item) {
                intAttestCombined += item.intAttestationId + ',';
                pdfFileName.push(item.PDFFileName);
            });
            intAttestCombined = intAttestCombined.substring(0, intAttestCombined.length - 1);
            var attestParams = {
                productId: $rootScope.productSMFilter.selected,
                userId: $rootScope.entitlementsData.userId,
                regionId: $rootScope.regionSMAttesationfilters.selected,
                intAttestationType: $rootScope.entitlementsData.int,
                mgrUploadId: intAttestCombined,
                comments: attestComment,
                userName: $rootScope.entitlementsData.userFullName,
                pdfFileNames: pdfFileName
            };
            var params = {
                ATTESTATION_DASH_REQ: escape(attestParams)
            }
            var sendURL = datafactory.getCombinedAttesationCall(params);
            var successFun = function(response) {
                $scope.populateSenMgrData();
                console.log("SM Attesation Call End:"+ new Date());
            }
            var errorFun = function(response) {
                $scope.showFailPopUp("E120");
                $rootScope.hideLoading();
                //Handle error
            }
            var HTTPObject = {
                params: params,
                serviceData: sendURL,
                successFun: successFun,
                errorFun: errorFun
            };
            $scope.customGoodHTTP(HTTPObject);
        }


        if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true")
            && $rootScope.entitlementsData.triggeredSeparateFilter === true){
            $rootScope.pageName = "SMATTESTATION";
            $rootScope.$emit("triggerFreshFilter", "INITIAL");
        } else{
            $scope.populateSenMgrData("FIRST");
        }
    })
.controller('smEscalation', function($scope, $rootScope, $window, datafactory, $http, $ionicPopup, $ionicPopover, $stateParams, $state, $ionicLoading) {

    $scope.data = {};
    $scope.data.managerData = [];
    $scope.newManagerData = [];
    $scope.data.selectedManager = [];
    $scope.newSelectedManager = [];
    $scope.data.lookupVal = '';
    $scope.managerPopover;
    $scope.data.escalationComment;
    $scope.data.deskName = $stateParams.deskName;
    $scope.data.pdfFileName = $stateParams.pdfFileName;

    $ionicPopover.fromTemplateUrl('templates/iPhone/managerpopover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.managerPopover = popover;
    });;

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
    }

    $scope.showMessagePopUp = function(message){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Message',
            template: message,
            okText: 'Ok'
        });
    }

    $scope.onLookupInput = function(args, inputText) {
        var valToSearch = inputText;
        var params = {
            USER_ID: escape(valToSearch)
        }
        var sendURL = datafactory.getManagerLookupCall(params);
        var successFun = function(responseObj) {
            console.log("SM Attesation Call End:"+ new Date());
            var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            var response = JSON.parse(responseObjData.responseText);
            $scope.newManagerData = response.keyList;
            $scope.syncBothLists();
            $scope.$apply();
        }
        var errorFun = function(response) {
            $scope.showFailPopUp("E120");
            $rootScope.hideLoading();
            //Handle error
        }
        var HTTPObject = {
            params: params,
            serviceData: sendURL,
            successFun: successFun,
            errorFun: errorFun
        };
        if (valToSearch.length > 3){
            $scope.customGoodHTTP(HTTPObject);
        }

    };

    $scope.customGoodHTTP = function(HTTPObject) {
            console.log(" SM Escalation Call Start:"+ new Date());
            setTimeout(function(){
                HTTPObject.serviceData.send(HTTPObject.successFun, HTTPObject.errorFun);
            }, $rootScope.setTimeOutLoader);
        };

    $scope.itemClick = function(item) {
        var array = $scope.newSelectedManager;
        var found = array.find(function(argument) {
            return argument.loginName == item.loginName;
        });
        if (!found) {
            array.push(item);
            item['isSelected'] = "greenItem";
        } else {
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Manager already present in the list. Tap upper right corner to see the selected managers'
            });
        }
    }
    $scope.openManagerPopover = function(evt) {
        $scope.managerPopover.show(evt);
    }
    $scope.deleteSelectedManager = function(index) {
        $scope.newSelectedManager.splice(index, 1);
        $scope.syncBothLists();
    }
    $scope.syncBothLists = function(argument) {
        $scope.newManagerData.forEach(function(manager) {
            var selected;
            selected = $scope.newSelectedManager.find(function(argument) {
                return argument.loginName == manager.loginName;
            });
            if (selected)
                manager['isSelected'] = "greenItem";
            else
                manager['isSelected'] = "";
        });
    }
    $scope.sendEscalation = function() {
        var emailIds = [];
        $scope.newSelectedManager.forEach(function(item) {
            emailIds.push(item.emailId);
        })
        var params = {
            email_to: escape(emailIds.join()),
            email_from: escape($rootScope.entitlementsData.userEmailId),
            DESK: escape($scope.data.deskName),
            COMMENTS: escape($scope.data.escalationComment),
            pdfFileName: escape($scope.data.pdfFileName)

        }
        var sendURL = datafactory.getSendEscalationCall(params);
        var successFun = function(response) {
            console.log("SM Attesation Call End:"+ new Date());
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Email sent successfully.'
            });
            $state.go('app.smAttestation');
        }
        var errorFun = function(response) {
            $scope.showFailPopUp("E120");
            $rootScope.hideLoading();
        }
        var HTTPObject = {
            params: params,
            serviceData: sendURL,
            successFun: successFun,
            errorFun: errorFun
        };
        $scope.customGoodHTTP(HTTPObject);
    }
    $scope.customHTTP = function(HTTPObject) {};
});
