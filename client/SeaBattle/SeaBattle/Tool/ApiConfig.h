//
//  ApiConfig.h
//  SeaBattle
//
//  Created by begoss on 2017/5/13.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ApiConfig : NSObject

+ (NSString *)API_CREATE_NEW_GAME;
+ (NSString *)API_JOIN_GAME;
+ (NSString *)API_SET_MAP;
+ (NSString *)API_CURR_OP_CNT;
+ (NSString *)API_SET_OP;
+ (NSString *)API_GET_OP;
+ (NSString *)API_GET_STATUS;
+ (NSString *)API_GET_PLAYERS;
+ (NSString *)API_GET_TIPS;

@end
