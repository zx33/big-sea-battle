//
//  GuessModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/30.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class GuessModelResult;

@interface GuessModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) GuessModelResult *result;

@end

@interface GuessModelResult : NSObject

@property (nonatomic, strong) NSArray <NSNumber *> *rival_map;

@property (nonatomic, assign) NSInteger bingo_cnt;

@end
