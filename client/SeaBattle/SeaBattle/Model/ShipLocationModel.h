//
//  ShipLocationModel.h
//  HaiZhan
//
//  Created by dotamax on 17/3/3.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import <Foundation/Foundation.h>

@class LocationNode;

@interface ShipLocationModel : NSObject

@property (nonatomic, strong) NSArray <LocationNode *> *location;

- (void)initWithIndexPath:(NSIndexPath *)indexPath Length:(NSInteger)length orientation:(NSInteger)orientation;

@end

@interface LocationNode : NSObject

@property (nonatomic, assign) NSInteger x;

@property (nonatomic, assign) NSInteger y;

@end
