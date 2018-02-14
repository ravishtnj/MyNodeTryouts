//
//  GDAppDelegate.m
//  GDCordova
//
//  Created by Good Technology on 6/11/12.
//  Copyright (c) 2013 Good Technology. All rights reserved.
//

#import "GDAppDelegate.h"
#import "AppDelegate.h"
#import "WebView+Debug.h"
#import <sqlite3.h>

// BEGIN: Private interface

@interface GDAppDelegate () {
    UIApplication* __weak savedApplication;
    NSDictionary* savedLaunchOptions;
}

@property (nonatomic, weak) UIApplication* savedApplication;
@property (nonatomic, strong) NSDictionary* savedLaunchOptions;

@end
// ---------------------------



@implementation GDAppDelegate

@synthesize gdLibrary;
@synthesize savedApplication;
@synthesize savedLaunchOptions;

- (BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    
    UIUserNotificationType userNotificationTypes = (UIUserNotificationTypeAlert |
                                                    UIUserNotificationTypeBadge |
                                                    UIUserNotificationTypeSound);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:userNotificationTypes
                                                                             categories:nil];
    [application registerUserNotificationSettings:settings];
    [application registerForRemoteNotifications];
    
    self.gdLibrary = [GDiOS sharedInstance];
    self.gdLibrary.delegate = self;
    
    //Set a flag so that view controllers can check the status
    started = NO;
    
    // Start up the Good Library.
    [self.gdLibrary authorize];
    [self.window makeKeyAndVisible];
    
#ifdef DEBUG
    enableRemoteWebInspector();
#endif
    
    return YES;
}


-(void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    // Store the deviceToken in the current installation and save it to Parse.
    
    NSString *token = [[deviceToken description] stringByTrimmingCharactersInSet: [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
    token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];

    
     //    NSString *dToken = [[NSString alloc] initWithData:deviceToken encoding:NSUTF8StringEncoding];
    
  //  NSLog(@"%@ Token ",dToken);
    
    
   // UIAlertView  *alert = [[UIAlertView alloc]initWithTitle:@"Device token" message:token delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
    // [alert show];
    
}


-(void)handleEvent:(GDAppEvent*)anEvent
{
    // Called from gdLibrary when events occur, such as system startup.
    
    switch (anEvent.type)
    {
        case GDAppEventAuthorized:
        {
            [self onAuthorised:anEvent];
            break;
        }
        case GDAppEventNotAuthorized:
        {
            [self onNotAuthorised:anEvent];
            break;
        }
        case GDAppEventRemoteSettingsUpdate:
        {
            // handle app config changes
            break;
        }
        case GDAppEventServicesUpdate:
        {
            break;
        }
        case GDAppEventPolicyUpdate:
        {
            break;
        }
    }
}

-(void) onAuthorised:(GDAppEvent*)anEvent
{
    // Handle the Good Libraries authorized event.
    
    switch (anEvent.code) {
        case GDErrorNone: {
            if (!started) {
                NSDictionary *configDict = [self.gdLibrary getApplicationConfig];
                NSString *configId = [configDict valueForKey:@"userId"];
                NSString *SOE_ID = [[configId componentsSeparatedByString:@"@"]objectAtIndex:0];
                
                NSLog(@"SOE ID : %@",SOE_ID);
                // launch application UI here
                started = YES;
                // *** Now perform your application's primary initialization and show your UI. ***
                [super appStart:savedApplication withOptions:savedLaunchOptions];
            }
            break;
        }
        default:
        NSAssert(false, @"Authorised startup with an error");
        break;
    }
}

-(void) onNotAuthorised:(GDAppEvent*)anEvent
{
    // Handle the Good Libraries not authorised event.
    
    switch (anEvent.code) {
        case GDErrorActivationFailed:
        case GDErrorPushConnectionTimeout: {
            // application can either handle this and show it's own UI or just call back into
            // the GD library and the welcome screen will be shown
            [self.gdLibrary authorize];
            break;
        }
        case GDErrorSecurityError:
        case GDErrorAppDenied:
        case GDErrorBlocked:
        case GDErrorWiped:
        case GDErrorRemoteLockout:
        case GDErrorPasswordChangeRequired: {
            // a condition has occured denying authorisation, an application may wish to log these events
            NSLog(@"onNotAuthorised %@", anEvent.message);
            break;
        }
        case GDErrorIdleLockout: {
            // idle lockout is benign & informational
            break;
        }
        default:
        NSAssert(false, @"Unhandled not authorised event");
        break;
    }
}

@end
