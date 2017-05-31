//
//  GameSettingsViewController.m
//  SeaBattle
//
//  Created by begoss on 2017/5/29.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "GameSettingsViewController.h"

@interface GameSettingsViewController ()

@property (nonatomic, strong) UILabel *nicknameLabel;
@property (nonatomic, strong) UITextField *nicknameTF;
@property (nonatomic, strong) UIButton *saveButton;

@end

@implementation GameSettingsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    [self.view addSubview:self.nicknameLabel];
    [self.view addSubview:self.nicknameTF];
    [self.view addSubview:self.saveButton];
    [self.nicknameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerY.equalTo(self.nicknameTF);
        make.left.equalTo(self.nicknameTF.mas_left).offset(-50);
    }];
    [self.saveButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@80);
        make.height.equalTo(@40);
        make.left.equalTo(self.nicknameLabel);
        make.bottom.equalTo(self.view.mas_bottom).offset(-40);
    }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)saveSettings {
    [[NSUserDefaults standardUserDefaults] setObject:self.nicknameTF.text forKey:KEY_NICKNAME];
    [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark - setter

- (UILabel *)nicknameLabel {
    if (!_nicknameLabel) {
        _nicknameLabel = [UILabel new];
        _nicknameLabel.text = @"昵称： ";
        _nicknameLabel.font = Font(15);
    }
    return _nicknameLabel;
}

- (UITextField *)nicknameTF {
    if (!_nicknameTF) {
        _nicknameTF = [[UITextField alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 50, SCREEN_HEIGHT/2 - 40, 150, 40)];
        _nicknameTF.text = NICKNAME;
        _nicknameTF.borderStyle = UITextBorderStyleRoundedRect;
        _nicknameTF.autocorrectionType = UITextAutocorrectionTypeNo;
        _nicknameTF.autocapitalizationType = UITextAutocapitalizationTypeNone;
    }
    return _nicknameTF;
}

- (UIButton *)saveButton {
    if (!_saveButton) {
        _saveButton = [UIButton new];
        _saveButton.layer.cornerRadius = 4.0f;
        _saveButton.backgroundColor = [UIColor buttonBgColor1];
        [_saveButton setTitle:@"返 回" forState:UIControlStateNormal];
        [_saveButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_saveButton addTarget:self action:@selector(saveSettings) forControlEvents:UIControlEventTouchUpInside];
    }
    return _saveButton;
}

@end
