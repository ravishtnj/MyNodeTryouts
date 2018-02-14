angular.module('starter.controllers', ['ionic','chart.js','nvd3','ngRadialGauge'])

.controller('LoginCtrl',function($scope,$window,$rootScope,$state,datafactory, $ionicLoading, $http, $ionicPopup, $ionicHistory){
    $scope.$on("$ionicView.enter", function () {
        //console.log("Cache Clearer");
       $ionicHistory.clearCache();
       $ionicHistory.clearHistory();
       //console.log($rootScope.$$listeners);
       var masterArray = ["triggerFreshFilter","callDashboardCall","callBulksignoffCall","callAttesationCall","callAttesationRegionCall","callAttesationDefaultCall","callSummaryStatusCall","loadSMFilterApply","callRendergraph"]
        for(var i in masterArray){
            if($rootScope.$$listeners[masterArray[i]] != undefined){
                $rootScope.$$listeners[masterArray[i]] = [];
            }
        }
        $scope.roleTriggered = false;
        //console.log($rootScope.$$listeners);
    });
    $scope.soeid;
    $scope.authResults;
    $scope.roleTriggered = false;
    $scope.status;
    $rootScope.setTimeOutLoader = 0;
    $scope.adminRoleValue = {value : "1"};
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
    $rootScope.loadingMessage = '<ion-spinner icon="spiral"></ion-spinner>';
    
    $rootScope.showLoading = function(){
        //console.log("Called Loader");
        if($rootScope.isService === true){
            var options = { dimBackground: true };
            SpinnerPlugin.activityStart("Loading...", options);
        }
    }

    $rootScope.hideLoading = function(){
        //console.log("Hide Loader");
        if($rootScope.isService === true){
            SpinnerPlugin.activityStop();
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
                $scope.doLogin(userId);
            } else{
                $rootScope.hideLoading();
                $scope.showFailPopUp('E133');
            }
        } catch(e) {
            $rootScope.hideLoading();
            $scope.showFailPopUp('E133');
        }
    };
   
    $scope.applicationConfigFail = function(result) {
          $rootScope.hideLoading();
          $scope.showFailPopUp('E133');
    };

    $scope.getApplicationConfiguration = function(){
        $rootScope.showLoading();
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
        } else{
            $scope.showFailPopUp('E134');
        }
        $rootScope.hideLoading();
    };

    $scope.doLogin = function(userId) {
        if($rootScope.isService === true){
            var creds = {
                "requestType":"validateUser",
                //"uid" : "tk02483",
                //"uid":"KR47652",
                "uid":"HS61655",
                //"uid": "AM61960",
                //"uid": "AR50360",
                //"uid": userId,
                "pwd": "",
            };
            $rootScope.creds = creds;
            function sendSuccess(response) {
            //console.log(response);
                console.log("Entitlement Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    $scope.loginSuccess(responseObj);
                } catch(e) {
                    $rootScope.hideLoading();
                    $scope.showFailPopUp('E102');
                }
             }
        
            function sendFail(response) {
                console.log(response);
                $rootScope.hideLoading();
                $scope.showFailPopUp('E101');
            }

            var authentication = datafactory.getAuthentication(creds);
            setTimeout(function(){ 
                console.log("Entitlement Call Start:"+ new Date());
                authentication.send(sendSuccess,sendFail);
            }, $rootScope.setTimeOutLoader);
        }
   };       
})

