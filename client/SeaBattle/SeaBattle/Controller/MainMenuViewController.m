//
//  MainMenuViewController.m
//  SeaBattle
//
//  Created by begoss on 2017/5/29.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "MainMenuViewController.h"
#import "GameSettingsViewController.h"
#import "CreateOrJoinViewController.h"

@interface MainMenuViewController ()

@property (nonatomic, strong) UIButton *singleGameButton;
@property (nonatomic, strong) UIButton *netGameButton;
@property (nonatomic, strong) UIButton *settingsButton;

@end

@implementation MainMenuViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    [self.view addSubview:self.singleGameButton];
    [self.view addSubview:self.netGameButton];
    [self.view addSubview:self.settingsButton];
    [self.netGameButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@100);
        make.height.equalTo(@40);
        make.centerX.equalTo(self.view);
        make.centerY.equalTo(self.view);
    }];
    [self.singleGameButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@100);
        make.height.equalTo(@40);
        make.bottom.equalTo(self.netGameButton.mas_top).offset(-10);
        make.centerX.equalTo(self.netGameButton);
    }];
    [self.settingsButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@100);
        make.height.equalTo(@40);
        make.top.equalTo(self.netGameButton.mas_bottom).offset(10);
        make.centerX.equalTo(self.netGameButton);
    }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)singleGameMode {
    [self.view showAlertTitle:@"敬请期待" duration:1.0f];
}

- (void)netGameMode {
    CreateOrJoinViewController *vc = [[CreateOrJoinViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)gameSettings {
    GameSettingsViewController *vc = [[GameSettingsViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

#pragma mark - setter

- (UIButton *)singleGameButton {
    if (!_singleGameButton) {
        _singleGameButton = [UIButton new];
        _singleGameButton.layer.cornerRadius = 4.0f;
        _singleGameButton.backgroundColor = [UIColor buttonBgColor1];
        [_singleGameButton setTitle:@"单人游戏" forState:UIControlStateNormal];
        [_singleGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_singleGameButton addTarget:self action:@selector(singleGameMode) forControlEvents:UIControlEventTouchUpInside];
    }
    return _singleGameButton;
}

- (UIButton *)netGameButton {
    if (!_netGameButton) {
        _netGameButton = [UIButton new];
        _netGameButton.layer.cornerRadius = 4.0f;
        _netGameButton.backgroundColor = [UIColor buttonBgColor1];
        [_netGameButton setTitle:@"联机游戏" forState:UIControlStateNormal];
        [_netGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_netGameButton addTarget:self action:@selector(netGameMode) forControlEvents:UIControlEventTouchUpInside];
    }
    return _netGameButton;
}

- (UIButton *)settingsButton {
    if (!_settingsButton) {
        _settingsButton = [UIButton new];
        _settingsButton.layer.cornerRadius = 4.0f;
        _settingsButton.backgroundColor = [UIColor buttonBgColor1];
        [_settingsButton setTitle:@"游戏设置" forState:UIControlStateNormal];
        [_settingsButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_settingsButton addTarget:self action:@selector(gameSettings) forControlEvents:UIControlEventTouchUpInside];
    }
    return _settingsButton;
}

@end
