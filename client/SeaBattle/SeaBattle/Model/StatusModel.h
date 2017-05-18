//
//  StatusModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/17.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class StatusModelResult;

@interface StatusModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) StatusModelResult *result;

@end

@interface StatusModelResult : NSObject

@property (nonatomic, assign) NSInteger status;

@end
