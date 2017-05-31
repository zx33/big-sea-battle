//
//  FilterPickerView.m
//  SeaBattle
//
//  Created by begoss on 2017/5/30.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "FilterPickerView.h"

@interface FilterPickerView()<UIPickerViewDelegate,UIPickerViewDataSource>

@property (nonatomic, strong) UIPickerView *pickerView;
@property (nonatomic, strong) UIView *titleView;
@property (nonatomic, strong) UIView *topView;
@property (nonatomic, strong) UIButton *cancel;
@property (nonatomic, strong) UIButton *confirm;

@end

@implementation FilterPickerView

-(instancetype)initWithFrame:(CGRect)frame titleArray:(NSArray *)titleArray {
    if (self = [super initWithFrame:[UIScreen mainScreen].bounds]) {
        self.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.5];
        [self addSubview:self.pickerView];
        CGRect rect = frame;
        rect.size.height -= 44;
        rect.origin.y = SCREEN_HEIGHT-rect.size.height;
        self.pickerView.frame = rect;
        [self addSubview:self.titleView];
        [self.titleView mas_makeConstraints:^(MASConstraintMaker *make) {
            make.height.equalTo(@50);
            make.left.equalTo(@0);
            make.right.equalTo(@0);
            make.bottom.equalTo(self.pickerView.mas_top);
        }];
        for (int i=0; i<titleArray.count; i++) {
            NSString *title = titleArray[i];
            UILabel *titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/titleArray.count*i, 0, SCREEN_WIDTH/titleArray.count, 50)];
            titleLabel.backgroundColor = [UIColor whiteColor];
            titleLabel.text = title;
            titleLabel.textColor = [UIColor purpleColor];
            titleLabel.font = Font(20);
            titleLabel.textAlignment = UITextAlignmentCenter;
            [self.titleView addSubview:titleLabel];
        }
        [self addSubview:self.topView];
        [self.topView mas_makeConstraints:^(MASConstraintMaker *make) {
            make.height.equalTo(@44);
            make.left.equalTo(@0);
            make.right.equalTo(@0);
            make.bottom.equalTo(self.titleView.mas_top);
        }];
        [self.topView addSubview:self.cancel];
        [self.cancel mas_makeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(@0);
            make.centerY.equalTo(self.topView.mas_centerY);
        }];
        [self.topView addSubview:self.confirm];
        [self.confirm mas_makeConstraints:^(MASConstraintMaker *make) {
            make.right.equalTo(@0);
            make.centerY.equalTo(self.topView.mas_centerY);
        }];
        [self addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(bgAction)]];
        self.currentIndex = 0;
    }
    return self;
}

-(void)bgAction{
    if (self.cancelBlock) {
        self.cancelBlock();
    }
    [self hide];
}


-(void)hide{
    [UIView animateWithDuration:0.25 animations:^{
        self.alpha = 0.f;
    } completion:^(BOOL finished) {
        [self removeFromSuperview];
    }];
}

-(void)show{
    self.alpha = 0.f;
    [[UIApplication sharedApplication].keyWindow addSubview:self];
    [UIView animateWithDuration:0.25 animations:^{
        self.alpha = 1.f;
    } completion:^(BOOL finished) {
        
    }];
}


-(void)cancelAction{
    if (self.cancelBlock) {
        self.cancelBlock();
    }
    [self hide];
}

-(void)confirmAction{
    if (self.confirmBlock) {
        self.confirmBlock();
    }
    [self hide];
}

-(void)reloadData{
    [self.pickerView reloadAllComponents];
}

-(void)selectRow:(NSInteger)row{
    [self.pickerView selectRow:row inComponent:0 animated:NO];
}

-(UIView *)titleView {
    if (!_titleView) {
        _titleView = [[UIView alloc] init];
        _titleView.backgroundColor = [UIColor whiteColor];
    }
    return _titleView;
}

-(UIView *)topView{
    if (!_topView) {
        _topView = [[UIView alloc] init];
        _topView.backgroundColor = Color(240, 242, 245);
    }
    return _topView;
}

-(UIButton *)cancel{
    if (!_cancel) {
        _cancel = [UIButton buttonWithType:UIButtonTypeCustom];
        [_cancel setTitle:@"取消" forState:UIControlStateNormal];
        [_cancel setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        _cancel.titleLabel.font = Font(18);
        _cancel.titleEdgeInsets = UIEdgeInsetsMake(0, 10, 0, -10);
        [_cancel addTarget:self action:@selector(cancelAction) forControlEvents:UIControlEventTouchUpInside];
    }
    return _cancel;
}

-(UIButton *)confirm{
    if (!_confirm) {
        _confirm = [UIButton buttonWithType:UIButtonTypeCustom];
        [_confirm setTitle:@"确定" forState:UIControlStateNormal];
        [_confirm setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        _confirm.titleEdgeInsets = UIEdgeInsetsMake(0, -10, 0, 10);
        _confirm.titleLabel.font = Font(18);
        [_confirm addTarget:self action:@selector(confirmAction) forControlEvents:UIControlEventTouchUpInside];
    }
    return _confirm;
}

-(UIPickerView *)pickerView{
    if (!_pickerView) {
        _pickerView = [[UIPickerView alloc] init];
        _pickerView.delegate = self;
        _pickerView.dataSource = self;
        _pickerView.showsSelectionIndicator = YES;
        _pickerView.backgroundColor = [UIColor whiteColor];
    }
    return _pickerView;
}


#pragma mark uipickerviewdatasource & delegate
- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView {
    if ([self.delegate respondsToSelector:@selector(filterPickerNumberOfComponents)]) {
        return [self.delegate filterPickerNumberOfComponents];
    }
    return 0;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component {
    if ([self.delegate respondsToSelector:@selector(filterPickerNumberOfRowsInComponent:)]) {
        return [self.delegate filterPickerNumberOfRowsInComponent:component];
    }
    return 0;
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component {
    
    if ([self.delegate respondsToSelector:@selector(filterPickertitleForRow:forComponent:)]) {
        return [self.delegate filterPickertitleForRow:row forComponent:component];
    }
    return 0;
}

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component {
    if ([self.delegate respondsToSelector:@selector(filterPickerDidSelectRow:inComponent:)]) {
        [self.delegate filterPickerDidSelectRow:row inComponent:component];
    }
}

-(CGFloat)pickerView:(UIPickerView *)pickerView rowHeightForComponent:(NSInteger)component{
    return 46;
}


@end
