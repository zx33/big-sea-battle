//
//  FilterPickerView.h
//  SeaBattle
//
//  Created by begoss on 2017/5/30.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol FilterPickerViewDelegate <NSObject>

- (NSInteger)filterPickerNumberOfComponents;
- (NSInteger)filterPickerNumberOfRowsInComponent:(NSInteger)component;
- (NSString *)filterPickertitleForRow:(NSInteger)row forComponent:(NSInteger)component;
- (void)filterPickerDidSelectRow:(NSInteger)row inComponent:(NSInteger)component;

@end

@interface FilterPickerView : UIView

@property (nonatomic, strong) void(^confirmBlock)();
@property (nonatomic, strong) void(^cancelBlock)();
@property (nonatomic, assign) NSInteger currentComp;
@property (nonatomic, assign) NSInteger currentIndex;

@property (nonatomic, weak) id<FilterPickerViewDelegate> delegate;

-(instancetype)initWithFrame:(CGRect)frame titleArray:(NSArray *)titleArray;
-(void)selectRow:(NSInteger)row;
-(void)reloadData;
-(void)show;
-(void)hide;

@end
