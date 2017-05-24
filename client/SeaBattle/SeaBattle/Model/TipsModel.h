//
//  TipsModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/24.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class TipsModelResult;

@interface TipsModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) TipsModelResult *result;

@end

@interface TipsModelResult : NSObject

@property (nonatomic, strong) NSArray <NSArray *> *tips;

@end
