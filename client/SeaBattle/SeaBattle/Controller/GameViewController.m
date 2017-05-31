//
//  GameViewController.m
//  HaiZhan
//
//  Created by dotamax on 17/3/1.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "GameViewController.h"
#import "BoardCell.h"
#import "ShipLocationModel.h"

#define GAME_STATE_OUR_TURN 0
#define GAME_STATE_ENEMYS_TURN 1
#define GAME_STATE_SHOW_TEXT 2
#define GAME_STATE_WIN 3
#define GAME_STATE_LOSE 4

@interface GameViewController () <UICollectionViewDataSource,UICollectionViewDelegate,UICollectionViewDelegateFlowLayout,UIAlertViewDelegate> {
    int _enemyBoardArray[8][8];
    int _ourBoardArray[8][8];
}

@property (nonatomic, assign) NSInteger gameState;
@property (nonatomic, assign) NSInteger ourRemain;
@property (nonatomic, assign) NSInteger enemysRemain;

@property (nonatomic, strong) UILabel *enemyLabel;
@property (nonatomic, strong) UILabel *ourArmyLabel;
@property (nonatomic, strong) UILabel *guideLabel;
@property (nonatomic, strong) UICollectionView *enemyBoard;
@property (nonatomic, strong) UICollectionView *ourArmyBoard;
@property (nonatomic, strong) UIButton *endGameButton;

@end

@implementation GameViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    self.gameState = GAME_STATE_OUR_TURN;
    
    [self setUI];
    [self loadPlayerBoard];
//    [self loadEnemyBoard];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)setUI {
    [self.view addSubview:self.enemyLabel];
    [self.view addSubview:self.ourArmyLabel];
    [self.view addSubview:self.guideLabel];
    [self.view addSubview:self.endGameButton];
    [self.view addSubview:self.ourArmyBoard];
    [self.view addSubview:self.enemyBoard];
}

- (void)loadPlayerBoard {
    for (int i=0; i<self.playerShipLocationArray.count; i++) {
        ShipLocationModel *model = self.playerShipLocationArray[i];
        for (int j=0; j<model.location.count; j++) {
            _ourBoardArray[model.location[j].x][model.location[j].y] = STATE_DEPLOYED;
        }
    }
}

/**
 *  单机版AI布局
 */
- (void)loadEnemyBoard {
    for (int i=0; i<3; i++) {
        int x=0;
        int y=0;
        int length=0;
        int orientation=0;
        BOOL canDeploy = NO;
        while (!canDeploy) {
            orientation= arc4random() % 2;
            if (i == 1) {
                x = arc4random() % 5;
                y = arc4random() % 5;
                length = 2;
            }else {
                x = arc4random() % 4;
                y = arc4random() % 4;
                length = 3;
            }
            for (int j=0; j<length; j++) {
                if (orientation == 0) {
                    canDeploy = [self checkIfCanDeployShip:x+j y:y];
                }else {
                    canDeploy = [self checkIfCanDeployShip:x y:y+j];
                }
                if (!canDeploy) {
                    break;
                }
            }
        }
        for (int k=0; k<length; k++) {
            if (orientation == 0) {
                _enemyBoardArray[x+k][y] = STATE_HAS_ENEMYSHIP;
            }else {
                _enemyBoardArray[x][y+k] = STATE_HAS_ENEMYSHIP;
            }
        }
    }
}

- (BOOL)checkIfCanDeployShip:(NSInteger)x y:(NSInteger)y {
    if (_enemyBoardArray[x][y] == STATE_HAS_ENEMYSHIP) {
        return NO;
    }
    return YES;
}

