//
//  GameOpModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/17.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class GameOpModelResult,GameOp;

@interface GameOpModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) GameOpModelResult *result;

@end

@interface GameOpModelResult : NSObject

@property (nonatomic, strong) GameOp *op;

@property (nonatomic, copy) NSString *turns;

@property (nonatomic, assign) NSInteger is_end;

@end

@interface GameOp : NSObject

@property (nonatomic, copy) NSString *nickname;

@property (nonatomic, assign) NSInteger x;

@property (nonatomic, assign) NSInteger y;

@property (nonatomic, assign) NSInteger bingo;

@end
