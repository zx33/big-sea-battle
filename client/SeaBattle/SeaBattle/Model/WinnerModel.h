//
//  WinnerModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/30.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class WinnerModelResult;

@interface WinnerModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) WinnerModelResult *result;

@end

@interface WinnerModelResult : NSObject

@property (nonatomic, assign) NSInteger has_winner;

@property (nonatomic, copy) NSString *winner;

@property (nonatomic, strong) NSArray <NSNumber *> *map_info;

@end