.controller('AppCtrl', function($rootScope,$scope, $stateParams,$window, $http,$timeout,$ionicPopover,datafactory, $ionicHistory, $ionicPopup, $state, $ionicLoading, $ionicPopup, $ionicTabsDelegate, $ionicSideMenuDelegate) {
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

    $scope.formatDate = function(dateVal){
        var fullDate = new Date(dateVal);
        var month = parseInt(fullDate.getMonth()) + 1;
        var dateValue = month+"/"+fullDate.getDate()+"/"+fullDate.getFullYear();
        return ""+dateValue;
    }
    
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
        $state.go("login");
    }

    $scope.showFilterDatePicker = function(){
        var currDate = new Date();
        var currDateUTC =Date.UTC(currDate.getFullYear(),currDate.getMonth(),currDate.getDate());
        var minDateUTC = parseInt(currDateUTC) - 2592000000;
        var options = {
          date: $rootScope.defaultSelectedFilters.datefilter,
          maxDate: new Date(),
          minDate: new Date(minDateUTC),
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
          maxDate: new Date(),
          minDate: new Date(minDateUTC),
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
          date: $rootScope.defaultSelectedFilters.dateDashboardfilter,
          maxDate: new Date(),
          minDate: new Date(minDateUTC),
          mode: 'date'
        };
              
        function onSuccess(date) {
            if(date !== undefined){
                $rootScope.defaultSelectedFilters.dateDashboardfilter = $scope.formatDate(date);
                $scope.$apply();
            }
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
        console.log("Business Filter Call End:"+ new Date());
            //console.log(response);

        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") 
                    && $rootScope.filterCallType === "DASHBOARD"){
                $rootScope.businessDashboardfilters = JSON.parse(responseObj.responseText);
                if($rootScope.enableGlobalDashboardReport === true && $rootScope.pageName === "NONE"){
                    $rootScope.businessDashboardfilters.selected = "0";                    
                }
            }else{
                if(($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "DASHBOARD") && $rootScope.entitlementsData.hasQlikviewAccess === false){
                    $rootScope.businessDashboardfilters = JSON.parse(responseObj.responseText);

                    if($rootScope.filterCallType === "INITIAL" && $rootScope.enableGlobalDashboardReport === true && $rootScope.pageName === "NONE"){
                        $rootScope.businessDashboardfilters.selected = "0";                    
                    }
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "SUMMARY"){
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

            $scope.triggerRegionFilter($rootScope.filterCallType);
        } catch(e) {
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }
    
    $scope.processRegionFilter = function(response){
        console.log("Region Filter Call End:"+ new Date());
            //console.log(response);

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
            $scope.triggerDeskFilter($rootScope.filterCallType);
        } catch(e) {
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }
    
    $scope.processAttestationRegionFilter = function(response){
        console.log("Attestation Business Filter Call End:"+ new Date());
        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
            var parsedData = JSON.parse(responseObj.responseText);
            $rootScope.regionAttesationfilters = JSON.parse(responseObj.responseText);
            $scope.triggerAttestationRegionFilter();
        } catch(e) {
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }

    $scope.processDeskFilter = function(response){
        console.log("Desk Filter Call End:"+ new Date());
            console.log(response);

        try {
            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
            var formatData = JSON.parse(responseObj.responseText);
            var selectedId = [];
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
                }
                    
                if(($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "DASHBOARD") && $rootScope.entitlementsData.hasQlikviewAccess === false){
                    $rootScope.deskDashboardfilters = formatData;
                    $rootScope.defaultSelectedFilters.deskDashboardfilter = selectedId.join(",");
                }

                if($rootScope.filterCallType === "INITIAL" || $rootScope.filterCallType === "STATUSSUMMARY"){
                    $rootScope.deskSummaryfilters = formatData;
                    $rootScope.defaultSelectedFilters.deskSummaryfilter = selectedId.join(",");
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
            $rootScope.hideLoading();
            $scope.showFailPopUp('E105');
        }
    }
    
    $scope.processErrorServiceCall = function(response){
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
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var paramForBusiness = {
                    "uid": (($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"":$rootScope.entitlementsData.userId,
                    "cType":"COMBO",
                    "cName":(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"QLIK_VIEW_BUSINESS_LINE":"BUSINESS_LINE",
                    "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
            console.log("Business filter input params");
            //console.log(JSON.stringify(paramForBusiness));
            var businessFilterDetail = datafactory.getBusinessFilter(paramForBusiness);
            setTimeout(function(){
                console.log("Business Filter Call Start:"+ new Date()); 
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
        for(var i in $rootScope.deskfilters){
            for(var j in $rootScope.deskfilters[i].children){
                if($rootScope.deskfilters[i].children[j].id == checkId){
                    $rootScope.deskfilters[i].children[j].deskStatus = checkOption;    
                }
            }
        }
    }

    $scope.triggerAllOptionsDashboard = function(checkOption){
        $scope.deskCheckAllDasboardStatus = checkOption;
        for(var i in $rootScope.deskDashboardfilters){
            for(var j in $rootScope.deskDashboardfilters[i].children){
                $rootScope.deskDashboardfilters[i].children[j].deskStatus = checkOption;
            }
        }
    }

    $scope.setCurrentCheckBoxDashboard = function(checkOption, checkId){
        for(var i in $rootScope.deskDashboardfilters){
            for(var j in $rootScope.deskDashboardfilters[i].children){
                if($rootScope.deskDashboardfilters[i].children[j].id == checkId){
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
        for(var i in $rootScope.deskSummaryfilters){
            for(var j in $rootScope.deskSummaryfilters[i].children){
                if($rootScope.deskSummaryfilters[i].children[j].id == checkId){
                    $rootScope.deskSummaryfilters[i].children[j].deskStatus = checkOption;    
                }
            }
        }
    }

    $scope.triggerRegionFilter = function(callType){
        $rootScope.filterCallType = callType;
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
                "cType":"COMBO",
                //"cName":"REGION",
                "cName":(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD")?"QLIK_VIEW_REGION":"REGION",
                "BUSINESS_LINE":BUSINESSID,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
            if(($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true") && callType ==="DASHBOARD"){
                //console.log("Make UID undefined");
            } else{
                paramForRegion.uid = $rootScope.entitlementsData.userId;
            }
           //console.log("params for Region"+JSON.stringify(paramForRegion));
            var regionFilterDetail = datafactory.getRegionFilter(paramForRegion);
            setTimeout(function(){
                console.log("Region Filter Call Start:"+ new Date()); 
                regionFilterDetail.send($scope.processRegionFilter,$scope.processErrorServiceCall);
            }, $rootScope.setTimeOutLoader);
        } 
    }

    $scope.triggerDeskFilter = function(callType){
        $rootScope.filterCallType = callType;
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var REGIONID,UID, CNAME;
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

            var deskFilterDetail = datafactory.getDeskFilter(paramForDesk);
           // console.log("Param for Desk "+JSON.stringify(paramForDesk));
            setTimeout(function(){
                console.log("Desk Filter Call Start:"+ new Date()); 
                deskFilterDetail.send($scope.processDeskFilter,$scope.processErrorServiceCall);
            }, $rootScope.setTimeOutLoader);
        } 
    } 
    if($rootScope.entitlementsData.hasQlikviewAccess == true || $rootScope.entitlementsData.hasQlikviewAccess == "true"){
        $scope.triggerBusinessFilter("DASHBOARD");
    } else{
        $scope.triggerBusinessFilter("INITIAL");
    }

    $rootScope.$on("triggerFreshFilter", function(eventObj,typeCall){
       $scope.triggerBusinessFilter(typeCall);
    });

    $scope.applyFilter = function(){
        var selectedId = new Array();
        for(var i in $rootScope.deskfilters){
            for(var j in $rootScope.deskfilters[i].children){
                if($rootScope.deskfilters[i].children[j].deskStatus === true || $rootScope.deskfilters[i].children[j].deskStatus === 'true'){
                    selectedId.push($rootScope.deskfilters[i].children[j].id);
                }
            }
        }

        $rootScope.defaultSelectedFilters.deskfilter = selectedId.join(",");
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var creds = {
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","deskId":"'+$rootScope.defaultSelectedFilters.deskfilter+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}')
            };
        
            $scope.sendSuccess = function(response) {
                console.log("Dashboard Summary Filter Call End:"+ new Date());
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
                    $rootScope.listData = formatData;
                    $rootScope.hideLoading();
                    $scope.$apply();
                } catch(e) {
                    $scope.showFailPopUp('E110');
                    $rootScope.hideLoading();
                }
            }
        
            $scope.sendFail = function(response) {
                $scope.showFailPopUp('E109');
                $rootScope.hideLoading();
            }
        
            var signOffList = datafactory.getSignoffList(creds);
            setTimeout(function(){ 
                console.log("Dashboard Summary Filter Call Start:"+ new Date());
                signOffList.send($scope.sendSuccess,$scope.sendFail);
            }, $rootScope.setTimeOutLoader);
        }
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.triggerAttesationBusinessRegionFilter = function(callType){
        if($rootScope.isService === true){
            $rootScope.showLoading();
            var paramForRegion = {
                "uid": $rootScope.entitlementsData.userId,
                "cType":"COMBO",
                "cName":"REGION",
                "BUSINESS_LINE":$scope.businessAttesationfilters.selected,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""},"IRIS_GLOBALS":{"IRIS_ReqType":"FLEX","IRIS_CompId":"1","IRIS_NuggetId":"1","IRIS_RenderAs":"SingleSelect","IRIS_ResType":"","anode":""}}')
            };
            var regionFilterDetail = datafactory.getRegionFilter(paramForRegion);
            setTimeout(function(){ 
                console.log("Attestation Business Filter Call End:"+ new Date());
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
                    selectedId.push($rootScope.deskDashboardfilters[i].children[j].id);
                }
            }
        }
        $rootScope.defaultSelectedFilters.deskDashboardfilter = selectedId.join(",");
        $rootScope.loadedExceptionByWeek = false;
        $rootScope.misDashboardCallTypeInitial = "false";
        $rootScope.$emit("callDashboardCall", {type:$rootScope.misDashboardCallTypeInitial});
        $ionicSideMenuDelegate.toggleRight(0);
    }

    $scope.applySummaryFilter = function(){
        var selectedId = new Array();
        for(var i in $rootScope.deskSummaryfilters){
            for(var j in $rootScope.deskSummaryfilters[i].children){
                if($rootScope.deskSummaryfilters[i].children[j].deskStatus === true || $rootScope.deskSummaryfilters[i].children[j].deskStatus === 'true'){
                    selectedId.push($rootScope.deskSummaryfilters[i].children[j].id);
                }
            }
        }
        $rootScope.defaultSelectedFilters.deskSummaryfilter = selectedId.join(",");
        $rootScope.$emit("callSummaryStatusCall", {});
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
            console.log("Attestation Desk Filter Call End:"+ new Date());
            try {
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
                $rootScope.attestationDeskFilter = parsedData;
                $rootScope.hideLoading();
            } catch(e) {
                $scope.showFailPopUp('E105');
                $rootScope.hideLoading();
            }
        }

        function attestationFilterFail(response){
            $scope.showFailPopUp('E104');
            $rootScope.hideLoading();
        }

        var attesationDeskFilterList = datafactory.getAttesationDeskFilter(creds);
        setTimeout(function(){ 
                console.log("Attestation Desk Filter Call Start:"+ new Date());
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
        $rootScope.setDBFilterOptions();
    }

    $rootScope.setDBFilterOptions = function(){
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

        //$scope.applyDashboardFilter();
        //$rootScope.$emit("callRendergraph", {});

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
            
    $rootScope.updateNotifyFilterOptions = function() {
          
            console.log("notify filter action");
            
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
        
        $rootScope.SMAttestationRegionFilterHide = true;
        $rootScope.SMProductFilterHide = true;
        $rootScope.SMDateDashboardFilterHide = true;
        
        $rootScope.showSignOffFilter = true;
        $rootScope.showAttestationFilter = true;
        $rootScope.showDashboardFilter = true;
        $rootScope.showSMAttestFilter = true;
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
        if($state.current.name === "app.details"){
           $rootScope.resetFilterOptions();
           $state.go("app.metrics"); 
        } else if($state.current.name === "app.smEscalation"){
           $rootScope.updateSAFilterOptions();
           $state.go("app.smAttestation"); 
        } else if ($state.current.name == "app.notifySettings"){
            $state.go("app.notifications")
        }else if($state.current.name == "app.summary"){
            $state.go("app.notifications")
        }else if($state.current.name == "app.deskMapping"){
            $state.go("app.notifications")
        }else{
            $rootScope.setDBFilterOptions();
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
    $scope.unseenAlertCount = 0;

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
    }

    $scope.lineChart = function(dataset){
        var sDataArray = [100,250,450,230,380,280];
        var dataArray = [];
        var xValues = [];
        var maxValue = 0;
        for(i=0;i<dataset.length;i++)
        {
            var dateParse = dataset[i].reportDate.split("/");
            if(dateParse.length === 3){
                var asDate = Date.UTC(dateParse[0],parseInt(dateParse[1])-1,parseInt(dateParse[2]));   
            } else{
                var currDate = new Date(dataset[i].reportDate);
                var asDate = Date.UTC(currDate.getFullYear(),parseInt(dateParse[0])-1,parseInt(dateParse[1]));  
            }
            
            if(parseInt(dataset[i].exceptions) > maxValue){
                maxValue = parseInt(dataset[i].exceptions);
            }

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
                color: d3.scale.category10().range(),
                duration: 300,
                useInteractiveGuideline: false,
                clipVoronoi: false,
                showLegend: false,
                forceY: [0,7],
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                        var nDate = new Date(d);
                        var mnthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        return parseInt(nDate.getDate()) +"-"+ mnthArray[nDate.getMonth()];
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
                    axisLabelDistance: 10
                }
            }
        };

        $scope.linechartdata = [{ key:"Exceptions", values:dataArray, mean: 0 }];
    }

    $ionicPopover.fromTemplateUrl('dashboard-popover.html', {
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
                    left: maxLength * 6
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

        $scope.horzbardata =[{ "color": "#09D8D2", "values": dataArray }];
    }

    $scope.showDetailsPopup = function($event,currentDetailData){
        $scope.currentData = currentDetailData;
        $scope.myDetailsPopup.show();
    }

    $scope.closeDetailsPopup = function(){
        $scope.myDetailsPopup.hide();
    }

    $scope.callChangeFunction = function(index){
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
                        businessId = "";
                    }
                    var creds = {
                        "uid": $rootScope.entitlementsData.userId,
                        "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+regionId+'","deskId":"'+deskIds+'","date":"'+dateVal+'","businessLine":"'+businessId+'"}')
                    
                    };
                    $scope.sendDBByWeekCallSuccess = function(response) {
                        console.log("Dashboard Exception Week Call End:"+ new Date());
                        try {
                            var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                            var formatData = JSON.parse(responseObj.responseText);
                            var recordData = formatData;
                            $rootScope.loadedExceptionByWeek = true;
                            $scope.lineChart(recordData.exceptionsByMonth);
                        } catch(e) {
                            //console.log(e);
                            $scope.showFailPopUp("E108");
                        }
                        $rootScope.hideLoading();
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                
                    $scope.sendDBByWeekCallFail = function(response) {
                        $rootScope.hideLoading();
                        $scope.showFailPopUp("E106");
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                
                    var dashboardExceptionWeekList = datafactory.getExceptionByWeekDashboard(creds);
                    setTimeout(function(){ 
                        console.log("Dashboard Exception Week Call Start:"+ new Date());
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
        parsedFunctionData = recordData.exceptionsByFunction;
        parsedProductData = recordData.exceptionsByProduct;
        parsedManagerData = recordData.exceptionsByManager;
        //parsedExceptionsByMonth = recordData.exceptionsByMonth;
        parsedPendingSignoff = recordData.pendingSignoff;
        
        if(recordData.outstandingExceptions != undefined && recordData.outstandingExceptions.length > 0){
            parsedOutstandingExceptions = recordData.outstandingExceptions; 
            $scope.showOutStandingExceptions = true;   
        } else{
            $scope.showOutStandingExceptions = false;
        }

        if(recordData.exceptionsRedAndAmber != undefined && recordData.exceptionsRedAndAmber.length > 0 && recordData.exceptionsRedAndAmber[0].totalexceptions != ""){
            parsedRedAmberExceptions = recordData.exceptionsRedAndAmber;
            $scope.showRedAmberExceptions = true; 
        } else{
            $scope.showRedAmberExceptions = false;
        }
        
        if(recordData.pendingSignoff != undefined && recordData.pendingSignoff.length > 0 && recordData.pendingSignoff[0].totalexceptions != ""){
            $scope.showPendingSignOffExceptions = true; 
        } else{
            $scope.showPendingSignOffExceptions = false; 
        }

        if(recordData.exceptionsByFunction != undefined && recordData.exceptionsByFunction.length > 0){
            $scope.showExceptionsByFunction = true; 
        } else{
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

        var totalRecord  = parseInt(formatData.totalGreenExceptions) + parseInt(formatData.totalAmberExceptions) + parseInt(formatData.totalredExceptions);
        $scope.dbProductData = productData;
        $scope.dbFunctionData = functionData;
        $scope.productMaxLength = productMaxLength;
        $scope.functionMaxLength = functionMaxLength;

        $scope.productListData = parsedProductData;
        $scope.functionListData = parsedFunctionData;     
        $scope.managerListData = parsedManagerData;
        $scope.createExceptionsDashboard1();
        if(recordData.pendingSignoff != undefined && recordData.pendingSignoff.length > 0 && recordData.pendingSignoff[0].TotalExceptions != ""){
            $scope.createPendingSingoffProgress(parsedPendingSignoff[0]);
        }
        //$scope.lineChart(parsedExceptionsByMonth);
        $scope.createTopDials(parsedOutstandingExceptions,parsedRedAmberExceptions);
        $scope.horzBarChart(categoryMaxLength);
        $scope.createCategoryGraph(categoryDataLabel,categoryGraphData);
        $rootScope.initialDBCall = false;
    }
            
   
    $scope.callLocalOrService = function(isService,callTypeInitial){
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
                    businessId = "";
                }
            }
            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+regionId+'","deskId":"'+deskIds+'","date":"'+dateVal+'","businessLine":"'+businessId+'"}')
            
            };

            $scope.sendDBCallSuccess = function(response) {
                console.log("MIS Dashboard Call End:"+ new Date());
            //console.log("Dashboard Call Response "+response);
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.dashboardRawData = formatData;
                    $scope.renderDashboardGraph(formatData, false);
                    $rootScope.loadedExceptionByWeek = false;
                } catch(e) {
                    $scope.showFailPopUp("E107");
                }
                $rootScope.hideLoading();
                $scope.getAlertsCount();
                $scope.$broadcast('scroll.refreshComplete');
            }
        
            $scope.sendDBCallFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E106");
                $rootScope.initialDBCall = false;
                $scope.$broadcast('scroll.refreshComplete');
            }
        
            //console.log("Dashboard Call Response "+JSON.stringify(creds));

            var dashboardList = datafactory.getDashboard(creds);
            
            setTimeout(function(){ 
                console.log("MIS Dashboard Call Start:"+ new Date());
                dashboardList.send($scope.sendDBCallSuccess,$scope.sendDBCallFail);
            }, $rootScope.setTimeOutLoader);
            
        }
            
    }

    $scope.getAlertsCountSuccess = function(responseObj)
    {
        var response = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            console.log(response);
            $scope.unseenAlertCount = 10;
            $scope.$apply();
    }
    
    $scope.getAlertsCountFailure = function(responseObj)
    {
        var response = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
        console.log(response);
    }
          
    $scope.getAlertsCount = function(){
            
            var alertCreds = {
            appId: 47,
            USER_SOEID: $rootScope.entitlementsData.soeId,
            destApp: 'APNS'
            }
            var alertsServiceURL = datafactory.getAlertsCount(alertCreds);

            alertsServiceURL.send($scope.getAlertsCountSuccess,$scope.getAlertsCountFailure);
    }

    $rootScope.$on("callDashboardCall", function(param){
       $scope.callLocalOrService($rootScope.isService, param.type);
    });

    $rootScope.$on("callRendergraph", function(){});
    $scope.goDetails = function(){ $state.go('app.details'); };
            
    $scope.gotoAlerts=function(){ $state.go('app.notifications'); };
            
})

.controller('DetailsCtrl', function($rootScope,$scope, $stateParams, $http,$timeout,$ionicPopover,datafactory, $ionicPopup, $window, $ionicLoading, $ionicPopup, $ionicTabsDelegate) {
    
    $rootScope.signOffComments = "";
    $ionicPopover.fromTemplateUrl('signoff-popover.html', {
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
        
            $scope.sendSuccess = function(response) {
                console.log("Dashboard Summary Details Call End:"+ new Date());
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
                        formatData.records[i].checkboxClass = flagCheckClass;

                        var exceptionsWidth = 0;
                        var greenTotalVal = formatData.records[i].greenTotal.toString();
                        var amberTotalVal = formatData.records[i].amberTotal.toString();
                        var redTotalVal = formatData.records[i].redTotal.toString();
                        var totalVal = (parseInt(formatData.records[i].greenTotal) + parseInt(formatData.records[i].amberTotal) + parseInt(formatData.records[i].redTotal)).toString();
                        
                        if(greenTotalVal.length > exceptionsWidth){ exceptionsWidth = greenTotalVal.length; }
                        if(amberTotalVal.length > exceptionsWidth){ exceptionsWidth = amberTotalVal.length; }
                        if(redTotalVal.length > exceptionsWidth){ exceptionsWidth = redTotalVal.length; }
                        formatData.records[i].exceptionWidth = 30;
                        formatData.records[i].totalWidth = 30;

                        if(exceptionsWidth >= 4){ formatData.records[i].exceptionWidth += exceptionsWidth * 3; }
                        if(totalVal.length >= 4){ formatData.records[i].totalWidth += totalVal.length * 3; }
                    }

                    $scope.collection = formatData; 
                    $scope.playlists = $scope.collection.records;
                    $scope.$apply();
                    $rootScope.hideLoading();
                    if($rootScope.enableAnalytics === true){
                        datafactory.irisAnalytics({"uid": $rootScope.entitlementsData.soeId,"PAGE_NAME": $rootScope.pageNames.SIGNOFFLIST, "DETAILS": "SIGNOFFLIST"  });
                    }
                } catch(e) {
                    $rootScope.hideLoading();
                    $scope.showFailPopUp("E112");
                }
            }
        
            $scope.sendFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E111");
            }
        
            var bulkSignOff = datafactory.getBulkSignoff(creds);
            setTimeout(function(){ 
                console.log("Dashboard Summary Details Call Start:"+ new Date());
                bulkSignOff.send($scope.sendSuccess,$scope.sendFail); 
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.callLocalOrService($rootScope.isService);

    $scope.goSignOff = function($event) { $scope.popover.show($event); };

    $scope.showDetailsPopup = function($event, catDeskId, reportId)
    {
        var postParam = {
            "TRADE_REQ" : escape('{"intCatDeskId":"'+catDeskId+'"}'),
            "TRADE_DETAILS_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","categoryId":"","reportCategory":"","deskId":"'+catDeskId+'","reportId":"'+reportId+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}'),
            "intCatDeskId": catDeskId
        }

        if($rootScope.isService === true){
            $rootScope.showLoading();
            $scope.tradeDetailsSuccess = function(response) {
                console.log("Trade Details Pop up Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.popupDetailsData = formatData.data[0];
                    var urlTemplates;
                    if(!ionic.Platform.isIPad()){
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
                    $scope.showFailPopUp("E113");
                }
                $rootScope.hideLoading();
            }
        
            $scope.tradeDetailsFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E111");
            }
        
            var tradeDetails = datafactory.getTradeDetails(postParam);
            setTimeout(function(){ 
                console.log("Trade Details Pop up Call Start:"+ new Date());
                tradeDetails.send($scope.tradeDetailsSuccess,$scope.tradeDetailsFail);
            }, $rootScope.setTimeOutLoader);
        }
    };

    $scope.closeDetailsPopup = function(){ $scope.myPopup.close(); };

    $scope.commentsDone = function(){
        var selectedId = new Array();
        for(var i in $scope.playlists){
            if($scope.playlists[i].checkboxStatus === true || $scope.playlists[i].checkboxStatus === 'true'){
                selectedId.push($scope.playlists[i].intCatDeskId);
            }
        }

        var creds = {
            "uid": $rootScope.entitlementsData.userId,
            "signoffComments":$scope.popover.textcomments,
            "isAdmin": $rootScope.entitlementsData.isDailySignOffAdmin,
            "regionId":$rootScope.regionfilters.selected,
            "intCatDeskId":selectedId.join(",")
        };

        if($rootScope.isService === true){
            if(selectedId.length > 0){
                $rootScope.showLoading();
                $scope.signOffSuccess = function(response) {
                    console.log("Sign Off Comments Call End:"+ new Date());
                    try{
                        var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                        var formatData = JSON.parse(responseObj.responseText);
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
                        $scope.showFailPopUp("E114");
                    }
                    $rootScope.hideLoading();
                }
            
                $scope.signOffFail = function(response) {
                    $scope.showFailPopUp("E111");
                    $rootScope.hideLoading();
                }
            
                var signOffComments = datafactory.signOffComments(creds);
                setTimeout(function(){ 
                    console.log("Sign Off Comments Call Start:"+ new Date());
                    signOffComments.send($scope.signOffSuccess,$scope.signOffFail);
                }, $rootScope.setTimeOutLoader);
                $scope.popover.hide();
            } else{
                $scope.showFailPopUp("E133");
            }
        } else{
            $scope.popover.hide();
        }
    };

    $scope.closePopover = function() {
      $scope.popover.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
})

.controller('SignoffCtrl', function($scope, $stateParams, $http,$rootScope,$timeout,$ionicPopover,datafactory,$state,$window, $ionicLoading,$ionicPopup, $ionicTabsDelegate) {
    $scope.parseInt = parseInt;
    $scope.labels = ["A","B","C"];
    $scope.data = [100,200,300];
    $scope.showNoDataAvail = false;

    $scope.formatDate = function(dateVal){
        var fullDate = new Date(dateVal);
        var month = parseInt(fullDate.getMonth()) + 1;
        var dateValue = month+"/"+fullDate.getDate()+"/"+fullDate.getFullYear();
        return ""+dateValue;
    } 

    $scope.showFailPopUp = function(ecode){
        $scope.loginFailPopup = $ionicPopup.alert({
            title: 'Error - '+ecode,
            template: errorCodeUtility.getErrorCode(ecode),
            okText: 'Ok'
        });
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
        if(isService === true){
            $rootScope.showLoading();
            var creds = {
                "uid": $rootScope.entitlementsData.userId,
                "DASH_REQ" : escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionfilters.selected+'","businessLine":"'+$rootScope.businessfilters.selected+'","deskId":"'+$rootScope.defaultSelectedFilters.deskfilter+'","date":"'+$scope.formatDate($rootScope.defaultSelectedFilters.datefilter)+'"}')
            };

            $scope.sendSuccess = function(response) {
                console.log("Dashboard Summary Call End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var parsedData = JSON.parse(responseObj.responseText)
                    var formatData = parsedData.data;
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
                            formatData[i].records[j].labels = ["A","B"];
                            formatData[i].records[j].colours = ["#444","#FF3019"]
                            var exceptionsWidth = 0;
                            var greenTotalVal = formatData[i].records[j].greenTotal.toString();
                            var amberTotalVal = formatData[i].records[j].amberTotal.toString();
                            var redTotalVal = formatData[i].records[j].redTotal.toString();
                            var totalVal = (parseInt(formatData[i].records[j].greenTotal) + parseInt(formatData[i].records[j].amberTotal) + parseInt(formatData[i].records[j].redTotal)).toString();
                            
                            if(greenTotalVal.length > exceptionsWidth){ exceptionsWidth = greenTotalVal.length; }
                            if(amberTotalVal.length > exceptionsWidth){ exceptionsWidth = amberTotalVal.length; }
                            if(redTotalVal.length > exceptionsWidth){ exceptionsWidth = redTotalVal.length; }
                            formatData[i].records[j].exceptionWidth = 30;
                            formatData[i].records[j].totalWidth = 30;
                            if(exceptionsWidth >= 4){ formatData[i].records[j].exceptionWidth += exceptionsWidth * 3; }
                            if(totalVal.length >= 4){ formatData[i].records[j].totalWidth += totalVal.length * 3; }
                        }
                    }

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
                    $scope.showFailPopUp("E110");
                }
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }
        
            $scope.sendFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp("E109");
                $scope.$broadcast('scroll.refreshComplete');
            }
        
            var signOffList = datafactory.getSignoffList(creds);
            setTimeout(function(){ 
                console.log("Dashboard Summary Call Start:"+ new Date());
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
        $rootScope.listCategoryId = listCategoryId;
        $rootScope.listCategoryName = listCategoryName;
        $state.go('app.details');
        $rootScope.updateSignOffFilterOptions();
    }
})

.controller('attestationCtrl', function($scope, $stateParams, $http, $ionicScrollDelegate, $cordovaToast, $ionicPosition, $rootScope,$timeout,$ionicPopover,datafactory, $window, $ionicLoading, $ionicPopup, $ionicTabsDelegate) {
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

    $scope.formatDate = function(dateVal){
        var fullDate = new Date(dateVal);
        var month = parseInt(fullDate.getMonth()) + 1;
        var dateValue = month+"/"+fullDate.getDate()+"/"+fullDate.getFullYear();
        return ""+dateValue;
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

        function submitServiceSuccess(response){
            console.log("Manager Attestation - Submit Control Questions End:"+ new Date());
            try{
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
                if(parsedData.status === "1" || parsedData.status === 1){
                    $scope.showSubmitPop();
                    $scope.disableButtonSubmit = true;
                } else{
                    $scope.showFailPopUp('E119');
                    $scope.disableButtonSubmit = false;
                }
            } catch(e){
                $scope.showFailPopUp('E119');
                $scope.disableButtonSubmit = false;
            }
            $rootScope.hideLoading();
        }

        function submitServiceFail(response){
            $rootScope.hideLoading();
            $scope.showFailPopUp('E115');
        }

        var submitReponseAttestation = datafactory.submitAttestationQuestions(postparam);
        setTimeout(function(){ 
            console.log("Manager Attestation - Submit Control Questions Start:"+ new Date());
            submitReponseAttestation.send(submitServiceSuccess, submitServiceFail);
        }, $rootScope.setTimeOutLoader);
    }

    $scope.checkControlQuestions = function(){
        var postparam = {
            "BIND_CTRL_QSTNS_REQ": escape('{"productId":"'+$rootScope.productFilter.selected+'","attestationDate":"'+$rootScope.attestationLastDate+'","userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionAttesationfilters.selected+'","deskId":"'+$rootScope.attestationDeskFilter.selected+'"} ')
        }

        function serviceSuccess(response){
            console.log("Manager Attestation - Control Questions End:"+ new Date());
             try{
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
                if(parsedData.dtmAddedOn !== undefined){
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
                    $cordovaToast.show('This Desk has been already attested!','short','top').then(function(success) {
                        //console.log("The toast was shown");
                    }, function (error) {
                        //console.log("The toast was not shown due to " + error);
                    });
                } else{
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
                }

            } catch(e){
                $scope.showFailPopUp('E118');
            }
            $rootScope.hideLoading();
            $scope.$broadcast('scroll.refreshComplete');
        }

        function serviceFail(responseObj){
            $rootScope.hideLoading();
            $scope.showFailPopUp('E115');
            $scope.$broadcast('scroll.refreshComplete');
        }

        var attestationQuestionStatus = datafactory.getAttestationQuestionStatus(postparam);
        setTimeout(function(){ 
            console.log("Manager Attestation - Control Questions Start:"+ new Date());
            attestationQuestionStatus.send(serviceSuccess, serviceFail);
        }, $rootScope.setTimeOutLoader);
    }

    $scope.triggerAttestationCaregoryData = function(categoryId,callType){
        var creds = { "categoryId": categoryId };

        $scope.attestationDataSuccess = function(response){
            console.log("Manager Attestation - Attestation Data End:"+ new Date());
            try{
                var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                var parsedData = JSON.parse(responseObj.responseText);
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
                            parsedData.data.records[j].checkboxClass = flagCheckClass;

                            var exceptionsWidth = 0;
                            var greenTotalVal = parsedData.data.records[j].greenTotal.toString();
                            var amberTotalVal = parsedData.data.records[j].amberTotal.toString();
                            var redTotalVal = parsedData.data.records[j].redTotal.toString();
                            var totalVal = (parseInt(parsedData.data.records[j].greenTotal) + parseInt(parsedData.data.records[j].amberTotal) + parseInt(parsedData.data.records[j].redTotal)).toString();
                            
                            if(greenTotalVal.length > exceptionsWidth){ exceptionsWidth = greenTotalVal.length; }
                            if(amberTotalVal.length > exceptionsWidth){ exceptionsWidth = amberTotalVal.length; }
                            if(redTotalVal.length > exceptionsWidth){ exceptionsWidth = redTotalVal.length; }
                            parsedData.data.records[j].exceptionWidth = 30;
                            parsedData.data.records[j].totalWidth = 30;
                            if(exceptionsWidth >= 4){ parsedData.data.records[j].exceptionWidth += exceptionsWidth * 3; }
                            if(totalVal.length >= 4){ parsedData.data.records[j].totalWidth += totalVal.length * 3; }
                        }
                        $scope.listData[i].records = parsedData.data.records;

                    }
                }
                $scope.$apply();
                $ionicScrollDelegate.scrollTop();
                $scope.checkControlQuestions();
            } catch(e){
                console.log(e);
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

        var attestationDataList = datafactory.getManagerAttestationCategoryData(creds);
        setTimeout(function(){ 
            console.log("Manager Attestation - Attestation Data Start:"+ new Date());
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
        if(callType !== undefined && callType === "FILTER"){
            DESK_ID = $rootScope.attestationDeskFilter.selected;
            PRODUCT_ID = $rootScope.productFilter.selected;
        }

        if(callType !== undefined && callType === "REGIONFILTER"){
            DESK_ID = $rootScope.attestationDeskFilter.selected;
            PRODUCT_ID = "";
            REGION_ID = $rootScope.defaultSelectedFilters.regionfiltersAttestation;
        }


        if(isService){
            $rootScope.showLoading();
            var creds = {
                "uid": ""+$rootScope.entitlementsData.userId,
                "REGION_ID":REGION_ID,
                "PRODUCT": PRODUCT_ID,
                "intAttestation":"1",
                "DESK": DESK_ID,
                "REQ_PARAM": escape('{"IRIS_KEYS":{"DUMMY_PARAM":""}, "IRIS_GLOBALS":{"IRIS_ReqType":"FLEX", "IRIS_RenderAs":"SingleSelect"}}')
            };
            $scope.sendSuccess = function(response) {
                console.log("Manager Attestation - Attestation List End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var parsedData = JSON.parse(responseObj.responseText);
                    if(callType === "INITIAL"){
                        $rootScope.productFilter = parsedData.product;
                        $rootScope.attestationDeskFilter = parsedData.desk;
                        $rootScope.attestationLastDate = parsedData.attestationDate;
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
                        $scope.noCategoryData = true;
                        $rootScope.hideLoading();
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$apply();
                        $ionicScrollDelegate.scrollTop();
                    }
                } catch(e) {
                    $rootScope.hideLoading();
                    $scope.showFailPopUp('E116');
                    $scope.$broadcast('scroll.refreshComplete');
                }
            }
        
            $scope.sendFail = function(response) {
                $rootScope.hideLoading();
                $scope.showFailPopUp('E115');
                $scope.$broadcast('scroll.refreshComplete');
            }

            var attestationList = datafactory.getManagerAttestationData(creds);
            setTimeout(function(){ 
                console.log("Manager Attestation - Attestation List Start:"+ new Date());
                attestationList.send($scope.sendSuccess,$scope.sendFail);
            }, $rootScope.setTimeOutLoader);
        }
    }

    $scope.showDueDatePicker = function(){
        var options = {
          date: $scope.attestationControlQuestions.vcrDueDate,
          mode: 'date'
        };
              
        function onSuccess(date) {
            if(date !== undefined){
                $scope.attestationControlQuestions.vcrDueDate = $scope.formatDate(date);
                $scope.$apply();
            }
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
        var postParam = {
            "TRADE_REQ" : escape('{"intCatDeskId":"'+catDeskId+'"}'),
            "TRADE_DETAILS_REQ": escape('{"userId":"'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionAttesationfilters.selected+'","businessLine":"'+$rootScope.businessAttesationfilters.selected+'","categoryId":"","reportCategory":"","deskId":"'+catDeskId+'","reportId":"'+reportId+'","date":"'+reportDate+'"}'), 
            "intCatDeskId": catDeskId
        }

        if($rootScope.isService === true){
            $rootScope.showLoading();
            $scope.tradeDetailsSuccess = function(response) {
                console.log("Manager Attestation - Trade Details End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.popupDetailsData = formatData.data[0];
                    var urlTemplates;
                    if(!ionic.Platform.isIPad()){
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
        
            var tradeDetails = datafactory.getTradeDetails(postParam);
            setTimeout(function(){ 
                console.log("Manager Attestation - Trade Details Start:"+ new Date());
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
            $scope.signaturepopup = $ionicPopup.show({
                        title: 'Add Signature',
                        templateUrl: 'signature-popover.html',
                        cssClass: 'custom-detail-popup signaturepopup',
                        scope: $scope
                    });
            setTimeout(function(){ 
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
            $rootScope.showLoading();
            $scope.mobileActionableUserListSuccess = function(response) {
                console.log("Pending Actionables - Notify User list End:"+ new Date());
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
        
            var mobileActionableUserList = datafactory.getMobileActionableUserList(postParam);
            setTimeout(function(){ 
                console.log("Pending Actionables - Notify User list Start:"+ new Date());
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
               userList.push($scope.actionableUserList.pendingActionableUserList[i].vcrEmailId);
            }
        }
        var postParam = {
            "DASH_REQ": escape('{"reportName":"'+$scope.currentReportName+'","subject":"Pending comments for red items","bodyContent":"'+$scope.notifymodal.escalationComment+'","emailFrom":"'+$rootScope.entitlementsData.userEmailId+'","emailTo":"'+userList.join(";")+'", "fullNameFrom":"'+$rootScope.entitlementsData.userFullName+'", "deskName":"'+$scope.currentDeskName+'"}')
        }

        $scope.sendNotificationEmailSuccess = function(response){
            console.log("Pending Actionables - Notify Send Notification End:"+ new Date());
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

        var sendNotificationEmail = datafactory.sendEmailNotificationMail(postParam);
        setTimeout(function(){ 
            console.log("Pending Actionables - Notify Send Notification Start:"+ new Date());
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
                console.log("Pending Actionables - Trade Details End:"+ new Date());
                try {
                    var responseObj = $window.plugins.GDHttpRequest.parseHttpResponse(response);
                    var formatData = JSON.parse(responseObj.responseText);
                    $scope.popupDetailsData = formatData.data[0];
                    var urlTemplates;
                    if(!ionic.Platform.isIPad()){
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
        
            var tradeDetails = datafactory.getTradeDetails(postParam);
            setTimeout(function(){ 
                console.log("Pending Actionables - Trade Details Start:"+ new Date());
                tradeDetails.send($scope.tradeDetailsSuccess,$scope.tradeDetailsFail);
            }, $rootScope.setTimeOutLoader);
        }
    };

    $scope.closeDetailsPopup = function(){
        $scope.myPopup.close();
    };

    $scope.setData = function(data){
        var formatData = data;
            console.log(formatData);
        $scope.loopRedItems = false;
        $scope.loopAwaitingReports = false;
        for(var i in formatData.pendingSignoff){
            for(var m in formatData.pendingSignoff[i].records){
                formatData.pendingSignoff[i].records[m].checkboxStatus = false;
                var flagCheckClass = "";
                var flagCheck = (formatData.pendingSignoff[i].records[m].pendingSignoff === "1")?false:true;

                if(formatData.pendingSignoff[i].records[m].EligibleUser != undefined && (formatData.pendingSignoff[i].records[m].EligibleUser === 0 || formatData.pendingSignoff[i].records[m].EligibleUser === "0")){
            console.log("logic chek pass");
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
                
                if(greenTotalVal.length > exceptionsWidth){ exceptionsWidth = greenTotalVal.length; }
                if(amberTotalVal.length > exceptionsWidth){ exceptionsWidth = amberTotalVal.length; }
                if(redTotalVal.length > exceptionsWidth){ exceptionsWidth = redTotalVal.length; }
                formatData.pendingSignoff[i].records[m].exceptionWidth = 30;
                formatData.pendingSignoff[i].records[m].totalWidth = 30;
                if(exceptionsWidth >= 4){ formatData.pendingSignoff[i].records[m].exceptionWidth += exceptionsWidth * 3; }
                if(totalVal.length >= 4){ formatData.pendingSignoff[i].records[m].totalWidth += totalVal.length * 3; }
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

        $scope.disableSignOff = false;
        $scope.showUncommentedRedItems = (formatData.uncommentedRedItems.length === 0 || $scope.loopRedItems === false)?true:false;
        $scope.showAwaitingReports = (formatData.awaitingReports.length === 0 || $scope.loopAwaitingReports === false)?true:false;
        $scope.summaryStatusData = formatData;
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
                    console.log("Pending Actionables - Sign off comments End:"+ new Date());
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
            
                var signOffComments = datafactory.signOffComments(creds);
                setTimeout(function(){ 
                    console.log("Pending Actionables - Sign off comments Start:"+ new Date());
                    signOffComments.send($scope.signOffSuccess,$scope.signOffFail);
                }, $rootScope.setTimeOutLoader);
                $scope.summarypopover.hide();
            } else{
                $scope.showFailPopUp("E133");
            }
        } else{
            $scope.summarypopover.hide();
        }
    };

    $scope.callLocalOrService = function(isService){
        if(isService){
            $rootScope.showLoading();
            var postParam = {
                "DASH_REQ" : escape('{"userId": "'+$rootScope.entitlementsData.userId+'","regionId":"'+$rootScope.regionSummaryfilters.selected+'","deskId": "'+$rootScope.defaultSelectedFilters.deskSummaryfilter+'","businessLine": "'+$rootScope.businessSummaryfilters.selected+'","date": "'+$rootScope.defaultSelectedFilters.dateSummaryfilter+'"}')
            };

            $scope.summaryStatusSuccess = function(response) {
                console.log("Pending Actionables - Main Call End:"+ new Date());
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
        
            var summaryStatus = datafactory.getSummaryStatus(postParam);
            setTimeout(function(){ 
                console.log("Pending Actionables - Main Call Start:"+ new Date());
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
    $scope.viewPDFDisable = false;
    $scope.showNotAvailable = false;
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

    $ionicPopover.fromTemplateUrl('pdfpopover.html', {
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
        /*attParams['regionId'] = "10";
        attParams['productId'] = "72";*/
        var params = {
            ATTESTATION_DASH_REQ: escape(JSON.stringify(attParams)),
            REQ_PARAM: escape(JSON.stringify($scope.reqparams))
        }

        var serviceData = datafactory.getSeniorAttesationCall(params);
        var successFun = function(responseObj) {
            //console.log(responseObj);
            console.log("SM Attestation End:"+ new Date());
            try{
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

                if($scope.pendingAttestationData.length == 0 && $scope.attestationData.length === 0){
                    $scope.attestDisable = true;
                    $scope.showNotAvailable = true;    
                    $scope.viewPDFDisable = true;
                }

                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            } catch(e){
                $scope.showFailPopUp("E122");
                $rootScope.hideLoading();
                $scope.$broadcast('scroll.refreshComplete');
            }
        }
        var errorFun = function(response) {
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
                console.log("SM Attestation Call End:"+ new Date());
                try{
                    var respObj = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
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
            }

            var sendGDURL = datafactory.getViewPDFCall(params);

            var HTTPObject = {
                params: params,
                url: sendGDURL,
                serviceData: sendGDURL,
                successFun: successFun,
                errorFun: errorFun
            };
            $scope.customGoodHTTP(HTTPObject);
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

        $scope.customGoodHTTP = function(HTTPObject) {
            setTimeout(function(){
                console.log("SM Attestation Call Start:"+ new Date());
                HTTPObject.serviceData.send(HTTPObject.successFun, HTTPObject.errorFun);
            }, $rootScope.setTimeOutLoader);
        };

        $scope.customPDFHTTP = function(HTTPObject){};
        $scope.customHTTP = function(HTTPObject){};

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
                console.log("SM Attestation End:"+ new Date());
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
                console.log("SM Attestation End:"+ new Date());
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

    $ionicPopover.fromTemplateUrl('managerpopover.html', {
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
            var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            var response = JSON.parse(responseObjData.responseText);
            //console.log(response);
            $scope.newManagerData = response.keyList;
            $scope.syncBothLists();
            $scope.$apply();
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

        if (valToSearch.length > 3){
            //$rootScope.showLoading();
            $scope.customGoodHTTP(HTTPObject);
        }
    };

    $scope.customGoodHTTP = function(HTTPObject) {
        setTimeout(function(){ 
            //console.log("Trigger SM Attestation");
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
            //console.log(response);
            $ionicPopup.alert({
                title: 'Alert',
                template: 'Email sent successfully.'
            });
            $state.go('app.smAttestation');
        }
        var errorFun = function(response) {
            //console.log('Mail failure');
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
})
//new Controlers for Alert starts here -->
       
.controller('Notifications', function($scope, $filter, $window, $ionicPopup, datafactory, $ionicPopup, $ionicPopover, $location, $state, $rootScope, $ionicModal, $ionicLoading) {
       
        $rootScope.settingsData = null;
        $scope.groupArray = [];

            
        $scope.alertSeen = "SEEN";
        $scope.alertActionTaken = "ACTION_TAKEN";



        $scope.AttCycInit           = "AttCycInit";
        $scope.AttCycPreDeadline    = "AttCycPreDeadline";
        $scope.AttCycPostDeadline   = "AttCycPostDeadline";
        $scope.RejAttestation       = "RejAttestation";
        $scope.SenMgrAttReady       = "SenMgrAttReady";
        $scope.DeskAddRem           = "DeskAddRem";
        $scope.DeskmapFeedBack      = "DeskmapFeedBack";
        $scope.RedItemPenSignOff    = "RedItemPenSignOff";
        $scope.SpikesRedItem        = "SpikesRedItem";
        $scope.NotifySpike          = "NotifySpike";
            
        $scope.setingsClick = function(evt) {
        $state.go('app.notifySettings', {});
        }
        
            
            var successFun = function(responseObj) {
            
            var indexedTeams = [];
            console.log("response obj for notifications");

            console.log(responseObj);
            
            var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            
            console.log(responseObjData);
            
            try{


            var response = JSON.parse(responseObjData.responseText);
            var recNotifArray = response.recNotifArray;
            var notSentCount = response.notSentCount;


            console.log(response);

            //  $scope.getGroups = function() {
            recNotifArray.forEach(function(item, idx) {
                             var dateFor = moment.utc(item.recievedDate + '-05:00').toDate();
                             var localDate = dateFor.toLocaleDateString();
                             var formatedDate = new Date(localDate);
                             $scope.groupArray.push({
                                    recievedDate: localDate,
                                    formatedDate: dateFor,
                                    text: item.alertMsg,
                                    recId: item.recId,
                                    alertStatus : item.alertStatus,
                                    eventCptn: item.eventCptn,
                                    metadata:item.metadata,
                                    eventId : item.eventId,
                                    legend: item.legend,
                                    jobId: item.jobId,
                                    highlightBG : item.alertStatus != $scope.alertActionTaken?'notificationBackgroundHighlight':''
                                                    });
                             });
            //  return $scope.groupArray;
            //  };
            
            $rootScope.hideLoading();

            
            }catch(e){
            $rootScope.hideLoading();
            $scope.showFailPopUp('E137');
            }
             $scope.$apply();
            }
            
            var errorFun = function(response) {
            $rootScope.hideLoading();
            console.log("error function");
            console.log(response);
            $scope.showFailPopUp('E137');
            
            }
            
            
            $scope.alertToFilter = function() {
            indexedTeams = [];
            return $scope.groupArray;
            }

            
           
            $scope.alertDate = function(player) {
            var teamIsNew = indexedTeams.indexOf(player.recievedDate) == -1;
            if (teamIsNew) {
            indexedTeams.push(player.recievedDate);
            }
            return teamIsNew;
            }
            
            
        $scope.alertScreen = function(){
        
        var params = {
            appId: 47,
            USER_SOEID: $rootScope.entitlementsData.soeId,
            destApp: 'APNS'
        }
            var sendURL = datafactory.getRecievedAlerts(params);
            $rootScope.showLoading();
            sendURL.send(successFun,errorFun);
            
        }
         
            $scope.alertScreen();
            
          // $scope.$broadcast('scroll.refreshComplete');
            
        $scope.goto = function(item) {
        var attr = item.target.attributes;
        var val = attr.getNamedItem('alertcptn').value;
        var status = attr.getNamedItem('status').value;
            
        if (val == 'AttCycInit') {
            if(status !='ACTION_TAKEN'){
            $state.go('app.smAttestation', {});
            }else{
            $scope.showFailPopUp("E136");
            }
        } else if (val == 'SpikesRedItem') {
            if(status !='ACTION_TAKEN'){
            $state.go('app.SpikeItems', {});
            }else{
            $scope.showFailPopUp("E136");
            }
        } else if (val == 'DeskAddRem') {
            if(status !='ACTION_TAKEN'){
            $state.go('app.deskMapping', {});
            }else{
            $scope.showFailPopUp("E136");
            }
        }else if (val == 'DeskmapFeedBack') {
            if(status !='ACTION_TAKEN'){
            $state.go('app.deskMapping', {});
            }else{
            $scope.showFailPopUp("E136");
            }
        }else if (val == 'RedItemPenSignOff'){
            if(status !='ACTION_TAKEN'){
                $state.go('app.summary',{});
            }else{
                $scope.showFailPopUp("E136");
            }
        }
        
        }
            
        })

.controller('deskMapping', function($scope,$window,$rootScope ,$ionicPopup, $state, $ionicHistory, datafactory, $ionicLoading) {
           
           
           var params = {
           USER_ID: $rootScope.entitlementsData.userId,
           PAGE_INDEX: '1',
           PAGE_SIZE: '10',
           }
           
            var sendURL = datafactory.getDeskMappingDetails(params);
           
            
            var successFun = function(responseObj) {
            $rootScope.hideLoading();

            var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            
            console.log("response object for desk mapping");
            console.log(responseObjData);
            var response = JSON.parse(responseObjData.responseText);

            $scope.deskMappingData = response.data;
            $scope.$apply();
           }
           
           var errorFun = function(response) {
            $rootScope.hideLoading();
            $scope.showFailPopUp('E137');
            }
           
            
            
 
          // $scope.deskMappingData();
            
            $rootScope.showLoading();
            sendURL.send(successFun,errorFun);

            $scope.refreshDeskMappingData = function(){

            $rootScope.showLoading();
            sendURL.send(successFun,errorFun);
            
            }
            
           $scope.reject = function(item, title) {
           $scope.data = {};
           var recToReject = item;
           var confirmPopup = $ionicPopup.show({
                                               title: 'Reject',
                                               subTitle: 'Reject Comment',
                                               template: '<textarea type="text"  cols="40" rows="5" ng-model="data.rejectComment"/>',
                                               scope: $scope,
                                               buttons: [{
                                                         text: 'Cancel'
                                                         }, {
                                                         text: '<b>Reject</b>',
                                                         type: 'button-positive',
                                                         onTap: function(e) {
                                                         $scope.rejectApproveDesk(recToReject, $scope.data.rejectComment, title);
                                                         }
                                                         }]
                                               });
           }
           
           $scope.approve = function(item, title) {
           $scope.data = {};
           var recToApprove = item;
           var confirmPopup = $ionicPopup.show({
                                               title: 'Approve',
                                               subTitle: 'Approve Comment',
                                               template: '<textarea type="text"  cols="40" rows="5" ng-model="data.approveComment"/>',
                                               scope: $scope,
                                               buttons: [{
                                                         text: 'Cancel'
                                                         }, {
                                                         text: '<b>Approve</b>',
                                                         type: 'button-positive',
                                                         onTap: function(e) {
                                                         $scope.rejectApproveDesk(recToApprove, $scope.data.approveComment, title);
                                                         }
                                                         }]
                                               });
           }
            
           $scope.rejectApproveDesk = function(record, rejectComment, title) {
           
           var rejectParams = {
           fixedIncomeLookupId: (record.intvLookupMasterId >= 0) ? record.intvLookupMasterId : '',
           equityLookupId: (record.intvLookupMasterId < 0) ? record.intvLookupMasterId : '',
           comments: rejectComment,
           userId: $rootScope.entitlementsData.userId,
           actionId: (title == "Approve") ? '1' : '2'
           }
           var params = {
           DESK_MAPPING_APPROVE_REJECT_REQ: rejectParams,
           }
            
           var submitURL = datafactory.getDeskSApproveReject(rejectParams);
            
           var submitSuccessFun = function(response) {
            $rootScope.hideLoading();
           console.log('refreshing');
            $scope.$apply();
            $scope.refreshDeskMappingData();
           }
           var submitErrorFun = function(response) {
            $scope.showFailPopUp('E137');
            $rootScope.hideLoading();
           //Handle error
           }
           
            $rootScope.showLoading();
            submitURL.send(submitSuccessFun,submitErrorFun);
           //$scope.customHTTPApproveReject(HTTPObject);
           }
           
           })


.controller('notificationSetting', function($scope, $window, $ionicPopup, $state, $ionicHistory, datafactory, $http, $ionicPopup, $ionicPopover, $location, $state, $rootScope, $ionicModal, $ionicLoading) {
           
           
           var params = {
           appId: 47,
           USER_SOEID: $rootScope.entitlementsData.soeId,
           destApp: 'APNS'
           }
            
           var sendURL = datafactory.getSubscribedAlerts(params);
            
           var successFun = function(responseObj) {
            $rootScope.hideLoading();
            var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            console.log(responseObjData);
            var response = JSON.parse(responseObjData.responseText);
            
            
           $rootScope.alertList = response;
           $rootScope.settingsData = true;
            $scope.$apply();
           }
           var errorFun = function(response) {
           $rootScope.hideLoading();
           }
           
            $rootScope.showLoading();
            sendURL.send(successFun,errorFun);
           
            
            var saveSuccessFun = function(responseObj) {
            var responseObjData = $window.plugins.GDHttpRequest.parseHttpResponse(responseObj);
            console.log(responseObjData);

            $rootScope.hideLoading();
            $ionicPopup.alert({
                              title: 'Alert Subscriptions',
                              template: 'Your alert subscriptions have been successfully saved.'
                              });
            }
            
            var saveErrorFun = function(response) {
            $rootScope.hideLoading();
            $ionicPopup.alert({
                              title: 'Alert Subscriptions',
                              template: 'Error while saving alert subscriptions.'
                              });
            }
 
            
           
           
           $scope.onSave = function(itemList) {
           
           var flagList = [];
           var alertTypeIdList = [];
           itemList.forEach(function(item) {
                            var flag = (item.subscribeFlag == undefined) ? false : item.subscribeFlag;
                            flagList.push(flag);
                            alertTypeIdList.push(item.alertTypeId);
                            });
           
           var param = {
           appId: 47,
           alertId: '',
           subscribeFlagList: flagList,
           destApp: 'APNS',
           alertTypeId: alertTypeIdList,
           USER_SOEID: $rootScope.entitlementsData.soeId
           }
           
            console.log(JSON.stringify(flagList));
            console.log(JSON.stringify(alertTypeIdList));
            
            
            var sendURL = datafactory.getSubscribeUnSubscribe(param);
            $rootScope.showLoading();
            sendURL.send(saveSuccessFun,saveErrorFun);
            }


 })

.controller('SpikeItems', function($scope, $ionicPopup, $state, $ionicHistory) {
           
           /*$scope.spikeItemsData =[
            { accountName: "NAM Rates Trading Deriv", value: "TECTE1" , comments :"To be mapped"},
            { accountName: "EMEA rates", value: "TECTE1" , comments :"To be mapped"},
            ]*/
           
            });
            

