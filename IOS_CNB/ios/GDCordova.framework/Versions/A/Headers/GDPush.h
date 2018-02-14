/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import <GD/GDPushiOS.h>
#import "GDCBasePlugin.h"

@interface GDCPushPlugin : GDCBasePlugin <GDPushConnectionDelegate>

-(void)connect:(CDVInvokedUrlCommand *)command;
-(void)disconnect:(CDVInvokedUrlCommand *)command;
-(void)open:(CDVInvokedUrlCommand *)command;
-(void)close:(CDVInvokedUrlCommand *)command;
-(void)isConnected:(CDVInvokedUrlCommand *)command;

-(NSMutableDictionary*)createResponseObjectForID:(NSString*)channelID withType:(NSString*)responseType withData:(NSString*)responseData;
-(void)removeChannelForID:(NSString*)channelID;

@end
