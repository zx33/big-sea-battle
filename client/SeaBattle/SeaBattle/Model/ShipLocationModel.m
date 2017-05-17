//
//  ShipLocationModel.m
//  HaiZhan
//
//  Created by dotamax on 17/3/3.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "ShipLocationModel.h"

@implementation ShipLocationModel

- (void)initWithIndexPath:(NSIndexPath *)indexPath Length:(NSInteger)length orientation:(NSInteger)orientation {
    NSMutableArray *array = [NSMutableArray new];
    if (orientation == 0) {
        for (int i=0; i<length; i++) {
            LocationNode *node = [LocationNode new];
            node.x = indexPath.section+i;
            node.y = indexPath.row;
            [array addObject:node];
        }
    }else {
        for (int i=0; i<length; i++) {
            LocationNode *node = [LocationNode new];
            node.x = indexPath.section;
            node.y = indexPath.row+i;
            [array addObject:node];
        }
    }
    if (!self.location) {
        self.location = [NSArray arrayWithArray:array];
    }
}

@end

@implementation LocationNode

@end
