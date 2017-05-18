//
//  DeployShipViewController.m
//  HaiZhan
//
//  Created by dotamax on 17/3/1.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "DeployShipViewController.h"
#import "BoardCell.h"
#import "GameViewController.h"
#import "ShipLocationModel.h"
#import "NetGameViewController.h"

@interface DeployShipViewController () <UICollectionViewDataSource,UICollectionViewDelegate,UICollectionViewDelegateFlowLayout> {
    int _boardArray[BOARD_SIZE][BOARD_SIZE];
}

@property (nonatomic, assign) NSInteger deployState;
@property (nonatomic, assign) NSInteger shipOrientation;
@property (nonatomic, strong) NSMutableArray *shipLocationArray;
@property (nonatomic, strong) NSIndexPath *lastDeployingIndexPath;
@property (nonatomic, assign) NSInteger lastDeployingOrientation;

@property (nonatomic, strong) UIButton *backButton;
@property (nonatomic, strong) UIButton *startBattleButton;
@property (nonatomic, strong) UICollectionView *collectionView;
@property (nonatomic, strong) UILabel *guideLabel;
@property (nonatomic, strong) UIButton *rotateButton;
@property (nonatomic, strong) UIButton *deployButton;

@end

@implementation DeployShipViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    self.deployState = 0;
    self.shipOrientation = 0;
    self.shipLocationArray = [NSMutableArray new];
    for (int i=0; i<BOARD_SIZE; i++) {
        for (int j=0; j<BOARD_SIZE; j++) {
            _boardArray[i][j] = STATE_EMPTY;
        }
    }
    
    [self initUI];
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)initUI {
    [self.view addSubview:self.backButton];
    [self.view addSubview:self.startBattleButton];
    [self.view addSubview:self.collectionView];//???如果把collectionView放在第一个add，就会出现错位的情况，为什么???
    [self.view addSubview:self.guideLabel];
    [self.view addSubview:self.rotateButton];
    [self.view addSubview:self.deployButton];
    [self.backButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@80);
        make.height.equalTo(@40);
        make.left.equalTo(self.collectionView.mas_left);
        make.bottom.equalTo(self.view.mas_bottom).offset(-40);
    }];
    [self.startBattleButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@80);
        make.height.equalTo(@40);
        make.right.equalTo(self.collectionView.mas_right);
        make.bottom.equalTo(self.view.mas_bottom).offset(-40);
    }];
    [self.guideLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.collectionView.mas_left);
        make.top.equalTo(self.collectionView.mas_bottom).offset(20);
    }];
    [self.rotateButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@80);
        make.height.equalTo(@40);
        make.left.equalTo(self.collectionView.mas_left);
        make.top.equalTo(self.guideLabel.mas_bottom).offset(20);
    }];
    [self.deployButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@80);
        make.height.equalTo(@40);
        make.right.equalTo(self.collectionView.mas_right);
        make.top.equalTo(self.guideLabel.mas_bottom).offset(20);
    }];
}

- (void)rotateShip:(UIButton *)button {
    if (self.shipOrientation == 0) {
        self.shipOrientation = 1;
        [button setTitle:@"方向:横" forState:UIControlStateNormal];
    }else {
        self.shipOrientation = 0;
        [button setTitle:@"方向:竖" forState:UIControlStateNormal];
    }
}

- (void)deployShip:(UIButton *)button {
    if (self.deployState == 0) {
        if (self.lastDeployingIndexPath) {
            self.guideLabel.text = @"请放置第二条船，长度2";
            if (self.lastDeployingOrientation == 0) {
                for (int i=0; i<3; i++) {
                    _boardArray[self.lastDeployingIndexPath.section+i][self.lastDeployingIndexPath.row] = STATE_DEPLOYED;
                }
            }else {
                for (int i=0; i<3; i++) {
                    _boardArray[self.lastDeployingIndexPath.section][self.lastDeployingIndexPath.row+i] = STATE_DEPLOYED;
                }
            }
            ShipLocationModel *location = [ShipLocationModel new];
            [location initWithIndexPath:self.lastDeployingIndexPath Length:3 orientation:self.lastDeployingOrientation];
            [self.shipLocationArray addObject:location];
            [self.collectionView reloadData];
            self.deployState = 1;
            self.lastDeployingIndexPath = nil;

        }
    }else if (self.deployState == 1) {
        if (self.lastDeployingIndexPath) {
            self.guideLabel.text = @"放置完毕，可以开战";
            if (self.lastDeployingOrientation == 0) {
                for (int i=0; i<2; i++) {
                    _boardArray[self.lastDeployingIndexPath.section+i][self.lastDeployingIndexPath.row] = STATE_DEPLOYED;
                }
            }else {
                for (int i=0; i<2; i++) {
                    _boardArray[self.lastDeployingIndexPath.section][self.lastDeployingIndexPath.row+i] = STATE_DEPLOYED;
                }
            }
            ShipLocationModel *location = [ShipLocationModel new];
            [location initWithIndexPath:self.lastDeployingIndexPath Length:2 orientation:self.lastDeployingOrientation];
            [self.shipLocationArray addObject:location];
            [self.collectionView reloadData];
            self.deployState = 2;
            self.lastDeployingIndexPath = nil;
        }
    }
//    else if (self.deployState == 2) {
//        if (self.lastDeployingIndexPath) {
//            self.guideLabel.text = @"放置完毕，可以开战";
//            if (self.lastDeployingOrientation == 0) {
//                for (int i=0; i<3; i++) {
//                    _boardArray[self.lastDeployingIndexPath.section+i][self.lastDeployingIndexPath.row] = STATE_DEPLOYED;
//                }
//            }else {
//                for (int i=0; i<3; i++) {
//                    _boardArray[self.lastDeployingIndexPath.section][self.lastDeployingIndexPath.row+i] = STATE_DEPLOYED;
//                }
//            }
//            ShipLocationModel *location = [ShipLocationModel new];
//            [location initWithIndexPath:self.lastDeployingIndexPath Length:3 orientation:self.lastDeployingOrientation];
//            [self.shipLocationArray addObject:location];
//            [self.collectionView reloadData];
//            self.deployState = 3;
//            self.lastDeployingIndexPath = nil;
//        }
//    }
}

