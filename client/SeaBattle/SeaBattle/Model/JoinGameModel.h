//
//  JoinGameModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/30.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class JoinGameModelResult;

@interface JoinGameModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) JoinGameModelResult *result;

@end

@interface JoinGameModelResult : NSObject

@property (nonatomic, copy) NSString *password;

@property (nonatomic, copy) NSString *game_type;

@property (nonatomic, assign) NSInteger sea_range;

@end


