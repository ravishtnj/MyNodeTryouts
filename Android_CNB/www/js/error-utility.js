var errorCodeUtility = errorCodeUtility || {};
errorCodeUtility = {
   errorCodes: {
       /* Entitlement */
       "E101": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E102": "User profile is not configured, please contact support",
       "E103": "Invalid user profile, please  contact support",
       /* Filter */
       "E104": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E105": "Invalid Filter Configuration, Please contact support",
       /* MIS Dashboard */
       "E106": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E107": "Invalid data, please contact support",
       "E108": "Invalid trend data, please contact support",
       /* Dashboard Summary */
       "E109": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E110": "Invalid data, please contact support",
       /* Dashboard Summary - Pending Signoff */
       "E111": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E112": "Invalid data, please contact support",
       "E113": "Invalid details, please contact support",
       "E114": "Signoff Failed, please try again later",
       /* Manager Attesation */
       "E115": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E116": "Invalid Filter Data, please contact support",
       "E117": "Invalid Desk Data, please contact support",
       "E118": "Invalid Control questions, please contact support",
       "E119": "Attestation failed, please try again later",
       /* Senior Manager Attestation */
       "E120": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E121": "Invalid Filter Data, please contact support",
       "E122": "Invalid Desk Data, please contact support",
       "E123": "PDFnot available, please contact support",
       "E124": "User List not available, please contact support",
       "E125": "Escalation failed, please try again later",
       "E126": "Rejection failed, please try again later",
       "E127": "Attestation failed, please try again later",
       /* Pending Actionables */
       "E128": "This service is not available, please check your network and try again later. Please contact support if problem persists.",
       "E129": "Invalid Data, please contact support",
       "E130": "User list not available, please try again later",
       "E131": "Email not send, please try again later",
       "E132": "Signoff failed, please try again later",
       /* Pending Sign off */
       "E133": "Please select atleast one record to sign off!",
       /* Manager Attestation - Trade details */
       "E134": "Invalid details, please contact support",
       /* Pending Actionables */
       "E135": "Invalid details, please contact support",
       "E136": "",
       "E137": "",
       "E138": "",
       "E139": "",
       "E140": ""
   },
   getErrorCode: function(ecode) {
     return this.errorCodes[ecode];
   }
};