- (void)ourTurnToAttack:(NSIndexPath *)indexPath {
    if (_enemyBoardArray[indexPath.section][indexPath.row] == STATE_EMPTY) {
        self.gameState = GAME_STATE_SHOW_TEXT;
        self.guideLabel.text = @"没打中敌人！";
        _enemyBoardArray[indexPath.section][indexPath.row] = STATE_NO_SHIP;
        [self.enemyBoard reloadData];
        [self performSelector:@selector(transitionFunc) withObject:nil afterDelay:1.0f];
    }else if (_enemyBoardArray[indexPath.section][indexPath.row] == STATE_HAS_ENEMYSHIP) {
        self.gameState = GAME_STATE_SHOW_TEXT;
        self.guideLabel.text = @"击中敌方！";
        _enemyBoardArray[indexPath.section][indexPath.row] = STATE_DESTROYED;
        [self.enemyBoard reloadData];
        self.enemysRemain--;
        [self performSelector:@selector(setAfterDestroyEnemy) withObject:nil afterDelay:1.0f];
    }
}

- (void)transitionFunc {
    if (self.gameState == GAME_STATE_SHOW_TEXT) {
        self.gameState = GAME_STATE_ENEMYS_TURN;
        self.guideLabel.text = @"敌人的回合";
        [self performSelector:@selector(enemyAttack) withObject:nil afterDelay:1.0f];
    }else if (self.gameState == GAME_STATE_ENEMYS_TURN) {
        self.gameState = GAME_STATE_OUR_TURN;
        self.guideLabel.text = @"你的回合";
    }
}

- (void)enemyAttack {
    int x=0;
    int y=0;
    NSInteger beginAttack = 0;
    while (!beginAttack) {
        x = arc4random() % BOARD_SIZE;
        y = arc4random() % BOARD_SIZE;
        if (_ourBoardArray[x][y] == STATE_EMPTY) {
            beginAttack = 1;
        }else if (_ourBoardArray[x][y] == STATE_DEPLOYED) {
            beginAttack = 2;
        }
    }
    if (beginAttack == 1) {
        self.guideLabel.text = @"敌人没打中！";
        _ourBoardArray[x][y] = STATE_NO_SHIP;
        [self.ourArmyBoard reloadData];
        [self performSelector:@selector(transitionFunc) withObject:nil afterDelay:1.0f];
    }else if (beginAttack == 2) {
        self.guideLabel.text = @"你被击中了！";
        self.gameState = GAME_STATE_SHOW_TEXT;
        _ourBoardArray[x][y] = STATE_DESTROYED;
        [self.ourArmyBoard reloadData];
        self.ourRemain--;
        if (self.ourRemain) {
            [self performSelector:@selector(transitionFunc) withObject:nil afterDelay:1.0f];
        }else {
            self.gameState = GAME_STATE_LOSE;
            self.guideLabel.text = @"你失败了！";
        }
    }
}

- (void)setAfterDestroyEnemy {
    if (self.enemysRemain) {
        self.gameState = GAME_STATE_OUR_TURN;
        self.guideLabel.text = @"你的回合";
    }else {
        self.gameState = GAME_STATE_WIN;
        self.guideLabel.text = @"你获胜了！";
    }
}

- (void)endGame:(UIButton *)button {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"你确定要结束游戏吗"
                                                    message:@""
                                                   delegate:self
                                          cancelButtonTitle:@"取消"
                                          otherButtonTitles:@"确定", nil];
    alert.tag = 1001;
    [alert show];
}

#pragma mark - AlertView Delegate

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    if (alertView.tag == 1001) {
        if (buttonIndex == 1) {
            
            [self.navigationController popViewControllerAnimated:YES];
        }
    }
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
    if (collectionView.tag == 101) {
        [cell setColor:_ourBoardArray[indexPath.section][indexPath.row]];
    }else {
        [cell setColor:_enemyBoardArray[indexPath.section][indexPath.row]];
    }
    return cell;
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath{
    if (collectionView.tag == 101) {
        return CGSizeMake(25, 25);
    }else {
        return CGSizeMake(40, 40);
    }
}


- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout minimumLineSpacingForSectionAtIndex:(NSInteger)section{
    if (collectionView.tag == 101) {
        return 1;
    }else {
        return 2;
    }
}
- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout minimumInteritemSpacingForSectionAtIndex:(NSInteger)section{
    if (collectionView.tag == 101) {
        return 1;
    }else {
        return 2;
    }
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section{
    if (collectionView.tag == 101) {
        if (section == BOARD_SIZE-1) {
            return UIEdgeInsetsMake(1, 1, 1, 1);
        }
        return UIEdgeInsetsMake(1, 1, 0, 1);
    }else {
        if (section == BOARD_SIZE-1) {
            return UIEdgeInsetsMake(2, 2, 2, 2);
        }
        return UIEdgeInsetsMake(2, 2, 0, 2);
    }
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath{
    [collectionView deselectItemAtIndexPath:indexPath animated:YES];
    NSLog(@"section:%ld,row:%ld",indexPath.section,indexPath.row);
    if (collectionView.tag == 102) {
        if (self.gameState == GAME_STATE_OUR_TURN) {
            [self ourTurnToAttack:indexPath];
        }
    }
}

#pragma mark - Setter

- (UILabel *)enemyLabel {
    if (!_enemyLabel) {
        _enemyLabel = [[UILabel alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 148, 15, 100, 15)];
        _enemyLabel.font = Font(14);
        _enemyLabel.textColor = [UIColor purpleColor];
        _enemyLabel.text = @"敌方海域";
    }
    return _enemyLabel;
}

- (UILabel *)ourArmyLabel {
    if (!_ourArmyLabel) {
        _ourArmyLabel = [[UILabel alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 148, 340, 100, 20)];
        _ourArmyLabel.font = Font(14);
        _ourArmyLabel.textColor = [UIColor purpleColor];
        _ourArmyLabel.text = @"你的海域";
    }
    return _ourArmyLabel;
}

- (UILabel *)guideLabel {
    if (!_guideLabel) {
        _guideLabel = [[UILabel alloc] initWithFrame:CGRectMake(SCREEN_WIDTH - 120, 360, 100, 20)];
        _guideLabel.font = BoldFont(15);
        _guideLabel.textColor = [UIColor blackColor];
        _guideLabel.text = @"你的回合";
    }
    return _guideLabel;
}

- (UIButton *)endGameButton {
    if (!_endGameButton) {
        _endGameButton = [[UIButton alloc] initWithFrame:CGRectMake(SCREEN_WIDTH - 80, SCREEN_HEIGHT - 60, 60, 40)];
        _endGameButton.backgroundColor = [UIColor buttonBgColor1];
        [_endGameButton setTitle:@"结束" forState:UIControlStateNormal];
        [_endGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_endGameButton addTarget:self action:@selector(endGame:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _endGameButton;
}

- (UICollectionView *)ourArmyBoard {
    if (!_ourArmyBoard) {
        _ourArmyBoard = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 148, 370, 183, 183) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
        _ourArmyBoard.dataSource = self;
        _ourArmyBoard.delegate = self;
        _ourArmyBoard.scrollEnabled = NO;
        _ourArmyBoard.tag = 101;
        _ourArmyBoard.backgroundColor = [UIColor lineColor];
        _ourArmyBoard.alwaysBounceVertical = YES;
        [_ourArmyBoard registerClass:[BoardCell class] forCellWithReuseIdentifier:NSStringFromClass([BoardCell class])];
    }
    return _ourArmyBoard;
}

- (UICollectionView *)enemyBoard {
    if (!_enemyBoard) {
        _enemyBoard = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 148, 40, 296, 296) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
        _enemyBoard.dataSource = self;
        _enemyBoard.delegate = self;
        _enemyBoard.scrollEnabled = NO;
        _enemyBoard.tag = 102;
        _enemyBoard.backgroundColor = [UIColor lineColor];
        _enemyBoard.alwaysBounceVertical = YES;
        [_enemyBoard registerClass:[BoardCell class] forCellWithReuseIdentifier:NSStringFromClass([BoardCell class])];
    }
    return _enemyBoard;
}

@end
