/// <reference path="../jslib-modular/physics2d.d.ts" />
/// <reference path="../jslib-modular/tzdraw2d.d.ts" />
/// <reference path="../jslib-modular/turbulenz.d.ts" />
/// <reference path="../jslib-modular/canvas.d.ts" />
/// <reference path="../jslib-modular/debug.d.ts" />
/// <reference path="../jslib-modular/fontmanager.d.ts" />
/// <reference path="../jslib-modular/utilities.d.ts" />
/// <reference path="../jslib-modular/vmath.d.ts" />
/// <reference path="../scripts/htmlcontrols.d.ts" />
declare class RigidSprite {
    public sprite: Draw2DSprite;
    public body: Physics2DRigidBody;
    public gid: number;
    public initialPos: number[];
    public isDead: boolean;
    constructor(options: RigidSpriteOptions);
    public getShapes(): Physics2DShape[];
    public kill(): void;
    public draw(draw2D: Draw2D, offset: any): void;
}
declare class CollisionHelper {
    public collisionUtils: Physics2DCollisionUtils;
    private interactables;
    private checkpoints;
    private player;
    constructor(physicsDevice: Physics2DDevice);
    public setPlayer(player: Player): void;
    public pushInteractable(object: Interactable): void;
    public removeAllInteractables(): void;
    public pushCheckpoint(check: Checkpoint): void;
    public removeAllCheckpoints(): void;
    /**
    * Should be run every time step in the main loop
    */
    public checkCollision(): void;
}
declare class Platform extends RigidSprite {
    static debugColor: number[];
    public game: GameObject;
    constructor(options: RigidSpriteOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): Platform;
    public draw(draw2D: Draw2D, offset: number[]): void;
}
declare class KnitCube extends RigidSprite implements Buildable {
    static debugColorConstruct: number[];
    static debugColorCube: number[];
    public game: GameObject;
    public GROW_SPEED: number;
    public maxDimension: number;
    public minDimension: number;
    public currentDimension: number;
    public construct: RigidSprite;
    public isBuildable: boolean;
    constructor(options: knitCubeOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): KnitCube;
    public ratioYarnUsed(): number;
    public buildUp(): void;
    public buildDown(): void;
    public getBuildableShape(): Physics2DShape;
    private remakeConstruct();
    public playerCollideCallback(player: Player): void;
    public getShapes(): Physics2DShape[];
    public draw(draw2D: Draw2D, offset: number[]): void;
}
declare class Chain extends RigidSprite implements Buildable, Climbable {
    static debugColorChain: number[];
    static debugColorConstruct: number[];
    public GROW_SPEED: number;
    public maxHeight: number;
    public minHeight: number;
    public currentHeight: number;
    public width: number;
    public construct: RigidSprite;
    public rotation: number;
    public game: GameObject;
    public material: Physics2DMaterial;
    public isBuildable: boolean;
    public isClimbable: boolean;
    public needleHeight: number;
    constructor(options: ChainOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): Chain;
    public getBuildableShape(): Physics2DShape;
    public buildUp(): void;
    public buildDown(): void;
    public ratioYarnUsed(): number;
    public isClimbableAtObjectPosition(collisionUtil: Physics2DCollisionUtils, shape: Physics2DShape): boolean;
    public getClimbableShape(): Physics2DShape;
    public getTopPosition(): number;
    public getShapes(): Physics2DShape[];
    public playerCollideCallback(player: Player): void;
    public draw(draw2D: Draw2D, offset: number[]): void;
}
/**
* Created by martelly on 4/23/2014.
*/
/**
* A yarn ball sprite that is meant to indicate how much yarn a tool has been used.
* The tool class should set the associated buildable for the yarn ball. Then the
* yarn ball can grow it's size accordingly.
*/
declare class ToolYarnBall extends RigidSprite {
    public game: GameObject;
    public buildable: Buildable;
    public maxDimension: number;
    public texture: Texture;
    static debugColor: number[];
    static TEXTURE_FILE: string;
    constructor(options: ToolYarnBallOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): ToolYarnBall;
    public setBuildable(buildable: Buildable): void;
    public draw(draw2d: Draw2D, offset: number[]): void;
}
declare enum ShapeGroups {
    PLAYER = 1,
    TOOLS = 2,
    OVERLAPPABLES = 4,
    COLLIDABLES = 8,
}
declare enum ObjectMasks {
    SOLID = 13,
    EMPTY = 0,
    PLAYEREMPTY = 12,
}
declare enum Direction {
    LEFT = 0,
    RIGHT = 1,
}
declare class AnimatedTexture {
    public textureFile: string;
    public frameDimensions: number[];
    public frameCount: number;
    public isLooping: boolean;
    public noAutoreset: boolean;
    public texture: Texture;
    public currentFrame: number;
    public didLoop: boolean;
    public isReversed: boolean;
    public isPaused: boolean;
    public loopCallback: Function;
    public keyframes: number[];
    public loadTexture(graphicsDevice: GraphicsDevice, callback?: any): void;
    public getFrameCount(): number;
    constructor(textureFile: string, frameDimensions: number[], frameCount: number, isLooping: boolean, noAutoreset?: boolean);
    public setNoAutoreset(noAutoreset: any): void;
    public setTexture(n: number): void;
    public reverse(): void;
    public pause(): void;
    public play(): void;
    public setReverse(isReversed: any): void;
    public setLoopCallback(callback: Function): void;
    public updateCurrentFrame(): void;
    public resetLoop(): void;
    public currentFrameRectangle(facing?: Direction): number[];
}
declare class Rectangle extends RigidSprite implements Buildable, Climbable, Interactable {
    static debugColorBuildable: number[];
    static debugColorClimbable: number[];
    static debugColorSolid: number[];
    static BUILD_DELAY_CLIMBABLE: number;
    static NUMBER_OF_FRAMES_CLIMBABLE: number;
    static HEIGHT_INTERVAL_CLIMBABLE: number;
    static WIDTH_INTERVAL_CLIMBABLE: number;
    static HEIGHT_BUFFER_CLIMBABLE: number;
    static WIDTH_BUFFER_CLIMBABLE: number;
    static TEXTURE_FILE_CLIMBABLE: string;
    static FINAL_TEXTURE_RECTANGLE_CLIMBABLE: number[];
    static BUILD_DELAY_NONCLIMBABLE: number;
    static NUMBER_OF_FRAMES_NONCLIMBABLE: number;
    static HEIGHT_INTERVAL_NONCLIMBABLE: number;
    static WIDTH_INTERVAL_NONCLIMBABLE: number;
    static HEIGHT_BUFFER_NONCLIMBABLE: number;
    static WIDTH_BUFFER_NONCLIMBABLE: number;
    static TEXTURE_FILE_NONCLIMBABLE: string;
    static FINAL_TEXTURE_RECTANGLE_NONCLIMBABLE: number[];
    static BUILD_DELAY_CUBE: number;
    static NUMBER_OF_FRAMES_CUBE: number;
    static HEIGHT_INTERVAL_CUBE: number;
    static WIDTH_INTERVAL_CUBE: number;
    static HEIGHT_BUFFER_CUBE: number;
    static WIDTH_BUFFER_CUBE: number;
    static TEXTURE_FILE_CUBE: string;
    static FINAL_TEXTURE_RECTANGLE_CUBE: number[];
    public maxSize: number;
    public minSize: number;
    public width: number;
    public height: number;
    public currentSize: number;
    public rotation: number;
    public material: Physics2DMaterial;
    public mask: number;
    public growSurface: string;
    public lastBuildTime: number;
    public isInWorld: boolean;
    public texture: Texture;
    public animatedTexture: AnimatedTexture;
    public textureLoaded: boolean;
    public animatedTextureLoaded: boolean;
    public animationTimeout: any;
    public animating: boolean;
    public afterAnimatingSize: number;
    public buildDelay: number;
    public numberOfFrames: number;
    public heightInterval: number;
    public widthInterval: number;
    public heightBuffer: number;
    public widthBuffer: number;
    public textureFile: string;
    public finalTextureRectangle: number[];
    public isBuildable: boolean;
    public isBeingPulled: boolean;
    public isPullable: boolean;
    public isClimbable: boolean;
    public shape: Physics2DShape;
    public isSolid: boolean;
    public game: GameObject;
    public sprites: Draw2DSprite[];
    constructor(options: RectangleOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): Rectangle;
    public buildUp(): void;
    public buildDown(): void;
    public ratioYarnUsed(): number;
    public buildShape(size: number): void;
    public rebuildSprites(size: number): void;
    public getShapes(): Physics2DShape[];
    public playerCollideCallback(player: Player): void;
    public isClimbableAtObjectPosition(collisionUtil: Physics2DCollisionUtils, shape: Physics2DShape): boolean;
    public getClimbableShape(): Physics2DShape;
    public getTopPosition(): number;
    public draw(draw2D: Draw2D, offset: number[]): void;
}
/**
* Created by martelly on 4/14/2014.
*/
declare class InpDevWrapper {
    public inputDev: InputDevice;
    public keys: any;
    public mouse: any;
    private mouseBody;
    private reverseMapping;
    private recentlyPressed;
    private recentlyReleased;
    private mouseDownListeners;
    private mouseUpListeners;
    constructor(inputDevice: InputDevice, physicsDevice: Physics2DDevice, collisionHelp: CollisionHelper);
    public addEventListener(eventType: String, shapeFunc: Function, callbackFunc: Function): void;
    public keyPressed(key: string): boolean;
    public justPressed(key: string): boolean;
    public justReleased(key: string): boolean;
    public mousePressed(): boolean;
    public mouseX(): number;
    public mouseY(): number;
    public mousePosition(): number[];
    public mouseJustPressed(): boolean;
    public mouseJustReleased(): boolean;
    public mouseShape(): Physics2DShape;
    public update(): void;
}
declare class Tool extends RigidSprite implements Interactable {
    static debugColorTool: number[];
    static debugColorBuildable: number[];
    public game: GameObject;
    public buildables: Buildable[];
    public toolYarnBall: ToolYarnBall;
    constructor(options: ToolOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): Tool;
    public getShapes(): Physics2DShape[];
    public playerCollideCallback(player: Player): void;
    public setToolYarnBall(toolYarnBall: ToolYarnBall): void;
    public draw(draw2D: Draw2D, offset: number[]): void;
}
declare class Spawn {
    public location: number[];
    constructor(location: number[]);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): any;
    public getLocation(): number[];
}
declare class Button extends RigidSprite {
    static debugColor: number[];
    public game: GameObject;
    constructor(options: RigidSpriteOptions, game: GameObject);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): Button;
    public draw(draw2D: Draw2D, offset: number[]): void;
    public clicked(): void;
}
declare class Music {
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): void;
}
declare class Spritesheet {
    public mapTexture: any;
    public margin: number;
    public spacing: number;
    public imageRows: number;
    public imageCols: number;
    public firstGID: number;
    public transparentColor: number;
}
declare class Tileset {
    static BASE_MAP_URL: string;
    public mapData: any;
    public mapWidth: number;
    public mapHeight: number;
    public tileWidth: number;
    public tileHeight: number;
    public spritesheets: Spritesheet[];
    public ranLoadMap: boolean;
    public buildables: any[];
    public toolYarnBalls: any[];
    public tools: any[];
    public game: GameObject;
    public rigidSprites: RigidSprite[];
    public slipperyMaterial: Physics2DMaterial;
    public mapLoadedCallback: (jsonData: any) => void;
    constructor(mapFilename: string, game: GameObject);
    public createTexture(url: string, i: number): void;
    public spritesheetForGID(gid: number): Spritesheet;
    public setTexture(rigidSprite: RigidSprite, spriteSheet: Spritesheet): void;
    public isLoaded(): boolean;
    public kill(): void;
    static isValidPhysicsObject(obj: any): boolean;
    public loadObjectLayer(layer: any): void;
    public loadTileLayer(layer: any): void;
    public loadMap(): number[];
    public draw(draw2D: Draw2D, offset: number[]): void;
    public getTileCoordinatesForIndex(tileGID: number, spriteSheet: Spritesheet): number[];
    public getScreenCoordinatesForIndex(tileIndex: number): number[];
}
declare class CheckpointManager {
    public allCheckpoints: Checkpoint[];
    public completedCheckpoints: Checkpoint[];
    public game: GameObject;
    constructor();
    public setGameObject(game: GameObject): void;
    public pushCheckpoint(check: Checkpoint): void;
    public completeCheckpoint(check: Checkpoint): void;
    public resetPosition(): number[];
    public removeAllCheckpoints(): void;
}
declare class Checkpoint implements Interactable {
    public body: Physics2DRigidBody;
    public completed: boolean;
    public name: String;
    public checkpointManager: CheckpointManager;
    public completedCallback: Function;
    constructor(options: CheckpointOptions);
    static constructFromTiled(obj: any, tileset: Tileset, game: GameObject): Checkpoint;
    public playerCollideCallback(player: Player): void;
    public getShapes(): Physics2DShape[];
}
declare class TurbGameState {
    public game: GameObject;
    constructor(game: GameObject);
    public update(): void;
    public clearWorld(): void;
}
interface InteractablesObject {
    buildables: Buildable[];
    climbables: Climbable[];
}
interface ProgressEntry {
    stateType: string;
    map: string;
    nextName: string;
}
interface GameObject {
    engine: TurbulenzEngine;
    mathDevice: MathDevice;
    graphicsDevice: GraphicsDevice;
    inputDevice: InputDevice;
    keyboard: InpDevWrapper;
    draw2D: Draw2D;
    physicsDevice: Physics2DDevice;
    physicsWorld: Physics2DWorld;
    collisionHelp: CollisionHelper;
    progression: Progression;
    checkpointManager: CheckpointManager;
    debugMode: boolean;
    nextState: TurbGameState;
    spawn?: Spawn;
    soundDevice: SoundDevice;
    bgMusicSource: SoundSource;
    sfxSource: SoundSource;
}
interface RigidSpriteOptions {
    sprite: Draw2DSprite;
    initialPos: number[];
    gid?: number;
    body?: Physics2DRigidBody;
}
interface ToolYarnBallOptions extends RigidSpriteOptions {
    maxDimension: number;
}
interface RectangleOptions extends RigidSpriteOptions {
    initSize: number;
    maxSize: number;
    minSize: number;
    width: number;
    height: number;
    rotation: number;
    isBuildable: boolean;
    isClimbable: boolean;
    isPullable: boolean;
    isSolid: boolean;
    bodyType?: string;
    growSurface?: string;
}
interface ToolOptions extends RigidSpriteOptions {
    buildable?: Buildable;
    toolYarnBall?: ToolYarnBall;
}
interface ChainOptions extends RigidSpriteOptions {
    initHeight?: number;
    maxHeight: number;
    minHeight: number;
    width: number;
    rotation: number;
    needleHeight: number;
}
interface knitCubeOptions extends RigidSpriteOptions {
    maxDimension: number;
    minDimension: number;
}
interface Interactable {
    playerCollideCallback(player: Player): void;
    getShapes(): Physics2DShape[];
}
interface Buildable {
    isBuildable: boolean;
    buildUp(): void;
    buildDown(): void;
    /**
    * This method should return a number between 0 and 1 indicating what percentage of
    * yarn has been used by this object.
    */
    ratioYarnUsed(): number;
}
interface Climbable {
    isClimbable: boolean;
    shape?: Physics2DShape;
    isClimbableAtObjectPosition(collisionUtil: Physics2DCollisionUtils, otherShape: Physics2DShape): boolean;
    getClimbableShape(): Physics2DShape;
    getTopPosition(): number;
}
declare class ClimbableDefault implements Climbable {
    public isClimbable: boolean;
    public shape: Physics2DShape;
    public isClimbableAtObjectPosition(collisionUtil: Physics2DCollisionUtils, otherShape: Physics2DShape): boolean;
    public getClimbableShape(): Physics2DShape;
    public getTopPosition(): number;
}
interface CheckpointOptions {
    body: Physics2DRigidBody;
    name: String;
    checkpointManager: CheckpointManager;
    completed?: boolean;
    completedCallback?: Function;
}
declare class Player {
    public SPEED: number;
    public JUMP_SPEED: number;
    public DIST_EPSILON: number;
    public CLIMB_SPEED: number;
    public THRESHOLD_STANDING_SPEED: number;
    public canClimb: boolean;
    public isClimbing: boolean;
    public climbableObject: Climbable;
    public canBuild: boolean;
    public rigidSprite: RigidSprite;
    public leftBlockingShape: Physics2DShape;
    public rightBlockingShape: Physics2DShape;
    public lastTouchedPullable: Rectangle;
    public onGround: boolean;
    public groundShape: Physics2DShape;
    public facing: Direction;
    public isPulling: boolean;
    public pulledObject: Rectangle;
    public standTexture: AnimatedTexture;
    public walkTexture: AnimatedTexture;
    public jumpTexture: AnimatedTexture;
    public climbTexture: AnimatedTexture;
    public pullTexture: AnimatedTexture;
    public currentTexture: AnimatedTexture;
    public frameDimensions: number[];
    public animationFrameDurationMS: number;
    public animationTimeout: number;
    public lastClimbPosition: number[];
    public playerDimensions: number[];
    public playerHitBox: number[][];
    public keys: any;
    public collisionUtil: Physics2DCollisionUtils;
    public mathDevice: MathDevice;
    public game: GameObject;
    public loadTextures(graphicsDevice: GraphicsDevice): void;
    constructor(game: GameObject, position: number[]);
    public setTexture(texture: any): void;
    public setCurrentTexture(texture: AnimatedTexture): void;
    public getTextureFrameCount(): number;
    public checkCollision: (arbiter: any, otherShape: any) => void;
    public collisionCallback(otherObject: any): void;
    public setTextureRectangle(params: any): void;
    public getPosition(): number[];
    public setPosition(pos: number[]): void;
    public stopWalking(): void;
    public pull(rect: Rectangle): void;
    public release(rect: Rectangle): void;
    public walkLeft(): void;
    public walkRight(): void;
    public goDown(): void;
    public goUp(): void;
    public jumpUp(): void;
    public stillOnGround(): boolean;
    public canMoveLeft(): boolean;
    public canMoveRight(): boolean;
    public flipFacing(): void;
    public climb(): void;
    public updateTexture(): void;
    public lastTouchedPullableDirection(): Direction;
    public tryToPull(): void;
    public update(): void;
    public draw(draw2D: Draw2D, offset: number[]): void;
}
declare module Mixins {
    function applyMixins(derivedCtor: any, baseCtors: any[]): void;
    function mixinExample(): void;
}
declare class MenuState extends TurbGameState {
    public game: GameObject;
    public returnState: TurbGameState;
    public tileset: Tileset;
    static bgColor: number[];
    constructor(game: GameObject, jsonMap: String, returnState?: TurbGameState);
    public update(): void;
}
/**
* Created by martelly on 4/28/2014.
*/
declare class HUD {
    static yarnWidth: number;
    static yarnHeight: number;
    static yarnSpacing: number;
    static greyedOutColor: number[];
    static collectedColor: number[];
    static TEXTURE_FILE: string;
    public texture: Texture;
    public textureRect: number[];
    private spritePositions;
    private sprites;
    private numOfYarnBalls;
    public game: GameObject;
    constructor(game: GameObject, yarnNumber?: number);
    public refreshSprites(): void;
    public draw(draw2D: Draw2D, offset: any): void;
}
declare class PlayState extends TurbGameState {
    public game: GameObject;
    public defaultTileSet: string;
    public tileset: Tileset;
    public player: Player;
    public hud: HUD;
    public physicsDebug: Physics2DDebugDraw;
    public mapSize: number[];
    constructor(game: GameObject, jsonMap?: string);
    public switchLevel(): void;
    public loadMapIfNecessary(): void;
    public checkOffset(offset: any): number[];
    public update(): void;
}
/**
* Created by martelly on 4/24/2014.
*/
/**
* Basically exactly the same as the menu state except that the button "A" advances
* the scene
*/
declare class CutsceneState extends TurbGameState {
    public game: GameObject;
    public tileset: Tileset;
    static bgColor: number[];
    constructor(game: GameObject, jsonMap: String);
    public update(): void;
}
declare class Progression {
    public game: GameObject;
    private entries;
    private collectedYarnBalls;
    public currentEntry: ProgressEntry;
    static BASE_MAP_URL: string;
    public jsonLoadedCallback: (jsonData: any) => void;
    constructor(engine: TurbulenzEngine, filename: string);
    public setGameObject(game: GameObject): void;
    public addYarnBall(): void;
    public totalYarnBalls(): number;
    public getNewCurrentState(): any;
    public getNextState(): any;
    public resetToStartState(): any;
}
declare function objectMask(isSolid: boolean): number;
declare var width: number;
declare var height: number;
declare var graphicsDevice: GraphicsDevice;
declare var inputDevice: InputDevice;
declare var physicsDevice: Physics2DDevice;
declare var physicsWorldParams: any;
declare var mathDevice: MathDevice;
declare var dynamicWorld: Physics2DWorld;
declare var collisionUtil: Physics2DCollisionUtils;
declare var collisionHelp: CollisionHelper;
declare var draw2D: Draw2D;
declare var success: boolean;
declare var soundDevice: SoundDevice;
declare var bgMusicSource: SoundSource;
declare var sfxSource: SoundSource;
declare var htmlControls: HTMLControls;
declare var game: GameObject;
declare var currentState: TurbGameState;
declare function update(): void;
declare function loadHtmlControls(): void;