- (void)endGame:(UIButton *)button {
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)startBattle:(UIButton *)button {
    if (self.deployState == 2) {
        [MBProgressHUD showHUDAddedTo:self.view animated:YES];
        NSString *mapInfo = @"";
        for (int i=0; i<BOARD_SIZE; i++) {
            for (int j=0; j<BOARD_SIZE; j++) {
                if (_boardArray[i][j] == STATE_EMPTY) {
                    mapInfo = [mapInfo stringByAppendingString:@"0"];
                }else if (_boardArray[i][j] == STATE_DEPLOYED) {
                    mapInfo = [mapInfo stringByAppendingString:@"1"];
                }
            }
        }
        [HttpTool postWithPath:[ApiConfig API_SET_MAP] params:[NSDictionary dictionaryWithObjectsAndKeys:mapInfo, @"map_info", nil] success:^(id JSON) {
            [MBProgressHUD hideHUDForView:self.view animated:YES];
            if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
                NetGameViewController *gameVC = [[NetGameViewController alloc] init];
                gameVC.playerShipLocationArray = self.shipLocationArray;
                [self.navigationController pushViewController:gameVC animated:YES];
            }else {
                [self.view showBadtipsAlert:[JSON objectForKey:@"msg"]];
            }
        } failure:^(NSError *error) {
            [MBProgressHUD hideHUDForView:self.view animated:YES];
            [self.view showBadtipsAlert:@"请求超时"];
        }];
    }else {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"还未部署完成"
                                                        message:@""
                                                       delegate:self
                                              cancelButtonTitle:@"确定"
                                              otherButtonTitles:nil];
        [alert show];
    }
}

- (BOOL)checkIfCanDeployShip:(NSIndexPath *)indexPath shipLength:(NSInteger)length {
    if (self.shipOrientation == 0) {
        for (int i=0; i<length; i++) {
            if ([self checkIfHasShipOrOutOfBounds:indexPath.section+i y:indexPath.row]) {
                return NO;
            }
        }
    }else {
        for (int i=0; i<length; i++) {
            if ([self checkIfHasShipOrOutOfBounds:indexPath.section y:indexPath.row+i]) {
                return NO;
            }
        }
    }
    return YES;
}

- (BOOL)checkIfHasShipOrOutOfBounds:(NSInteger)x y:(NSInteger)y{
    if (x > BOARD_SIZE-1) {
        return YES;
    }
    if (y > BOARD_SIZE-1) {
        return YES;
    }
    if (!(_boardArray[x][y] == STATE_EMPTY || _boardArray[x][y] == STATE_DEPLOYING)) {
        return YES;
    }
    return NO;
}

- (void)deployingShip:(NSIndexPath *)indexPath shipLength:(NSInteger)length {
    if (!self.lastDeployingIndexPath) {
        self.lastDeployingIndexPath = indexPath;
        self.lastDeployingOrientation = self.shipOrientation;
        if (self.shipOrientation == 0) {
            for (int i=0; i<length; i++) {
                _boardArray[indexPath.section+i][indexPath.row] = STATE_DEPLOYING;
            }
        }else {
            for (int i=0; i<length; i++) {
                _boardArray[indexPath.section][indexPath.row+i] = STATE_DEPLOYING;
            }
        }
        [self.collectionView reloadData];
        return;
    }
    if (self.lastDeployingOrientation == 0) {
        for (int i=0; i<length; i++) {
            _boardArray[self.lastDeployingIndexPath.section+i][self.lastDeployingIndexPath.row] = STATE_EMPTY;
        }
    }else {
        for (int i=0; i<length; i++) {
            _boardArray[self.lastDeployingIndexPath.section][self.lastDeployingIndexPath.row+i] = STATE_EMPTY;
        }
    }
    self.lastDeployingIndexPath = indexPath;
    self.lastDeployingOrientation = self.shipOrientation;
    if (self.shipOrientation == 0) {
        for (int i=0; i<length; i++) {
            _boardArray[indexPath.section+i][indexPath.row] = STATE_DEPLOYING;
        }
    }else {
        for (int i=0; i<length; i++) {
            _boardArray[indexPath.section][indexPath.row+i] = STATE_DEPLOYING;
        }
    }
    [self.collectionView reloadData];
}

