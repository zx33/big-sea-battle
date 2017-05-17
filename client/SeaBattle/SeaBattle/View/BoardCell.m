//
//  BoardCell.m
//  HaiZhan
//
//  Created by dotamax on 17/3/1.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "BoardCell.h"

@implementation BoardCell

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.backgroundColor = [UIColor emptyCellColor];
    }
    return self;
}

- (void)setColor:(NSInteger)state {
    if (state == STATE_EMPTY) {
        self.backgroundColor = [UIColor emptyCellColor];
    }else if (state == STATE_DEPLOYING) {
        self.backgroundColor = [UIColor deployingShipCellColor];
    }else if (state == STATE_DEPLOYED) {
        self.backgroundColor = [UIColor deployedShipCellColor];
    }else if (state == STATE_DESTROYED) {
        self.backgroundColor = [UIColor destroyShipCellColor];
    }else if (state == STATE_NO_SHIP) {
        self.backgroundColor = [UIColor noShipCellColor];
    }else if (state == STATE_HAS_ENEMYSHIP) {
        self.backgroundColor = [UIColor emptyCellColor];
    }
}

@end
