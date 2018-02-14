angular.module('factory',[])
.factory('datafactory',['$http','$window',function ($http, $window) {
    var timeOut = 150;
    var isAsync = true;
    var getMethod = 'GET';
    var postMethod = 'POST';
                        
     //var baseURL = 'https://mwmapwlprd07.nam.nsroot.net:10245/iris_moc_app/'; //prod cpmodsqpr01
    // var baseURL = 'https://swmapwldev01.nam.nsroot.net:30445/iris_moc_app/'; //qat
                        
     var notifyBaseUrl = 'http://swmapwldev05.nam.nsroot.net:30744/alertSystem/';
 //  var notifyBaseUrl = 'http://GCOTDVMSW723231.nam.nsroot.net:7001/alertSystem/';
                        
   // var baseURL = 'http://GCOTDVMSW786410.nam.nsroot.net:7001/iris_moc_app/';
    var baseURL = 'http://GCOTDVMMW796154.nam.nsroot.net:7001/iris_moc_app/';
     var serviceURLs  = {
        mobileLogin : 'cnbMobilelogin.mocapp',
        mobileEntitlements: 'cnbEntitlements.mocapp',
        mobileBusinessFilter: 'loadMobileCnbComponentData.mocapp',
        mobileDeskFilter:'loadMobileTreeComponentData.mocapp',
        mobileRegionFilter:'loadMobileCnbComponentData.mocapp',
        mobileBulkSignOff:'getMobileBulkSignoff.mocapp',
        mobileBulkSignOffList:'getMobileBulkSignoffList.mocapp',
        mobileSignOffComments:'addMobileSignoffSummaryComments.mocapp',
        mobileTradeDetails: 'getMobileTradeDetails.mocapp',
        mobileAttestationDetails: 'fetchMobileAttestationDashboardData.mocapp',
        mobileAttestationData: 'fetchMobileAttestationDashboardDataForCatId.mocapp',
        mobileBindCtrlQuestions: 'mobilebindCtrlQstns.mocapp',
        mobileSubmitAttestationQuestions: 'insertMobileControlQstns.mocapp',
        mobileAttesationDeskFilter: 'loadMobileCnbComponentData.mocapp',
        mobileIrisAnalyticsCall: 'cnbmobileAudit.mocapp',
        mobileDashBoardCall:'fetchMobileDashBoardExce.mocapp',
        mobileSummaryStatus:'getMobileStatusSummary.mocapp',
        mobileSMAttestation : 'getMobileSrMgrAttestationDashboardData.mocapp',
        mobileSMRejectAttestation : 'rejectAttestationSmMobile.mocapp',
        mobileSMCombinedAttestation : 'saveSMAttestationDocMobile.mocapp',
        mobileSMManagerLookup : 'mobileLookupUsers.mocapp',
        mobileSMSendEscalation : 'sendEscalationEmail.mocapp',
        mobileSMViewPDF:'mobileViewPdf.mocapp',
        mobileActionableUserList:'getPendingActionableUserList.mocapp',
        mobilePendingActionNotify: 'pendingCommentsEmailNotification.mocapp',
        mobileExceptionByWeeks: 'fetchMobileExceptionsOver6Weeks.mocapp',
        subscribedAlerts : 'getUserSubscribedAlerts.ams',
        recievedAlerts :'getUserRecievedAlertsList.ams',
        updateAlert :'updateAlertResponseBack.ams',
        subscribeUnSubscribe :'subscribeUnSubscribeUser.ams',
        registerUserDetails : 'registerUserDeviceDetails.ams',
        deskMapingDetails : 'cnbMobileDeskMappingPendingApproval.mocapp',
        deskApproveReject : 'cnbMobileDeskMappingApproveReject.mocapp',
        alertsCount:'getUnseenNotificationCount.ams'
                        
    }                   
    var dataFactory = {};
                        
    dataFactory.getAuthentication = function (creds) {      
        //console.log("Called for Authentication");
        var sendUrl = baseURL+serviceURLs.mobileLogin+"?uid="+creds.uid+"&pwd="+creds.pwd;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(getMethod, sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    /* Filters */
    dataFactory.getBusinessFilter = function(creds)
    {
        //console.log("Get Business filter");
        var sendUrl = baseURL+serviceURLs.mobileBusinessFilter+"?uid="+creds.uid+"&cType="+creds.cType+"&cName="+creds.cName+"&REQ_PARAM="+creds.REQ_PARAM;
        //console.log(baseURL+serviceURLs.mobileBusinessFilter);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };
                        
    dataFactory.getRegionFilter = function(creds)
    {
        //console.log("Get Region filter");
        var credUid = ""
        if(creds.uid != undefined){
            credUid = "&uid="+creds.uid;
        }
        var sendUrl = baseURL+serviceURLs.mobileRegionFilter+"?cType="+creds.cType+"&cName="+creds.cName+"&BUSINESS_LINE="+creds.BUSINESS_LINE+"&REQ_PARAM="+creds.REQ_PARAM+credUid;
        //console.log(baseURL+serviceURLs.mobileRegionFilter);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };
                        
    dataFactory.getDeskFilter = function(creds)
    {
        //console.log("Get Desk filter");
        var sendUrl = baseURL+serviceURLs.mobileDeskFilter+"?cType="+creds.cType+"&cName="+creds.cName+"&REGION_ID="+creds.REGION_ID+"&DESK_ID="+creds.DESK_ID+"&USER_ID="+creds.uid;
        //console.log(baseURL+serviceURLs.mobileDeskFilter);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };


    dataFactory.getSignoffList = function(creds)
    {
        //console.log("Get Signoff List");
        var sendUrl = baseURL+serviceURLs.mobileBulkSignOffList+"?DASH_REQ="+creds.DASH_REQ;
        //console.log(baseURL+serviceURLs.mobileBulkSignOffList);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        console.log (aRequest);
        return aRequest;
    }; 


    dataFactory.getBulkSignoff = function(creds)
    {
        console.log("Get Bulk Signoff");
        var jsonInputParam = escape(creds.DASH_REQ);
        var sendUrl = baseURL+serviceURLs.mobileBulkSignOff+"?DASH_REQ="+creds.DASH_REQ;
        //console.log(baseURL+serviceURLs.mobileBulkSignOff);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    }; 

    dataFactory.signOffComments = function(creds)
    {
        //console.log("Sign off the comments");
        var jsonInputParam = escape('{"intCatDeskId":"'+creds.intCatDeskId+'","signoffComments":"'+creds.signoffComments+'","isAdmin":"'+creds.isAdmin+'","userId":"'+creds.uid+'","regionId":"'+creds.regionId+'"}');
        //console.log(unescape(jsonInputParam));
        var sendUrl = baseURL+serviceURLs.mobileSignOffComments+"?SAVE_SIGNOFF_SUMMARY_COMMENTS_REQ="+jsonInputParam;
        //console.log(baseURL+serviceURLs.mobileSignOffComments);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    }; 

    dataFactory.getTradeDetails = function(creds)
    {
        //console.log("Get Trade Details");
        var sendUrl = baseURL+serviceURLs.mobileTradeDetails+"?TRADE_DETAILS_REQ="+creds.TRADE_DETAILS_REQ;
        //console.log(baseURL+serviceURLs.mobileTradeDetails);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };


    dataFactory.getSummaryStatus = function(creds)
    {
        //console.log("Get Summary Status");
        var sendUrl = baseURL+serviceURLs.mobileSummaryStatus+"?DASH_REQ="+creds.DASH_REQ;
        //console.log(baseURL+serviceURLs.mobileTradeDetails);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getManagerAttestationData = function(creds)
    {
        //console.log("Get Attestation Details");
        var appendURL = "";
        if(creds.DESK != ""){
            appendURL += "&DESK="+creds.DESK;
            //console.log(appendURL);
        }

        if(creds.REGION_ID != ""){
            appendURL += "&REGION_ID="+creds.REGION_ID;
            //console.log(appendURL);
        }

        if(creds.PRODUCT != ""){
            appendURL += "&PRODUCT="+creds.PRODUCT;
            //console.log(appendURL);   
        }
        var sendUrl = baseURL+serviceURLs.mobileAttestationDetails+"?uid="+creds.uid+"&intAttestation="+creds.intAttestation+appendURL+"&REQ_PARAM="+creds.REQ_PARAM;
        //console.log(baseURL+serviceURLs.mobileAttestationDetails);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getManagerAttestationCategoryData = function(creds)
    {
        //console.log("Get Attestation Data");
        var sendUrl = baseURL+serviceURLs.mobileAttestationData+"?categoryId="+creds.categoryId;
        //console.log(sendUrl);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    
    dataFactory.getAttestationQuestionStatus = function(creds)
    {
        //console.log("Get Bind Control Questions Data");
        var sendUrl = baseURL+serviceURLs.mobileBindCtrlQuestions+"?BIND_CTRL_QSTNS_REQ="+creds.BIND_CTRL_QSTNS_REQ;
        //console.log(baseURL+serviceURLs.mobileBindCtrlQuestions);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.submitAttestationQuestions = function(creds)
    {
        //console.log("Get Bind Control Questions Data");
        var sendUrl = baseURL+serviceURLs.mobileSubmitAttestationQuestions+"?INSERT_CTRL_QSTNS_REQ="+creds.INSERT_CTRL_QSTNS_REQ;
        //console.log(baseURL+serviceURLs.mobileSubmitAttestationQuestions);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    
    dataFactory.getAttesationDeskFilter = function(creds)
    {
        //console.log("Get Attesation Desk Filter Data");
        var sendUrl = baseURL+serviceURLs.mobileAttesationDeskFilter+"?uid="+creds.uid+"&REQ_PARAM="+creds.REQ_PARAM+"&cType=COMBO&cName=DESK&PRODUCT="+creds.PRODUCT+"&REGION_ID="+creds.REGION_ID;
        //console.log(baseURL+serviceURLs.mobileAttesationDeskFilter);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.irisAnalytics = function(creds){
        //console.log("Analytics Call");

        var sendUrl = baseURL+serviceURLs.mobileIrisAnalyticsCall+"?SOEID="+creds.uid+"&DETAILS="+escape(creds.DETAILS)+"&DESCRIPTION="+escape(creds.PAGE_NAME);
        //console.log(sendUrl);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);

        function analyticsCallSuccess(response){
            //console.log("Analytics Success");
        }

        function analyticsCallFail(response){
            //console.log(response);
            //console.log("Analytics Error");
        }

        aRequest.send(analyticsCallSuccess,analyticsCallFail);
    }

    dataFactory.getSeniorAttesationCall= function (creds) {      
        //console.log("Get Attesation Data");
        var sendUrl = baseURL+serviceURLs.mobileSMAttestation+"?ATTESTATION_DASH_REQ="+creds.ATTESTATION_DASH_REQ+"&REQ_PARAM="+creds.REQ_PARAM;
        //console.log(sendUrl);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getRejectAttesationCall = function (creds) {  
        var sendUrl = baseURL+serviceURLs.mobileSMRejectAttestation+"?ATTESTATION_DASH_REQ="+creds.ATTESTATION_DASH_REQ+"&REQ_PARAM="+creds.REQ_PARAM;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getManagerLookupCall = function (creds) {      
        //console.log("Called for Manager Lookup");
        var sendUrl = baseURL+serviceURLs.mobileSMManagerLookup+"?USER_ID="+creds.USER_ID;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, true);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getMobileActionableUserList = function (creds) {      
        //console.log("Called for Manager Lookup");
        var sendUrl = baseURL+serviceURLs.mobileActionableUserList+"?DASH_REQ="+creds.DASH_REQ;
        //console.log(sendUrl);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, true);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.sendEmailNotificationMail = function (creds) {      
        //console.log("Called for Manager Lookup");
        var sendUrl = baseURL+serviceURLs.mobilePendingActionNotify+"?DASH_REQ="+creds.DASH_REQ;
        //console.log(sendUrl);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, true);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getSendEscalationCall = function (creds) {      
        //console.log("Called for Send Escalation");
        var sendUrl = baseURL+serviceURLs.mobileSMSendEscalation+"?email_to="+creds.email_to+"&email_from="+creds.email_from+"&DESK="+creds.DESK+"&COMMENTS="+creds.COMMENTS+"&pdfFileName="+creds.pdfFileName;
        
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, true);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getCombinedAttesationCall = function (creds) {      
        //console.log("Called for Combined Attestation");
        var sendUrl = baseURL+serviceURLs.mobileSMCombinedAttestation+"?ATTESTATION_DASH_REQ="+creds.ATTESTATION_DASH_REQ;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, true);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getViewPDFCall = function (creds) {      
        //console.log("Called for View PDF");
        var sendUrl = baseURL+serviceURLs.mobileSMViewPDF+"?ATTESTATION_DASH_REQ="+creds.ATTESTATION_DASH_REQ;
        //var sendUrl = 'http://localhost:8888/cnb/index.php';
        //console.log(sendUrl);
        /*var aRequest = $window.plugins.GDXMLHttpRequest.open(postMethod ,sendUrl, true);
        aRequest.responseType = "string";
        aRequest.setRequestHeader("Accept","application/pdf");
        aRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");*/

        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, true);
        //aRequest.addRequestHeader("Accept","application/pdf");
        aRequest.addRequestHeader("Content-Type","text/plain; charset=x-user-defined");
        //aRequest.addRequestHeader("Content-Type","text/plain; charset=x-user-defined");
        //console.log (aRequest);
        return aRequest;
    };

    dataFactory.getSeniorAttesation = function (creds) {      
        //console.log("Called for Get Senior Attestation");
        var sendUrl = baseURL+serviceURLs.mobileSMAttestation;
        return sendUrl;
    };
    dataFactory.getRejectAttesation = function (creds) {      
        //console.log("Called for Reject Attestation");
        var sendUrl = baseURL+serviceURLs.mobileSMRejectAttestation;
        return sendUrl;
    };
    dataFactory.getCombinedAttesation = function (creds) {      
        //console.log("Called for Combined Attestation");
        var sendUrl = baseURL+serviceURLs.mobileSMCombinedAttestation;
        return sendUrl;
    };
    dataFactory.getManagerLookup = function (creds) {      
        //console.log("Called for Manager Lookup");
        var sendUrl = baseURL+serviceURLs.mobileSMManagerLookup;
        return sendUrl;
    };
    dataFactory.getSendEscalation = function (creds) {      
        //console.log("Called for Send Escalation");
        var sendUrl = baseURL+serviceURLs.mobileSMSendEscalation;
        return sendUrl;
    };
    dataFactory.getViewPDF = function (creds) {      
        //console.log("Called for View PDF");
        var sendUrl = baseURL+serviceURLs.mobileSMViewPDF;
        return sendUrl;
    };
                        
    /* Get Dashboard */
                        
    dataFactory.getDashboard = function(creds)
    { 
        console.log("Dashboard Call");
        var sendUrl = baseURL+serviceURLs.mobileDashBoardCall+"?DASH_REQ="+creds.DASH_REQ;
        console.log(baseURL+serviceURLs.mobileDashBoardCall);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    }

    dataFactory.getExceptionByWeekDashboard = function(creds)
    { 
        //console.log("Dashboard Call");
        var sendUrl = baseURL+serviceURLs.mobileExceptionByWeeks+"?DASH_REQ="+creds.DASH_REQ;
        //console.log(baseURL+serviceURLs.mobileExceptionByWeeks);
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        //console.log (aRequest);
        return aRequest;
    }

    dataFactory.getSubscribedAlerts= function (creds) {
         var sendUrl = notifyBaseUrl+serviceURLs.subscribedAlerts+"?appId="+creds.appId+"&USER_SOEID="+creds.USER_SOEID+"&destApp="+creds.destApp;
         var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
         aRequest.addRequestHeader("Content-Type","text/json");
        return aRequest;
    };
    
    dataFactory.getRecievedAlerts= function (creds) {
        console.log("Called for Notification Alert");
        var sendUrl = notifyBaseUrl+serviceURLs.recievedAlerts+"?appId="+creds.appId+"&USER_SOEID="+creds.USER_SOEID+"&destApp="+creds.destApp;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
                        console.log("receive alerts request");
                        console.log(aRequest);
                        
        return aRequest;
    };
                        
    
    dataFactory.getUpdateAlerts= function (creds) {
        console.log("Called for Notification Alert");
        var sendUrl = notifyBaseUrl+serviceURLs.updateAlert;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        return aRequest;
    };
    
    dataFactory.getSubscribeUnSubscribe= function (creds) {
        console.log("Called for Notification Alert");

         var flagList = "";
         var alertList ="";
                        
        creds.subscribeFlagList.forEach(function(obj,index){
                                        if(index == 0){
                                        flagList += obj;
                                        }else{
                                        flagList += ","+obj;
                                        }
                                        });
        creds.alertTypeId.forEach(function(obj,index){
                                  if(index == 0){
                                  alertList += obj;
                                  }else{
                                  alertList += ","+obj;
                                  }
                                  
                                  });
        
        var reqString = "?appId="+creds.appId+"&alertId="+creds.alertId+"&subscribeFlagList="+flagList+"&destApp="+creds.destApp+"&alertTypeId="+alertList+"&USER_SOEID="+creds.USER_SOEID;
                        
        var sendUrl = notifyBaseUrl+serviceURLs.subscribeUnSubscribe+reqString;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
                        
        console.log(aRequest);
        return aRequest;
    };
    
    dataFactory.getRegisterUserDetails= function (creds) {
        console.log("Called for Register User Device Details");
        var sendUrl = notifyBaseUrl+serviceURLs.registerUserDetails;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        return aRequest;
    };
    
    dataFactory.getDeskMappingDetails= function (creds) {      
         
        var reqString = "?USER_ID="+creds.USER_ID+"&PAGE_INDEX="+creds.PAGE_INDEX+"&PAGE_SIZE="+creds.PAGE_SIZE;
                        
        var sendUrl = baseURL+serviceURLs.deskMapingDetails+reqString;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
                        
                        console.log("desk maping request");
                        console.log(aRequest);
        return aRequest;
    };
    
    dataFactory.getDeskSApproveReject= function (creds) {      
        console.log("Called for Approve & Reject");
        var reqString = "?DESK_MAPPING_APPROVE_REJECT_REQ=";
        var jsonInputParam = reqString+escape('{"fixedIncomeLookupId":"'+creds.fixedIncomeLookupId+'","equityLookupId":"'+creds.equityLookupId+'","comments":"'+creds.comments+'","userId":"'+creds.userId+'","actionId":"'+creds.actionId+'"}');
                        
        var sendUrl = baseURL+serviceURLs.deskApproveReject+jsonInputParam;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        return aRequest;
    };
                        
    dataFactory.getAlertsCount = function(creds){
    
        var sendUrl = notifyBaseUrl+serviceURLs.alertsCount+"?appId="+creds.appId+"&USER_SOEID="+creds.USER_SOEID+"&destApp="+creds.destApp;
        var aRequest = $window.plugins.GDHttpRequest.createRequest(postMethod ,sendUrl, timeOut, isAsync);
        aRequest.addRequestHeader("Content-Type","text/json");
        console.log("receive alerts request");
        console.log(aRequest);
        return aRequest;
                        
     };
                        
                        
                        
    return dataFactory;
                        
}]);