#pragma mark - CollectionView Delegate

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return BOARD_SIZE;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section{
    return BOARD_SIZE;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath{
    BoardCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:NSStringFromClass([BoardCell class]) forIndexPath:indexPath];
    [cell setColor:_boardArray[indexPath.section][indexPath.row]];
    return cell;
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath{
    return CGSizeMake(40, 40);
}

- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout minimumLineSpacingForSectionAtIndex:(NSInteger)section{
    return 2;
}
- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout minimumInteritemSpacingForSectionAtIndex:(NSInteger)section{
    return 2;
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section{
    if (section == BOARD_SIZE-1) {
        return UIEdgeInsetsMake(2, 2, 2, 2);
    }
    return UIEdgeInsetsMake(2, 2, 0, 2);
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath{
    [collectionView deselectItemAtIndexPath:indexPath animated:YES];
    NSLog(@"section:%ld,row:%ld",indexPath.section,indexPath.row);
    if (self.deployState == 0) {
        if ([self checkIfCanDeployShip:indexPath shipLength:3]) {
            [self deployingShip:indexPath shipLength:3];
        }
    }else if (self.deployState == 1) {
        if ([self checkIfCanDeployShip:indexPath shipLength:2]) {
            [self deployingShip:indexPath shipLength:2];
        }
    }else if (self.deployState == 2) {
        if ([self checkIfCanDeployShip:indexPath shipLength:3]) {
            [self deployingShip:indexPath shipLength:3];
        }
    }
}

#pragma mark - Setter

- (UIButton *)backButton {
    if (!_backButton) {
        _backButton = [UIButton new];
        _backButton.backgroundColor = [UIColor buttonBgColor1];
        _backButton.layer.cornerRadius = 4.0f;
        [_backButton setTitle:@"结 束" forState:UIControlStateNormal];
        [_backButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_backButton addTarget:self action:@selector(endGame:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _backButton;
}

- (UIButton *)startBattleButton {
    if (!_startBattleButton) {
        _startBattleButton = [UIButton new];
        _startBattleButton.backgroundColor = [UIColor buttonBgColor1];
        _startBattleButton.layer.cornerRadius = 4.0f;
        [_startBattleButton setTitle:@"完 成" forState:UIControlStateNormal];
        [_startBattleButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_startBattleButton addTarget:self action:@selector(startBattle:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _startBattleButton;
}

- (UICollectionView *)collectionView {
    if (!_collectionView) {
        _collectionView = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - (21*BOARD_SIZE+1), 60, 42*BOARD_SIZE+2, 42*BOARD_SIZE+2) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
        _collectionView.dataSource = self;
        _collectionView.delegate = self;
        _collectionView.scrollEnabled = NO;
        _collectionView.backgroundColor = [UIColor lineColor];
        _collectionView.alwaysBounceVertical = YES;
        [_collectionView registerClass:[BoardCell class] forCellWithReuseIdentifier:NSStringFromClass([BoardCell class])];
    }
    return _collectionView;
}

- (UILabel *)guideLabel {
    if (!_guideLabel) {
        _guideLabel = [UILabel new];
        _guideLabel.font = BoldFont(15);
        _guideLabel.textColor = [UIColor blackColor];
        _guideLabel.text = @"请放置第一条船，长度3";
    }
    return _guideLabel;
}

- (UIButton *)rotateButton {
    if (!_rotateButton) {
        _rotateButton = [UIButton new];
        _rotateButton.backgroundColor = [UIColor buttonBgColor2];
        _rotateButton.layer.cornerRadius = 4.0f;
        [_rotateButton setTitle:@"方向:竖" forState:UIControlStateNormal];
        [_rotateButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [_rotateButton addTarget:self action:@selector(rotateShip:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _rotateButton;
}

- (UIButton *)deployButton {
    if (!_deployButton) {
        _deployButton = [UIButton new];
        _deployButton.backgroundColor = [UIColor buttonBgColor2];
        _deployButton.layer.cornerRadius = 4.0f;
        [_deployButton setTitle:@"确 认" forState:UIControlStateNormal];
        [_deployButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
        [_deployButton addTarget:self action:@selector(deployShip:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _deployButton;
}

@end
