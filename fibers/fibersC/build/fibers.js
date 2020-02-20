/*
* Class: RigidSprite
*
* This class contains a sprite and a rigid body and deals with moving the sprite to display it where the rigid body is.
*
* TODO: Switch to a parameters object
*/
var RigidSprite = (function () {
    function RigidSprite(options) {
        this.sprite = null;
        this.body = null;
        this.sprite = options.sprite;
        this.initialPos = options.initialPos;
        this.sprite.x = options.initialPos[0];
        this.sprite.y = options.initialPos[1];
        this.gid = (options.gid ? options.gid : 0);
        this.isDead = false;

        if (options.body) {
            this.body = options.body;
            this.body.setPosition(options.initialPos);
        }
    }
    RigidSprite.prototype.getShapes = function () {
        return this.body.shapes;
    };

    RigidSprite.prototype.kill = function () {
        this.isDead = true;
    };

    RigidSprite.prototype.draw = function (draw2D, offset) {
        // update the sprite position if there is a rigid body. Otherwise, leave the sprite where it is
        if (this.body != null) {
            var pos = this.body.getPosition();
            this.sprite.x = pos[0];
            this.sprite.y = pos[1];
            this.sprite.rotation = this.body.getRotation();
        } else {
            this.sprite.x = this.initialPos[0];
            this.sprite.y = this.initialPos[1];
        }

        this.sprite.x -= offset[0];
        this.sprite.y -= offset[1];

        // and draw it to the screen
        draw2D.drawSprite(this.sprite);
    };
    return RigidSprite;
})();
/**
* This class is meant to accept arrays of objects with associated shapes.
*/
/// <reference path="interfaces.ts"/>
/// <reference path="player.ts"/>
var CollisionHelper = (function () {
    function CollisionHelper(physicsDevice) {
        this.player = null;
        this.collisionUtils = physicsDevice.createCollisionUtils();
        this.interactables = [];
        this.checkpoints = [];
    }
    CollisionHelper.prototype.setPlayer = function (player) {
        this.player = player;
    };

    CollisionHelper.prototype.pushInteractable = function (object) {
        this.interactables.push(object);
    };

    CollisionHelper.prototype.removeAllInteractables = function () {
        this.interactables = [];
    };

    CollisionHelper.prototype.pushCheckpoint = function (check) {
        this.checkpoints.push(check);
    };

    CollisionHelper.prototype.removeAllCheckpoints = function () {
        this.checkpoints = [];
    };

    /**
    * Should be run every time step in the main loop
    */
    CollisionHelper.prototype.checkCollision = function () {
        // check collisions with player
        if (this.player == null) {
            console.log("Player has not been set in CollisionHelper yet");
        }

        for (var i = 0; i < this.interactables.length; i++) {
            var current = this.interactables[i];
            var playerShape = this.player.rigidSprite.body.shapes[0];
            var otherShapes = current.getShapes();
            for (var j = 0; j < otherShapes.length; j++) {
                var otherShape = otherShapes[j];
                if (this.collisionUtils.intersects(playerShape, otherShape)) {
                    current.playerCollideCallback(this.player);
                    this.player.collisionCallback(current);
                    break;
                }
            }
        }

        for (var i = 0; i < this.checkpoints.length; i++) {
            var current = this.checkpoints[i];
            var playerShape = this.player.rigidSprite.body.shapes[0];
            var otherShapes = current.getShapes();
            for (var j = 0; j < otherShapes.length; j++) {
                var otherShape = otherShapes[j];
                if (this.collisionUtils.intersects(playerShape, otherShape)) {
                    current.playerCollideCallback(this.player);
                    this.player.collisionCallback(current);
                    break;
                }
            }
        }
    };
    return CollisionHelper;
})();
/**
* Created by martelly on 4/1/2014.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
var Platform = (function (_super) {
    __extends(Platform, _super);
    function Platform(options, game) {
        _super.call(this, options);
        this.game = null;
        this.game = game;
    }
    Platform.constructFromTiled = function (obj, tileset, game) {
        if (!(obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width") && obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties"))) {
            console.log("failed to make platform due to missing propertie/s");
            return;
        }

        var phys2D = game.physicsDevice;
        var world = game.physicsWorld;
        var platformMaterial = phys2D.createMaterial({
            elasticity: 0,
            staticFriction: 0.05,
            dynamicFriction: 0.2
        });

        var vertices = [[0, 0], [obj.width, 0], [obj.width, obj.height], [0, obj.height]];

        var shapes = [
            phys2D.createPolygonShape({
                vertices: vertices,
                material: platformMaterial,
                group: 8 /* COLLIDABLES */,
                mask: 13 /* SOLID */
            })
        ];
        var body = phys2D.createRigidBody({
            type: 'static',
            shapes: shapes,
            position: [obj.x, obj.y]
        });
        world.addRigidBody(body);

        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            x: obj.x,
            y: obj.y,
            origin: [0, 0],
            color: Platform.debugColor
        });

        var rigidSpriteParams = {
            sprite: sprite,
            initialPos: [sprite.x, sprite.y],
            body: body
        };

        return new Platform(rigidSpriteParams, game);
    };

    Platform.prototype.draw = function (draw2D, offset) {
        if (this.game.debugMode) {
            this.sprite.setColor(Platform.debugColor);
        } else {
            this.sprite.setColor([0, 0, 0, 0]);
        }
        _super.prototype.draw.call(this, draw2D, offset);
    };
    Platform.debugColor = [0.3, .3, 1.0, 1.0];
    return Platform;
})(RigidSprite);
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="player.ts"/>
var KnitCube = (function (_super) {
    __extends(KnitCube, _super);
    function KnitCube(options, game) {
        _super.call(this, options);
        this.game = null;
        this.GROW_SPEED = 2;
        this.isBuildable = true;
        this.game = game;

        this.maxDimension = options.maxDimension;
        this.minDimension = options.minDimension;
        this.currentDimension = 0;

        // for the cube that will be knitted
        var vertices = [[0, 0], [10, 0], [10, 10], [0, 10]];
        var shape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            group: 2 /* TOOLS */,
            mask: 13 /* SOLID */
        });
        var body = game.physicsDevice.createRigidBody({
            type: "kinematic",
            shapes: [shape],
            mass: 10
        });
        var sprite = Draw2DSprite.create({
            width: this.maxDimension,
            height: 1,
            origin: [this.maxDimension / 2, this.maxDimension / 2],
            color: KnitCube.debugColorConstruct
        });

        this.construct = new RigidSprite({
            sprite: sprite,
            initialPos: options.initialPos,
            body: body
        });
    }
    KnitCube.constructFromTiled = function (obj, tileset, game) {
        var vertices = [[0, 0], [obj.width, 0], [obj.width, obj.height], [0, obj.height]];

        var shapes = [
            game.physicsDevice.createPolygonShape({
                vertices: vertices,
                group: 2 /* TOOLS */,
                mask: 13 /* SOLID */
            })
        ];
        var body = game.physicsDevice.createRigidBody({
            type: 'static',
            shapes: shapes,
            position: [obj.x, obj.y]
        });
        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            x: obj.x,
            y: obj.y,
            origin: [0, 0],
            color: KnitCube.debugColorCube
        });

        game.physicsWorld.addRigidBody(body);

        var params = {
            sprite: sprite,
            initialPos: [sprite.x, sprite.y],
            body: body,
            maxDimension: obj.properties.maxDimension,
            minDimension: obj.properties.minDimension
        };
        var kc = new KnitCube(params, game);
        game.collisionHelp.pushInteractable(kc);
        return kc;
    };

    KnitCube.prototype.ratioYarnUsed = function () {
        return this.currentDimension / this.maxDimension;
    };

    KnitCube.prototype.buildUp = function () {
        if (this.currentDimension + this.GROW_SPEED < this.maxDimension) {
            this.currentDimension += this.GROW_SPEED;
            this.remakeConstruct();
        }
    };

    KnitCube.prototype.buildDown = function () {
        if (this.currentDimension - this.GROW_SPEED > this.minDimension) {
            this.currentDimension -= this.GROW_SPEED;
            this.remakeConstruct();
        }
    };

    KnitCube.prototype.getBuildableShape = function () {
        return this.body.shapes[0];
    };

    KnitCube.prototype.remakeConstruct = function () {
        if (this.currentDimension > 0) {
            this.construct.sprite.setHeight(this.currentDimension);
            this.construct.sprite.setWidth(this.currentDimension);
        }
    };

    KnitCube.prototype.playerCollideCallback = function (player) {
        console.log("knit cube intersecting with player");
    };

    KnitCube.prototype.getShapes = function () {
        return [this.body.shapes[0]];
    };

    KnitCube.prototype.draw = function (draw2D, offset) {
        // should only do this once when toggling. Not on every draw :(
        if (this.game.debugMode) {
            this.sprite.setColor(KnitCube.debugColorCube);
            this.construct.sprite.setColor(KnitCube.debugColorConstruct);
        } else {
            this.sprite.setColor([0, 0, 0, 0]);
            this.construct.sprite.setColor([0, 0, 0, 0]);
        }

        this.construct.draw(draw2D, offset);
        _super.prototype.draw.call(this, draw2D, offset);
    };
    KnitCube.debugColorConstruct = [.1, .5, .1, 1.0];
    KnitCube.debugColorCube = [1.0, 1.0, 1.0, 1.0];
    return KnitCube;
})(RigidSprite);
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/*
* Class: Chain
* The chain class implements a column of knitted material that can be knit up or down.
*/
var Chain = (function (_super) {
    __extends(Chain, _super);
    function Chain(options, game) {
        _super.call(this, options);
        this.GROW_SPEED = 2;
        this.isBuildable = true;
        this.isClimbable = true;
        this.game = game;
        this.maxHeight = options.maxHeight;
        this.minHeight = options.minHeight;
        this.width = options.width;
        this.currentHeight = options.initHeight;
        this.needleHeight = options.needleHeight;

        // correct the initial position of the chain to match the bottom of the needles instead of the middle
        var chainPos = [options.initialPos[0], options.initialPos[1] + this.needleHeight / 2];

        // the rigidSprite displayed is the knitting needles
        // in addition to the knitting needles, we need the thing you are climbing
        this.material = game.physicsDevice.createMaterial({
            elasticity: 0,
            staticFriction: 0,
            dynamicFriction: 0
        });
        var vertices = this.game.physicsDevice.createRectangleVertices(-this.width / 2, 0, this.width / 2, this.currentHeight);
        var shape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: this.material,
            group: 4 /* OVERLAPPABLES */,
            mask: 0 /* EMPTY */
        });
        var body = game.physicsDevice.createRigidBody({
            type: "kinematic",
            shapes: [shape],
            mass: 10
        });
        var sprite = Draw2DSprite.create({
            width: this.width,
            height: (options.initHeight ? options.initHeight : 1),
            origin: [this.width / 2, 0],
            color: Chain.debugColorConstruct
        });

        // add the body to the world
        game.physicsWorld.addRigidBody(body);

        this.construct = new RigidSprite({
            sprite: sprite,
            initialPos: chainPos,
            body: body
        });

        // set rotations
        this.body.setPosition(options.initialPos);
        this.construct.body.setRotation(options.rotation);
        this.rotation = options.rotation;
    }
    Chain.constructFromTiled = function (obj, tileset, game) {
        var material = game.physicsDevice.createMaterial({
            elasticity: 0,
            staticFriction: 0,
            dynamicFriction: 0
        });
        var shape = game.physicsDevice.createPolygonShape({
            vertices: game.physicsDevice.createBoxVertices(obj.width, obj.height),
            material: material,
            group: 2,
            mask: 0
        });
        var body = game.physicsDevice.createRigidBody({
            type: 'kinematic',
            shapes: [shape],
            position: [obj.x + obj.width / 2, obj.y + obj.height / 2]
        });
        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            color: Chain.debugColorChain
        });
        game.physicsWorld.addRigidBody(body);
        var rigidSprite = new RigidSprite({
            sprite: sprite,
            initialPos: [sprite.x, sprite.y],
            gid: obj.gid,
            body: body
        });
        var options = {
            sprite: sprite,
            initialPos: [obj.x + obj.width / 2, obj.y + obj.height / 2],
            body: body,
            maxHeight: parseInt(obj.properties.maxHeight),
            initHeight: parseInt(obj.properties.initHeight),
            minHeight: parseInt(obj.properties.minHeight),
            width: obj.properties.width,
            rotation: obj.properties.rotation,
            needleHeight: obj.height
        };
        var newChain = new Chain(options, game);
        game.collisionHelp.pushInteractable(newChain);
        return newChain;
    };

    /*
    * Method: getBuildableShape
    * Returns the shape that the player must be intersecting with in order for them to use its build functionality.
    */
    Chain.prototype.getBuildableShape = function () {
        return this.body.shapes[0];
    };

    /*
    * Method: buildUp
    * Extends the chain upward if it can be extended any more. This is called from the key handlers.
    */
    Chain.prototype.buildUp = function () {
        // first check that we are below our maximum size
        if (this.currentHeight < this.maxHeight) {
            // if so, find the next height that we should grow to, limiting by the maximum height
            var nextHeight = this.currentHeight + this.GROW_SPEED;
            if (nextHeight > this.maxHeight) {
                nextHeight = this.maxHeight;
            }
            this.currentHeight = nextHeight;

            // build a new shape that is the correct size and replace the old shape with this new one
            var vertices = this.game.physicsDevice.createRectangleVertices(-this.width / 2, 0, this.width / 2, this.currentHeight);
            var shape = this.game.physicsDevice.createPolygonShape({
                vertices: vertices,
                material: this.material,
                group: 4 /* OVERLAPPABLES */,
                mask: 0 /* EMPTY */
            });
            this.construct.body.removeShape(this.construct.body.shapes[0]);
            this.construct.body.addShape(shape);
        }
    };

    /*
    * Method: buildDown
    * Shrinks the chain if it can be shrunk any more. This is called from the key handlers.
    */
    Chain.prototype.buildDown = function () {
        // first check that we are above our minimum size
        if (this.currentHeight > this.minHeight) {
            // if so, find the next height that we should shrink to, limiting by the minimum height
            var nextHeight = this.currentHeight - this.GROW_SPEED;
            if (nextHeight < this.minHeight) {
                nextHeight = this.minHeight;
            }
            this.currentHeight = nextHeight;

            // build a new shape that is the correct size and replace the old shape with this new one
            var vertices = this.game.physicsDevice.createRectangleVertices(-this.width / 2, 0, this.width / 2, this.currentHeight);
            var shape = this.game.physicsDevice.createPolygonShape({
                vertices: vertices,
                material: this.material,
                group: 4 /* OVERLAPPABLES */,
                mask: 0 /* EMPTY */
            });
            this.construct.body.removeShape(this.construct.body.shapes[0]);
            this.construct.body.addShape(shape);
        }
    };

    Chain.prototype.ratioYarnUsed = function () {
        return this.currentHeight / this.maxHeight;
    };

    Chain.prototype.isClimbableAtObjectPosition = function (collisionUtil, shape) {
        return collisionUtil.intersects(this.getClimbableShape(), shape);
    };

    Chain.prototype.getClimbableShape = function () {
        return this.construct.body.shapes[0];
    };

    Chain.prototype.getTopPosition = function () {
        return this.body.getPosition()[1] - this.currentHeight;
    };

    /*
    * Method: getShape
    * Returns the shape that the player must be overlapping with in order to build this item. ie the knitting needles.
    */
    Chain.prototype.getShapes = function () {
        return [this.body.shapes[0], this.construct.body.shapes[0]];
    };

    Chain.prototype.playerCollideCallback = function (player) {
        // check to see if the player is overlapping the right object
        if (this.game.collisionHelp.collisionUtils.containsPoint(this.getBuildableShape(), player.getPosition())) {
            // handle key presses
            if (this.game.keyboard.keyPressed("E") && this.game.keyboard.keyPressed("UP")) {
                this.buildUp();
            } else if (this.game.keyboard.keyPressed("E") && this.game.keyboard.keyPressed("DOWN")) {
                this.buildDown();
            }
        }
    };

    Chain.prototype.draw = function (draw2D, offset) {
        if (this.game.debugMode) {
            this.sprite.setColor(Chain.debugColorChain);
            this.construct.sprite.setColor(Chain.debugColorConstruct);
        } else {
            this.sprite.setColor([0, 0, 0, 0]);
            this.construct.sprite.setColor([0, 0, 0, 0]);
        }

        _super.prototype.draw.call(this, draw2D, offset);
        var position = this.body.getPosition();

        // offset the position y so that it starts at the bottom of the knitting needles, not the middle
        position[1] += this.needleHeight / 2;
        if (this.currentHeight > 0) {
            this.construct.sprite.setHeight(this.currentHeight);
            this.construct.sprite.setWidth(this.width);

            this.construct.body.setPosition(position);
            this.construct.sprite.x = position[0] - offset[0];
            this.construct.sprite.y = position[1] - offset[1];
            this.construct.sprite.rotation = this.rotation;

            // / and draw it to the screen
            draw2D.drawSprite(this.construct.sprite);
        }
    };
    Chain.debugColorChain = [1.0, 0.0, 0.0, 1.0];
    Chain.debugColorConstruct = [1.0, 1.0, 1.0, 1.0];
    return Chain;
})(RigidSprite);
/**
* Created by martelly on 4/23/2014.
*/
/**
* A yarn ball sprite that is meant to indicate how much yarn a tool has been used.
* The tool class should set the associated buildable for the yarn ball. Then the
* yarn ball can grow it's size accordingly.
*/
var ToolYarnBall = (function (_super) {
    __extends(ToolYarnBall, _super);
    function ToolYarnBall(options, game) {
        var _this = this;
        _super.call(this, options);
        this.game = game;
        this.maxDimension = options.maxDimension;
        var that = this;
        this.game.graphicsDevice.createTexture({
            src: ToolYarnBall.TEXTURE_FILE,
            mipmaps: true,
            onload: function (texture) {
                if (texture) {
                    console.log("I loaded the asset!");
                    var textureRect = [0, 0, 64, 64];
                    _this.texture = texture;
                    _this.sprite.setTextureRectangle(textureRect);
                    _this.sprite.setTexture(texture);
                } else {
                    console.log("Failed to load tool yarn ball asset");
                }
            }
        });
    }
    ToolYarnBall.constructFromTiled = function (obj, tileset, game) {
        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height
        });

        var options = {
            sprite: sprite,
            initialPos: [obj.x + obj.width / 2, obj.y + obj.height / 2],
            maxDimension: obj.width
        };

        var newTYB = new ToolYarnBall(options, game);
        return newTYB;
    };

    ToolYarnBall.prototype.setBuildable = function (buildable) {
        if (buildable == null) {
            console.log("Just set buildable for ToolYarnBall to null");
        }
        this.buildable = buildable;
    };

    ToolYarnBall.prototype.draw = function (draw2d, offset) {
        if (this.buildable != null) {
            var size = (1 - this.buildable.ratioYarnUsed()) * this.maxDimension;
            this.sprite.setWidth(size + 1); // for some reason adding the one makes it work
            this.sprite.setHeight(size + 1);
        }
        _super.prototype.draw.call(this, draw2d, offset);
    };
    ToolYarnBall.debugColor = [0., 0., 0., 1.0];
    ToolYarnBall.TEXTURE_FILE = "assets/yarnBall.png";
    return ToolYarnBall;
})(RigidSprite);
// group bits
// player = 1
// knitting needles & other things the player should not run into = 2
// climbable things and other things the player can overlap but still interact with = 4
// things that collide normally = 8
//
// Masks
// Knitting needles mask = 0 - they interact with nothing
// Player mask = 13 - interacts with everything but needles
// Climbable mask = 13
// Other mask = 13
var ShapeGroups;
(function (ShapeGroups) {
    ShapeGroups[ShapeGroups["PLAYER"] = 1] = "PLAYER";
    ShapeGroups[ShapeGroups["TOOLS"] = 2] = "TOOLS";
    ShapeGroups[ShapeGroups["OVERLAPPABLES"] = 4] = "OVERLAPPABLES";
    ShapeGroups[ShapeGroups["COLLIDABLES"] = 8] = "COLLIDABLES";
})(ShapeGroups || (ShapeGroups = {}));

var ObjectMasks;
(function (ObjectMasks) {
    ObjectMasks[ObjectMasks["SOLID"] = 13] = "SOLID";
    ObjectMasks[ObjectMasks["EMPTY"] = 0] = "EMPTY";
    ObjectMasks[ObjectMasks["PLAYEREMPTY"] = 12] = "PLAYEREMPTY";
})(ObjectMasks || (ObjectMasks = {}));
/// <reference path="jslib-modular/turbulenz.d.ts" />
var Direction;
(function (Direction) {
    Direction[Direction["LEFT"] = 0] = "LEFT";
    Direction[Direction["RIGHT"] = 1] = "RIGHT";
})(Direction || (Direction = {}));

var AnimatedTexture = (function () {
    function AnimatedTexture(textureFile, frameDimensions, frameCount, isLooping, noAutoreset) {
        this.textureFile = textureFile;
        this.frameDimensions = frameDimensions;
        this.frameCount = frameCount;
        this.isLooping = isLooping;
        this.noAutoreset = noAutoreset;
        this.currentFrame = 0;
        this.didLoop = false;
        this.isReversed = false;
        this.isPaused = false;
        this.loopCallback = null;
        this.keyframes = null;
    }
    AnimatedTexture.prototype.loadTexture = function (graphicsDevice, callback) {
        var _this = this;
        graphicsDevice.createTexture({
            src: this.textureFile,
            mipmaps: true,
            onload: function (texture) {
                if (texture != null) {
                    _this.texture = texture;
                    if (callback) {
                        callback(texture);
                    }
                }
            }
        });
    };

    // handles keyframes in addition to standard setup
    AnimatedTexture.prototype.getFrameCount = function () {
        return this.keyframes ? this.keyframes.length : this.frameCount;
    };

    AnimatedTexture.prototype.setNoAutoreset = function (noAutoreset) {
        this.noAutoreset = noAutoreset;
    };

    AnimatedTexture.prototype.setTexture = function (n) {
        this.currentFrame = n % this.getFrameCount();
    };

    AnimatedTexture.prototype.reverse = function () {
        this.isReversed = !this.isReversed;
        this.resetLoop();
    };

    AnimatedTexture.prototype.pause = function () {
        this.isPaused = true;
    };

    AnimatedTexture.prototype.play = function () {
        this.isPaused = false;
    };
    AnimatedTexture.prototype.setReverse = function (isReversed) {
        this.isReversed = isReversed;
        this.resetLoop();
    };

    AnimatedTexture.prototype.setLoopCallback = function (callback) {
        this.loopCallback = callback;
    };

    AnimatedTexture.prototype.updateCurrentFrame = function () {
        var frameCount = this.getFrameCount();
        var finalFrame = this.isReversed ? 0 : (frameCount - 1);
        var firstFrame = this.isReversed ? (frameCount - 1) : 0;

        if (!this.isPaused) {
            if (this.didLoop && this.isLooping == false) {
                this.currentFrame = finalFrame;

                // call callback, if any
                if (this.loopCallback) {
                    this.loopCallback();
                }
            } else {
                this.currentFrame = this.isReversed ? (this.currentFrame - 1) : (this.currentFrame + 1) % frameCount;

                if (this.isReversed && this.currentFrame < 0) {
                    this.currentFrame = frameCount - 1;
                }
                if (this.currentFrame == finalFrame) {
                    this.didLoop = true;
                }
            }
        }
    };

    AnimatedTexture.prototype.resetLoop = function () {
        this.currentFrame = this.isReversed ? (this.getFrameCount() - 1) : 0;
        this.didLoop = false;
    };

    /*
    Return the texture rectangle for the current animation frame
    */
    AnimatedTexture.prototype.currentFrameRectangle = function (facing) {
        var trueCurrentFrame = this.keyframes ? this.keyframes[this.currentFrame] : this.currentFrame;
        var textureX = this.frameDimensions[0] * trueCurrentFrame;
        var textureY = 0;
        var textureWidth = this.frameDimensions[0];
        var textureHeight = this.frameDimensions[1];
        var textureRight = textureX + textureWidth;
        var textureBottom = textureY + textureHeight;

        if (facing == 0 /* LEFT */) {
            return [textureRight, textureY, textureX, textureBottom];
        } else {
            return [textureX, textureY, textureRight, textureBottom];
        }
    };
    return AnimatedTexture;
})();
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="masks.ts"/>
/// <reference path="animatedTexture.ts"/>
/*
* Class: Rectangle
* This class implements an arbitrary rectangle in the game that can be imbued with a variety of properties.
* By default it is a static object in the world. On construction one can specify it to be a kinematic or
* dynamic object, buildable, and/or climbable. Further, this object can be associated with a pair of knitting
* needles to allow for the player to build it up or down.
*
* TODO: check for intersection before growing a shape
*/
var Rectangle = (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(options, game) {
        var _this = this;
        _super.call(this, options);
        this.growSurface = "top";
        this.lastBuildTime = 0;
        this.isInWorld = false;
        // sprite related variables
        this.texture = null;
        this.animatedTexture = null;
        this.textureLoaded = false;
        this.animatedTextureLoaded = false;
        this.animating = false;
        this.afterAnimatingSize = 0;
        //dragging
        this.isBeingPulled = false;
        this.isPullable = false;
        this.sprites = [];

        // grow surface selection
        this.growSurface = options.growSurface;
        if (this.growSurface != "top" && this.growSurface != "bottom" && this.growSurface != "left" && this.growSurface != "right") {
            this.growSurface = "top";
        }

        if (options.isClimbable) {
            this.buildDelay = Rectangle.BUILD_DELAY_CLIMBABLE;
            this.numberOfFrames = Rectangle.NUMBER_OF_FRAMES_CLIMBABLE;
            this.heightInterval = Rectangle.HEIGHT_INTERVAL_CLIMBABLE;
            this.widthInterval = Rectangle.WIDTH_INTERVAL_CLIMBABLE;
            this.heightBuffer = Rectangle.HEIGHT_BUFFER_CLIMBABLE;
            this.widthBuffer = Rectangle.WIDTH_BUFFER_CLIMBABLE;
            this.textureFile = Rectangle.TEXTURE_FILE_CLIMBABLE;
            this.finalTextureRectangle = Rectangle.FINAL_TEXTURE_RECTANGLE_CLIMBABLE;
        } else if (!options.isBuildable) {
            this.buildDelay = Rectangle.BUILD_DELAY_CUBE;
            this.numberOfFrames = Rectangle.NUMBER_OF_FRAMES_CUBE;
            this.heightInterval = Rectangle.HEIGHT_INTERVAL_CUBE;
            this.widthInterval = Rectangle.WIDTH_INTERVAL_CUBE;
            this.heightBuffer = Rectangle.HEIGHT_BUFFER_CUBE;
            this.widthBuffer = Rectangle.WIDTH_BUFFER_CUBE;
            this.textureFile = Rectangle.TEXTURE_FILE_CUBE;
            this.finalTextureRectangle = Rectangle.FINAL_TEXTURE_RECTANGLE_CUBE;
        } else {
            this.buildDelay = Rectangle.BUILD_DELAY_NONCLIMBABLE;
            this.numberOfFrames = Rectangle.NUMBER_OF_FRAMES_NONCLIMBABLE;
            this.heightInterval = Rectangle.HEIGHT_INTERVAL_NONCLIMBABLE;
            this.widthInterval = Rectangle.WIDTH_INTERVAL_NONCLIMBABLE;
            this.heightBuffer = Rectangle.HEIGHT_BUFFER_NONCLIMBABLE;
            this.widthBuffer = Rectangle.WIDTH_BUFFER_NONCLIMBABLE;
            this.textureFile = Rectangle.TEXTURE_FILE_NONCLIMBABLE;
            this.finalTextureRectangle = Rectangle.FINAL_TEXTURE_RECTANGLE_NONCLIMBABLE;
        }

        // limit the size to the shapes we can handle and convert from pixel units to sprite-size units
        options.maxSize = Math.ceil(options.maxSize / (this.heightInterval - this.heightBuffer));
        options.minSize = Math.ceil(options.minSize / (this.heightInterval - this.heightBuffer));
        options.initSize = Math.ceil(options.initSize / (this.heightInterval - this.heightBuffer));
        if (this.growSurface == "top" || this.growSurface == "bottom") {
            // in this case height interval really does map to height
            options.width = Math.ceil(options.width / (this.widthInterval - this.widthBuffer));
            options.height = Math.ceil(options.height / (this.heightInterval - this.heightBuffer));
        } else if (this.growSurface == "left" || this.growSurface == "right") {
            // in this case the height interval actually maps to width because of sprite rotations later on
            options.width = Math.ceil(options.width / (this.heightInterval - this.heightBuffer));
            options.height = Math.ceil(options.height / (this.widthInterval - this.widthBuffer));
        }

        this.isPullable = options.isPullable;

        this.game = game;

        this.maxSize = options.maxSize;
        this.minSize = options.minSize;
        this.currentSize = options.initSize;

        this.width = options.width;
        this.height = options.height;

        this.rotation = options.rotation;

        this.isBuildable = options.isBuildable;
        this.isClimbable = options.isClimbable;
        this.isSolid = options.isSolid;

        this.mask = options.isSolid ? (options.isClimbable ? 12 /* PLAYEREMPTY */ : 13 /* SOLID */) : 0 /* EMPTY */;

        // whenever the height is 0, this should not be interactable
        // if the height is greater than 0 it should
        if (this.currentSize == 0) {
            this.isInWorld = false;
            this.game.physicsWorld.removeRigidBody(this.body);
        } else {
            this.isInWorld = true;
        }

        this.buildShape(this.currentSize);

        this.shape = this.body.shapes[0];
        this.material = this.shape.getMaterial();
        this.body.setPosition(options.initialPos);
        this.body.setRotation(options.rotation);

        // load textures based on climbable or not climbable
        var that = this;
        this.animatedTexture = new AnimatedTexture(this.textureFile, [this.widthInterval, this.heightInterval], this.numberOfFrames, false, true);
        this.animatedTexture.loadTexture(this.game.graphicsDevice, function (texture) {
            if (texture) {
                that.topLoaded = true;
                that.texture = texture;
            }
        });

        // prepare the animation timeout
        this.animationTimeout = window.setInterval(function () {
            if (_this.animatedTexture) {
                _this.animatedTexture.updateCurrentFrame();
            }
        }, this.buildDelay / this.numberOfFrames);

        // prepare a loop callback for the end of the top animation
        this.animatedTexture.setLoopCallback(function () {
            // if we're waiting for the animation to end, when it does end set the size again
            if (_this.animating && _this.animatedTexture.isReversed) {
                _this.currentSize = _this.afterAnimatingSize;
                _this.buildShape(_this.currentSize);
            }
            _this.animating = false;
        });
    }
    Rectangle.constructFromTiled = function (obj, tileset, game) {
        // In turbulenz, rotation of 0 = down. We want 0 to be up, so we add PI!
        var gid = parseInt(obj.gid);
        var rotation = obj.properties.hasOwnProperty("rotation") ? ((parseFloat(obj.properties.rotation) * (Math.PI / 180)) + Math.PI) : Math.PI;
        var initSize = obj.properties.hasOwnProperty("initHeight") ? (parseFloat(obj.properties.initHeight) * tileset.tileHeight) : obj.height;
        var maxSize = obj.properties.hasOwnProperty("maxHeight") ? (parseFloat(obj.properties.maxHeight) * tileset.tileHeight) : obj.height;
        var minSize = obj.properties.hasOwnProperty("minHeight") ? (parseFloat(obj.properties.minHeight) * tileset.tileHeight) : obj.width;

        // limit the size to the shapes we can handle and convert from pixel units to sprite-size units
        //var effectiveWidth =
        //var effectiveHeight =
        //options.width = Math.ceil(options.width / (this.widthInterval - this.widthBuffer));
        //options.height = Math.ceil(options.height / (this.heightInterval - this.heightBuffer));
        var initialPos = [obj.x + obj.width / 2, obj.y + initSize];
        var mass = (obj.properties.mass ? parseFloat(obj.properties.mass) : 10);
        var isSolid = (obj.properties.isSolid == "true");
        var isBuildable = (obj.properties.isBuildable == "true");
        var isClimbable = (obj.properties.isClimbable == "true");
        var isPullable = (obj.properties.isPullable == "true");
        var growSurface = (obj.properties.hasOwnProperty("growSurface")) ? obj.properties.growSurface : "top";
        var mask = isSolid ? (isClimbable ? 12 /* PLAYEREMPTY */ : 13 /* SOLID */) : 0 /* EMPTY */;

        var material = game.physicsDevice.createMaterial({
            elasticity: 0,
            staticFriction: 0.3,
            dynamicFriction: 0.2
        });

        var vertices = game.physicsDevice.createRectangleVertices(-obj.width / 2, 0, obj.width / 2, 1);
        var shape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: material,
            group: 4 /* OVERLAPPABLES */,
            mask: mask
        });
        var body = game.physicsDevice.createRigidBody({
            type: (obj.properties.bodyType ? obj.properties.bodyType : "kinematic"),
            shapes: [shape],
            mass: mass,
            linearDrag: 0
        });
        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: initSize == 0 ? initSize + 1 : initSize,
            origin: [obj.width / 2, 0],
            color: Rectangle.debugColorClimbable
        });

        // add the body to the world
        game.physicsWorld.addRigidBody(body);

        var rectOptions = {
            sprite: sprite,
            initialPos: initialPos,
            gid: gid,
            body: body,
            initSize: initSize,
            height: obj.height,
            maxSize: maxSize,
            minSize: minSize,
            width: obj.width,
            rotation: rotation,
            isBuildable: isBuildable,
            isClimbable: isClimbable,
            isSolid: isSolid,
            isPullable: isPullable,
            bodyType: obj.properties.bodyType,
            growSurface: growSurface
        };

        var newRectangle = new Rectangle(rectOptions, game);
        game.collisionHelp.pushInteractable(newRectangle);

        return newRectangle;
    };

    /*
    * Method: buildUp
    * Extends the chain upward if it can be extended any more. This is called from the key handlers.
    */
    Rectangle.prototype.buildUp = function () {
        // first check that we are below our maximum size and that there has been a delay since the last build
        var time = new Date().getTime();
        if (this.currentSize < this.maxSize && time > this.lastBuildTime + this.buildDelay && !this.isDead) {
            // set up the animation
            this.animatedTexture.setReverse(false);
            this.animating = true;

            // if so, find the next height that we should grow to, limiting by the maximum height
            var nextSize = this.currentSize + 1;
            if (nextSize > this.maxSize) {
                nextSize = this.maxSize;
            }

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var appeared = this.currentSize == 0 && nextSize > 0;
            if (appeared) {
                this.isInWorld = true;
                this.game.physicsWorld.addRigidBody(this.body);
            }

            this.buildShape(nextSize);

            // store the build time
            this.lastBuildTime = time;
        }
    };

    /*
    * Method: buildDown
    * Shrinks the chain if it can be shrunk any more. This is called from the key handlers.
    */
    Rectangle.prototype.buildDown = function () {
        // first check that we are above our minimum size and there has been a delay since the last build
        var time = new Date().getTime();
        if (this.currentSize > this.minSize && time > this.lastBuildTime + this.buildDelay && !this.isDead) {
            // set up the animation
            this.animatedTexture.setReverse(true);
            this.animating = true;

            // if so, find the next height that we should shrink to, limiting by the minimum height
            var nextSize = this.currentSize - 1;
            if (nextSize < this.minSize) {
                nextSize = this.minSize;
            }

            this.afterAnimatingSize = nextSize;

            //this.currentSize = nextSize;
            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var disappeared = this.currentSize > 0 && nextSize == 0;
            if (disappeared) {
                this.isInWorld = false;
                this.game.physicsWorld.removeRigidBody(this.body);
            }

            // store the build time
            this.lastBuildTime = time;
        }
    };

    Rectangle.prototype.ratioYarnUsed = function () {
        return this.currentSize / this.maxSize;
    };

    /*
    * Method: buildShape
    * Builds a new shape that is the size specified and replaces the old body shape with the new one.
    */
    Rectangle.prototype.buildShape = function (size) {
        // build a new shape that is the correct size and replace the old shape with this new one
        this.currentSize = size;
        var pixelSize = size * (this.heightInterval - this.heightBuffer);
        if (pixelSize == 0) {
            pixelSize++;
        }
        var pixelWidth = this.width * (this.widthInterval - this.widthBuffer);
        var pixelHeight = this.height * (this.heightInterval - this.heightBuffer);
        var left = 0;
        var right = 0;
        var top = 0;
        var bottom = 0;
        var origin = [];

        switch (this.growSurface) {
            case "top":
                left = -pixelWidth / 2;
                right = pixelWidth / 2;
                top = pixelSize;
                bottom = 0;
                origin = [pixelWidth / 2, 0];
                break;
            case "left":
                left = -pixelWidth / 2;
                right = -pixelWidth / 2 + pixelSize;
                top = pixelHeight;
                bottom = 0;
                origin = [(pixelWidth / 2), 0];
                break;
            case "bottom":
                left = -pixelWidth / 2;
                right = pixelWidth / 2;
                top = pixelHeight;
                bottom = -pixelSize + pixelHeight;
                origin = [pixelWidth / 2, pixelSize - pixelHeight];
                break;
            case "right":
                left = pixelWidth / 2 - pixelSize;
                right = pixelWidth / 2;
                top = pixelHeight;
                bottom = 0;
                origin = [pixelSize - (pixelWidth / 2), 0];
                break;
        }

        // if this is not buildable, its a cube, and so we will give it rounded corners
        var vertices;
        if (!this.isBuildable) {
            var offsetConst = 18;
            var offsetLeft = left + offsetConst;
            var offsetRight = right - offsetConst;
            var offsetTop = top - offsetConst;
            var offsetBottom = bottom + offsetConst;
            vertices = [
                [left, offsetBottom], [offsetLeft, bottom], [offsetRight, bottom], [right, offsetBottom],
                [right, offsetTop], [offsetRight, top], [offsetLeft, top], [left, offsetTop]];
        } else {
            vertices = this.game.physicsDevice.createRectangleVertices(left, top, right, bottom);
        }

        var shape = this.game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: this.material,
            group: 4 /* OVERLAPPABLES */,
            mask: this.mask
        });
        if (this.body.shapes[0]) {
            this.body.removeShape(this.body.shapes[0]);
        }
        this.body.addShape(shape);
        this.shape = shape;
    };

    Rectangle.prototype.rebuildSprites = function (size) {
        // erase the sprites list
        this.sprites = [];

        for (var i = 0; i < size; i++) {
            var sprite = Draw2DSprite.create({
                width: this.widthInterval,
                height: this.heightInterval,
                origin: [this.widthInterval / 2, this.heightInterval / 2],
                textureRectangle: [0, 0, this.widthInterval, this.heightInterval],
                rotation: (this.rotation - Math.PI)
            });
            sprite.setTexture(this.texture);
            sprite.setTextureRectangle(this.finalTextureRectangle);
            this.sprites.push(sprite);
        }
    };

    /*
    * Method: getShapes
    * Returns a list of all the shapes that should be considered when finding intersections with this interactable.
    * This should include all shapes that can be interacted with in any way (buildable, climbable, etc.)
    */
    Rectangle.prototype.getShapes = function () {
        return this.body.shapes;
    };

    Rectangle.prototype.playerCollideCallback = function (player) {
    };

    Rectangle.prototype.isClimbableAtObjectPosition = function (collisionUtil, shape) {
        var climbable = this.isClimbable && collisionUtil.intersects(this.getClimbableShape(), shape) && this.isInWorld && !this.isDead;
        return climbable;
    };

    Rectangle.prototype.getClimbableShape = function () {
        return this.shape;
    };

    Rectangle.prototype.getTopPosition = function () {
        return this.body.getPosition()[1] - this.currentSize * (this.heightInterval - this.heightBuffer);
    };

    Rectangle.prototype.draw = function (draw2D, offset) {
        // rebuild the sprites to match what is expected
        this.rebuildSprites(this.currentSize);

        // set the texture for the top most sprite, if any
        if (this.sprites.length > 0) {
            var sprite = this.sprites[this.sprites.length - 1];

            if (this.animatedTexture.texture && this.animating && this.isBuildable) {
                sprite.setTexture(this.animatedTexture.texture);
                sprite.setTextureRectangle(this.animatedTexture.currentFrameRectangle());
            } else {
                sprite.setTexture(this.texture);
                sprite.setTextureRectangle(this.finalTextureRectangle);
            }
        }

        if (this.currentSize > 0) {
            var additionalRotation = 0;
            var shiftDirection = [0, 1];
            if (this.growSurface == "top") {
                additionalRotation = 0;
                shiftDirection = [0, -1];
            } else if (this.growSurface == "right") {
                additionalRotation = Math.PI / 2;
                shiftDirection = [1, 0];
            } else if (this.growSurface == "bottom") {
                additionalRotation = Math.PI;
                shiftDirection = [0, 1];
            } else if (this.growSurface == "left") {
                additionalRotation = 3 * Math.PI / 2;
                shiftDirection = [-1, 0];
            }

            var rotation = this.body.getRotation() - Math.PI;

            // correction because origin of each one is centered
            var correction = [0, 0.5];
            correction = [
                correction[0] * Math.cos(rotation) - correction[1] * Math.sin(rotation),
                correction[0] * Math.sin(rotation) + correction[1] * Math.cos(rotation)];

            var finalShift = [0, 0];
            finalShift[0] = shiftDirection[0] * Math.cos(rotation) - shiftDirection[1] * Math.sin(rotation);
            finalShift[1] = shiftDirection[0] * Math.sin(rotation) + shiftDirection[1] * Math.cos(rotation);

            // if we are growing up or down, then the sprite width really is this.width, but if we are growing left or right
            // then the sprite width is actually this.height
            // TODO: Fix this ridiculousness
            var jMax;
            if (this.growSurface == "top" || this.growSurface == "bottom") {
                jMax = this.width;
            } else {
                jMax = this.height;
            }

            for (var i = 0; i < this.sprites.length; i++) {
                for (var j = 0; j < jMax; j++) {
                    var sprite = this.sprites[i];
                    var pos = this.body.getPosition();
                    sprite.x = pos[0] - (correction[0] * this.heightInterval) + ((this.heightInterval - this.heightBuffer) * finalShift[0] * i) - ((this.widthInterval - this.widthBuffer) * finalShift[1] * (j - ((jMax - 1) / 2))); // offset for width
                    sprite.y = pos[1] - (correction[1] * this.heightInterval) + ((this.heightInterval - this.heightBuffer) * finalShift[1] * i) - ((this.widthInterval - this.widthBuffer) * finalShift[0] * (j - ((jMax - 1) / 2))); // offset for width
                    sprite.rotation = rotation + additionalRotation;

                    sprite.x -= offset[0];
                    sprite.y -= offset[1];

                    // and draw it to the screen
                    draw2D.drawSprite(sprite);
                }
            }
        }
    };
    Rectangle.debugColorBuildable = [1.0, 1.0, 1.0, 1.0];
    Rectangle.debugColorClimbable = [0.0, 1.0, 0.0, 1.0];
    Rectangle.debugColorSolid = [1.0, 0.0, 0.0, 1.0];

    Rectangle.BUILD_DELAY_CLIMBABLE = 300;
    Rectangle.NUMBER_OF_FRAMES_CLIMBABLE = 4;
    Rectangle.HEIGHT_INTERVAL_CLIMBABLE = 32;
    Rectangle.WIDTH_INTERVAL_CLIMBABLE = 32;
    Rectangle.HEIGHT_BUFFER_CLIMBABLE = 15;
    Rectangle.WIDTH_BUFFER_CLIMBABLE = 14;
    Rectangle.TEXTURE_FILE_CLIMBABLE = "assets/chain.png";
    Rectangle.FINAL_TEXTURE_RECTANGLE_CLIMBABLE = [96, 0, 128, 32];

    Rectangle.BUILD_DELAY_NONCLIMBABLE = 300;
    Rectangle.NUMBER_OF_FRAMES_NONCLIMBABLE = 5;
    Rectangle.HEIGHT_INTERVAL_NONCLIMBABLE = 64;
    Rectangle.WIDTH_INTERVAL_NONCLIMBABLE = 64;
    Rectangle.HEIGHT_BUFFER_NONCLIMBABLE = 25;
    Rectangle.WIDTH_BUFFER_NONCLIMBABLE = 17;
    Rectangle.TEXTURE_FILE_NONCLIMBABLE = "assets/climbable.png";
    Rectangle.FINAL_TEXTURE_RECTANGLE_NONCLIMBABLE = [256, 0, 320, 64];

    Rectangle.BUILD_DELAY_CUBE = 300;
    Rectangle.NUMBER_OF_FRAMES_CUBE = 1;
    Rectangle.HEIGHT_INTERVAL_CUBE = 64;
    Rectangle.WIDTH_INTERVAL_CUBE = 64;
    Rectangle.HEIGHT_BUFFER_CUBE = 0;
    Rectangle.WIDTH_BUFFER_CUBE = 9;
    Rectangle.TEXTURE_FILE_CUBE = "assets/cube.png";
    Rectangle.FINAL_TEXTURE_RECTANGLE_CUBE = [0, 0, 64, 64];
    return Rectangle;
})(RigidSprite);
/**
* Created by martelly on 4/14/2014.
*/
var InpDevWrapper = (function () {
    function InpDevWrapper(inputDevice, physicsDevice, collisionHelp) {
        var shapes = [
            physicsDevice.createPolygonShape({
                vertices: [[0, 0]]
            })
        ];
        this.mouseBody = physicsDevice.createRigidBody({
            shapes: shapes,
            type: 'kinematic'
        });

        this.mouseDownListeners = [];
        this.mouseUpListeners = [];
        this.mouseEnabled = true;
        this.keyboardEnabled = true;

        this.inputDev = inputDevice;
        this.reverseMapping = {};
        this.recentlyPressed = {};
        this.recentlyReleased = {};
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            recentlyPressed: false,
            recentlyReleased: false };
        for (var item in inputDevice.keyCodes) {
            this.reverseMapping[inputDevice.keyCodes[item]] = item;
        }
        this.keys = {};

        var that = this;
        inputDevice.addEventListener("keydown", function (keycode) {
            that.keys[that.reverseMapping[keycode]] = true;
            that.recentlyPressed[that.reverseMapping[keycode]] = true;
            that.recentlyReleased[that.reverseMapping[keycode]] = false;
        });

        inputDevice.addEventListener("keyup", function (keycode) {
            that.keys[that.reverseMapping[keycode]] = false;
            that.recentlyPressed[that.reverseMapping[keycode]] = false;
            that.recentlyReleased[that.reverseMapping[keycode]] = true;
        });

        inputDevice.addEventListener("mousedown", function (mouseCode, x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
            if (mouseCode === inputDevice.mouseCodes.BUTTON_0) {
                that.mouse.pressed = true;
                that.mouse.recentlyPressed = true;
                that.mouse.recentlyReleased = false;

                for (var i = 0; i < that.mouseDownListeners.length; i++) {
                    var o = that.mouseDownListeners[i];
                    var otherShape = o.shapeFunc();
                    var mouseShape = that.mouseShape();
                    if (collisionHelp.collisionUtils.intersects(mouseShape, otherShape)) {
                        o.callback();
                    }
                }
            }
        });

        inputDevice.addEventListener("mouseup", function (mouseCode, x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
            if (mouseCode === inputDevice.mouseCodes.BUTTON_0) {
                that.mouse.pressed = false;
                that.mouse.recentlyPressed = false;
                that.mouse.recentlyReleased = true;

                for (var i = 0; i < that.mouseUpListeners.length; i++) {
                    var o = that.mouseUpListeners[i];
                    var otherShape = o.shapeFunc();
                    var mouseShape = that.mouseShape();
                    if (collisionHelp.collisionUtils.intersects(mouseShape, otherShape)) {
                        o.callback();
                    }
                }
            }
        });

        inputDevice.addEventListener("mouseover", function (x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
        });
    }
    InpDevWrapper.prototype.addEventListener = function (eventType, shapeFunc, callbackFunc) {
        if (eventType == "mousedown") {
            this.mouseDownListeners.push({
                shapeFunc: shapeFunc,
                callback: callbackFunc
            });
        } else if (eventType == "mouseup") {
            this.mouseUpListeners.push({
                shapeFunc: shapeFunc,
                callback: callbackFunc
            });
        } else {
            console.log("event type: " + eventType + " not supported by InpDevWrapper.");
        }
    };

    InpDevWrapper.prototype.virtualKeyPress = function (key) {
        this.recentlyPressed[key] = true;
        this.recentlyReleased[key] = false;
    };

    InpDevWrapper.prototype.resetListeners = function () {
        this.mouseDownListeners = [];
        this.mouseUpListeners = [];
    };

    InpDevWrapper.prototype.keyPressed = function (key) {
        if (this.keyboardEnabled && key in this.keys) {
            return this.keys[key];
        }
        return false;
    };

    InpDevWrapper.prototype.justPressed = function (key) {
        if (this.keyboardEnabled && key in this.recentlyPressed) {
            return this.recentlyPressed[key];
        }
        return false;
    };

    InpDevWrapper.prototype.justReleased = function (key) {
        if (this.keyboardEnabled && key in this.recentlyReleased) {
            return this.recentlyReleased[key];
        }
        return false;
    };

    InpDevWrapper.prototype.mousePressed = function () {
        return this.mouseEnabled && this.mouse.pressed;
    };

    InpDevWrapper.prototype.mouseX = function () {
        return this.mouse.x;
    };

    InpDevWrapper.prototype.mouseY = function () {
        return this.mouse.y;
    };

    InpDevWrapper.prototype.mousePosition = function () {
        return [this.mouseX(), this.mouseY()];
    };

    InpDevWrapper.prototype.mouseJustPressed = function () {
        return this.mouseEnabled && this.mouse.justPressed;
    };

    InpDevWrapper.prototype.mouseJustReleased = function () {
        return this.mouseEnabled && this.mouse.justReleased;
    };

    InpDevWrapper.prototype.mouseShape = function () {
        this.mouseBody.setPosition([this.mouse.x, this.mouse.y]);
        return this.mouseBody.shapes[0];
    };

    InpDevWrapper.prototype.update = function () {
        this.recentlyPressed = {};
        this.recentlyReleased = {};
    };

    InpDevWrapper.prototype.toggleKeyboard = function (toggle) {
        this.keyboardEnabled = toggle;
    };

    InpDevWrapper.prototype.toggleMouse = function (toggle) {
        this.mouseEnabled = toggle;
    };
    return InpDevWrapper;
})();
/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="toolYarnBall"/>
/// <reference path="tileset.ts"/>
/// <reference path="rectangle.ts"/>
/// <reference path="InpDevWrapper.ts"/>
/*
* Class: Tool
* A tool is an interactable object that allows for the building of another object in the scene.
*
* There are two primary ways of creating a tool. The first is to specify a slew of variables and let
* the tool create the object it will build automatically. This object will appear right on top of
* the tool. The other option is to set its buildable property manually, thereby tying it to another
* object in the scene after creation.
*/
var Tool = (function (_super) {
    __extends(Tool, _super);
    function Tool(options, game) {
        _super.call(this, options);
        this.game = game;
        this.buildables = [];
        if (options.hasOwnProperty("buildable") && options.buildable != null) {
            this.buildables.push(options.buildable);
        }

        if (options.hasOwnProperty("toolYarnBall") && options.toolYarnBall != null) {
            this.toolYarnBall = options.toolYarnBall;
        } else {
            this.toolYarnBall = null;
        }

        // make sure the mask is set so that this does not interact with anything
        this.body.shapes[0].setMask(0);

        this.body.setPosition(options.initialPos);
    }
    Tool.constructFromTiled = function (obj, tileset, game) {
        // fix the rotation so that 0 is up and we're using degrees
        var rotation = (parseFloat(obj.properties.rotation) * (3.141592 / 180)) + 3.141592;

        console.log("Building tool from tiled");
        var material = game.physicsDevice.createMaterial({
            elasticity: 0,
            staticFriction: 0,
            dynamicFriction: 0
        });
        var shape = game.physicsDevice.createPolygonShape({
            vertices: game.physicsDevice.createBoxVertices(obj.width, obj.height),
            material: material,
            group: 2,
            mask: 0
        });
        var body = game.physicsDevice.createRigidBody({
            type: 'kinematic',
            shapes: [shape],
            position: [obj.x + obj.width / 2, obj.y + obj.height / 2]
        });
        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            color: Tool.debugColorTool
        });
        game.physicsWorld.addRigidBody(body);
        var options = {
            sprite: sprite,
            initialPos: [obj.x + obj.width / 2, obj.y + obj.height / 2],
            gid: obj.gid,
            body: body,
            buildable: null
        };

        if (!(obj.properties.prebuilt == "true")) {
            var rectWidth = parseFloat(obj.properties.width) * 64;
            var initHeight = (parseFloat(obj.properties.initHeight) ? parseFloat(obj.properties.initHeight) * 64 : 0);
            var maxHeight = parseFloat(obj.properties.maxHeight) * 64;
            var minHeight = parseFloat(obj.properties.minHeight) * 64;
            var initialPos = [obj.x + obj.width / 2, obj.y + obj.height];

            // limit the size to the shapes we can handle
            //maxHeight = Math.floor(maxHeight / 32) * 32;
            //minHeight = Math.floor(minHeight / 32) * 32;
            //initHeight = Math.floor(initHeight / 32) * 32;
            //rectWidth = Math.ceil(rectWidth / 64) * 64;
            // build the rectangle here if not prebuilt
            var material = game.physicsDevice.createMaterial({
                elasticity: 0,
                staticFriction: 0.3,
                dynamicFriction: 0.2
            });
            var vertices = game.physicsDevice.createRectangleVertices(-rectWidth / 2, 0, rectWidth / 2, initHeight);
            var shape = game.physicsDevice.createPolygonShape({
                vertices: vertices,
                material: material,
                group: 4 /* OVERLAPPABLES */,
                mask: 13 /* SOLID */
            });
            var body = game.physicsDevice.createRigidBody({
                type: "kinematic",
                shapes: [shape],
                mass: 10
            });
            var sprite = Draw2DSprite.create({
                width: rectWidth,
                height: (initHeight ? initHeight : 1),
                origin: [rectWidth / 2, 0],
                color: Tool.debugColorBuildable
            });

            // add the body to the world
            game.physicsWorld.addRigidBody(body);

            body.setPosition(initialPos);
            body.setRotation(rotation);

            console.log("IsClimbable: " + obj.properties.isClimbable);

            var rectOptions = {
                sprite: sprite,
                initialPos: initialPos,
                body: body,
                initSize: initHeight,
                maxSize: maxHeight,
                minSize: minHeight,
                width: rectWidth,
                height: initHeight,
                rotation: rotation,
                isBuildable: (obj.properties.isBuildable == "true"),
                isClimbable: (obj.properties.isClimbable == "true"),
                isSolid: (obj.properties.isSolid == "true"),
                isPullable: (obj.properties.isPullable == "true")
            };

            if (obj.gid) {
                rectOptions.gid = obj.gid;
            }

            if (obj.properties.bodyType) {
                rectOptions.bodyType = obj.properties.bodyType;
            }

            var newRectangle = new Rectangle(rectOptions, game);
            tileset.rigidSprites.push(newRectangle);
            game.collisionHelp.pushInteractable(newRectangle);
            options.buildable = newRectangle;
        }
        var newTool = new Tool(options, game);
        game.collisionHelp.pushInteractable(newTool);
        return newTool;
    };

    /*
    * Method: getShape
    * Returns the shape that the player must be overlapping with in order to build this item. ie the knitting needles.
    */
    Tool.prototype.getShapes = function () {
        return this.body.shapes;
    };

    Tool.prototype.playerCollideCallback = function (player) {
        // check to see if the player is overlapping the right object
        if (this.game.collisionHelp.collisionUtils.intersects(this.body.shapes[0], player.rigidSprite.body.shapes[0]) && this.buildables.length > 0 && !this.isDead) {
            for (var i = 0; i < this.buildables.length; i++) {
                var buildable = this.buildables[i];
                if (this.game.keyboard.keyPressed("W")) {
                    buildable.buildUp();
                    this.game.sfx.setCurrentFX(this.game.sfx.knitUpSFX);
                } else if (this.game.keyboard.keyPressed("S")) {
                    buildable.buildDown();
                    this.game.sfx.setCurrentFX(this.game.sfx.knitUpSFX);
                } else if (!this.game.sfxSource.paused && ((this.game.sfx.currentSFX == this.game.sfx.knitDownSFX) || (this.game.sfx.currentSFX == this.game.sfx.knitUpSFX))) {
                    this.game.sfxSource.pause();
                }
            }
        }
    };

    Tool.prototype.setToolYarnBall = function (toolYarnBall) {
        this.toolYarnBall = toolYarnBall;
        this.toolYarnBall.setBuildable(this.buildables[0]); // XXX: Arbitrarily sets the first buildable
    };

    Tool.prototype.draw = function (draw2D, offset) {
        if (this.game.debugMode) {
            this.sprite.setColor(Chain.debugColorChain);
        } else {
            this.sprite.setColor([0, 0, 0, 0]);
        }

        _super.prototype.draw.call(this, draw2D, offset);
    };
    Tool.debugColorTool = [1.0, 0.0, 0.0, 1.0];
    Tool.debugColorBuildable = [0.0, 1.0, 0.0, 1.0];
    return Tool;
})(RigidSprite);
/// <reference path="interfaces.ts"/>
var Spawn = (function () {
    function Spawn(location) {
        this.location = location;
    }
    Spawn.constructFromTiled = function (obj, tileset, game) {
        var location = [obj.x, obj.y];
        game.spawn = new Spawn(location);
        return null;
    };
    Spawn.prototype.getLocation = function () {
        return this.location;
    };
    return Spawn;
})();
/**
* Created by martelly on 4/13/2014.
*/
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(options, game) {
        _super.call(this, options);
        this.game = game;
    }
    Button.constructFromTiled = function (obj, tileset, game) {
        var phys2D = game.physicsDevice;

        var vertices = [[0, 0], [obj.width, 0], [obj.width, obj.height], [0, obj.height]];

        var shapes = [
            phys2D.createPolygonShape({
                vertices: vertices,
                group: 8,
                mask: 13
            })
        ];
        var body = phys2D.createRigidBody({
            type: 'static',
            shapes: shapes,
            position: [obj.x, obj.y]
        });

        var sprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            x: obj.x,
            y: obj.y,
            origin: [0, 0],
            color: Platform.debugColor
        });

        var rigidSpriteParams = {
            sprite: sprite,
            initialPos: [sprite.x, sprite.y],
            body: body
        };

        var but = new Button(rigidSpriteParams, game);
        var callback = but.clicked;
        if (obj.properties.hasOwnProperty("nextState") && obj.properties.nextState in window) {
            callback = function () {
                if (obj.properties.hasOwnProperty("stateArgs")) {
                    game.nextState = new window[obj.properties.nextState](game, obj.properties.stateArgs);
                } else {
                    game.nextState = new window[obj.properties.nextState](game);
                }
            };
        } else if (obj.properties.hasOwnProperty("progress")) {
            callback = function () {
                if (obj.properties.progress == "start") {
                    game.nextState = game.progression.resetToStartState();
                } else if (obj.properties.progress == "next") {
                    game.nextState = game.progression.getNextState();
                } else if (obj.properties.progress == "current") {
                    game.nextState = game.progression.getNewCurrentState();
                } else if (obj.properties.progress == "resume") {
                    game.keyboard.virtualKeyPress("P"); // (this is really hacky)
                } else {
                    console.log("button behavior undefined for a progress");
                }
            };
        }

        // add event listener
        game.keyboard.addEventListener("mouseup", function () {
            return but.body.shapes[0];
        }, callback);
        return but;
    };

    Button.prototype.draw = function (draw2D, offset) {
        //        this.sprite.setColor(Button.debugColor);
        //        super.draw(draw2D, offset);
    };

    Button.prototype.clicked = function () {
        var nextState;
        var stateArgs;
        console.log("This button has been clicked");
    };
    Button.debugColor = [0.8, .3, 1.0, 0.2];
    return Button;
})(RigidSprite);
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
var Music = (function () {
    function Music() {
    }
    Music.constructFromTiled = function (obj, tileset, game) {
        var bgMusic = game.soundDevice.createSound({
            src: "assets/" + obj.properties.trackname,
            uncompress: false,
            onload: function (soundData) {
                game.bgMusicSource.looping = obj.properties.isLooping == "true";
                game.bgMusicSource.play(soundData);
            }
        });
    };
    return Music;
})();
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="platform.ts"/>
/// <reference path="knitCube.ts"/>
/// <reference path="chain.ts"/>
/// <reference path="tool.ts"/>
/// <reference path="toolYarnBall.ts"/>
/// <reference path="rectangle.ts"/>
/// <reference path="checkpoint.ts"/>
/// <reference path="spawn.ts"/>
/// <reference path="uiClasses.ts"/>
/// <reference path="music.ts"/>
// @TODO:
// do something clever with transparent color to blend
// Tips for making proper tilesets in Tiled.app:
// Ensure that objects have a width and height!
// Double click an object on the map and set its w/h in tiles!
// So a 1-tile image will have width = 1, height = 1
// only represent physics objects as sprites...
// TO MAKE PHYSICS OBJECTS IN TILED:
// give the object property "rigidBody" = "kinematic"/"dynamic"
// and property "shape" = "rectangle"
// we will add more shapes and physics types soon.
// i.e. polygon, dynamic/kinematic...
// material...
// "climbable" = true
var Spritesheet = (function () {
    function Spritesheet() {
    }
    return Spritesheet;
})();

var Tileset = (function () {
    /*
    * Constructor: Tileset
    * Takes the map filename in order to display the map to screen and the game
    * object in order to get access to various game-critical objects and properties.
    */
    function Tileset(mapFilename, game) {
        var _this = this;
        this.spritesheets = [];
        this.ranLoadMap = false;
        this.buildables = [];
        this.toolYarnBalls = [];
        this.tools = [];
        this.game = game;

        this.mapLoadedCallback = function (jsonData) {
            if (jsonData) {
                var mapData = JSON.parse(jsonData);
                _this.mapWidth = mapData.width;
                _this.mapHeight = mapData.height;
                _this.tileWidth = mapData.tilewidth;
                _this.tileHeight = mapData.tileheight;
                _this.mapData = mapData;
                _this.rigidSprites = [];

                for (var i = 0; i < mapData.tilesets.length; i++) {
                    var tileSet = mapData.tilesets[i];
                    var imageHeight = tileSet.imageheight;
                    var imageWidth = tileSet.imagewidth;
                    var spritesheet = new Spritesheet();
                    if (tileSet.transparentcolor) {
                        spritesheet.transparentColor = parseInt(tileSet.transparentcolor.slice(1), 16);
                    }
                    spritesheet.margin = tileSet.margin;
                    spritesheet.spacing = tileSet.spacing;
                    spritesheet.imageRows = Math.floor((imageHeight - spritesheet.margin) / (_this.tileHeight + spritesheet.spacing));
                    spritesheet.imageCols = Math.floor((imageWidth - spritesheet.margin) / (_this.tileWidth + spritesheet.spacing));
                    spritesheet.firstGID = tileSet.firstgid; // global id of tile

                    // setup texture
                    var textureURL = Tileset.BASE_MAP_URL + tileSet.image;
                    _this.spritesheets.push(spritesheet);
                    _this.createTexture(textureURL, i);
                }
            }
        };

        this.slipperyMaterial = this.game.physicsDevice.createMaterial({
            elasticity: 0,
            staticFriction: 0,
            dynamicFriction: 0
        });

        this.game.engine.request(Tileset.BASE_MAP_URL + mapFilename, this.mapLoadedCallback);
    }
    Tileset.prototype.createTexture = function (url, i) {
        var _this = this;
        this.game.graphicsDevice.createTexture({
            src: url,
            mipmaps: true,
            onload: function (texture) {
                if (texture) {
                    _this.spritesheets[i].mapTexture = texture;
                }
            }
        });
    };

    Tileset.prototype.spritesheetForGID = function (gid) {
        if (this.spritesheets.length == 1) {
            return this.spritesheets[0];
        }

        var i = 1;
        for (; i < this.spritesheets.length; i += 1) {
            if (this.spritesheets[i].firstGID > gid) {
                return this.spritesheets[i - 1];
            }
        }
        return this.spritesheets[this.spritesheets.length - 1];
    };

    Tileset.prototype.setTexture = function (rigidSprite, spriteSheet) {
        var textureRectangle = this.getTileCoordinatesForIndex(rigidSprite.gid, spriteSheet);
        rigidSprite.sprite.setTextureRectangle(textureRectangle);
        rigidSprite.sprite.setTexture(spriteSheet.mapTexture);
    };

    Tileset.prototype.isLoaded = function () {
        return (this.mapData != null);
    };

    // kill this tileset by making sure that all rigid bodies cannot interact
    Tileset.prototype.kill = function () {
        for (var i = 0; i < this.rigidSprites.length; i++) {
            var sprite = this.rigidSprites[i];
            sprite.kill();
        }
    };

    /*
    * Method: loadObjectLayer
    *
    * Loads all of the objects in a given object layer, building rigidSprites for each element.
    * Each rigidSprite successfully built is then added to this.rigidSprites.
    * A number of checks are done to make sure that all the objects properties match our expectations.
    */
    Tileset.isValidPhysicsObject = function (obj) {
        return (obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width") && obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties"));
    };

    Tileset.prototype.loadObjectLayer = function (layer) {
        if (layer.objects) {
            var numObjects = layer.objects.length;

            for (var i = 0; i < numObjects; i++) {
                var obj = layer.objects[i];
                if (!(obj.type in window)) {
                    console.log("Could not create object of type: " + obj.type);
                    continue;
                }
                var rigidSprite = window[obj.type].constructFromTiled(obj, this, this.game);

                //console.log("Created object of type: " + obj.type);
                if (rigidSprite != null) {
                    this.rigidSprites.push(rigidSprite);
                }

                // testing so that we can map up rectangles and tiles
                if (obj.type == "Tool" && obj.properties.hasOwnProperty("toolKey")) {
                    //console.log("Adding tool");
                    this.tools.push([obj.properties.toolKey, rigidSprite]);
                } else if (obj.type == "ToolYarnBall" && obj.properties.hasOwnProperty("toolKey")) {
                    this.toolYarnBalls.push([obj.properties.toolKey, rigidSprite]);
                } else if (obj.properties.hasOwnProperty("toolKey")) {
                    this.buildables.push([obj.properties.toolKey, rigidSprite]);
                }
            }
        }
    };

    /*
    * Method: loadTileLayer
    *
    * Makes the tile layer into sprites, referencing the tile index to figure out where it should go.
    */
    Tileset.prototype.loadTileLayer = function (layer) {
        if (layer.data) {
            var numObjects = layer.data.length;
            for (var i = 0; i < numObjects; i++) {
                // for each object, make a sprite if it is visible
                var tileGID = layer.data[i];

                // build the sprite
                if (tileGID != 0) {
                    var screenCoords = this.getScreenCoordinatesForIndex(i);
                    var spriteParams = {
                        x: screenCoords[0],
                        y: screenCoords[1],
                        origin: [0, 0],
                        width: this.tileWidth,
                        height: this.tileHeight
                    };
                    var sprite = Draw2DSprite.create(spriteParams);
                    var rigidSprite = new RigidSprite({
                        sprite: sprite,
                        initialPos: [screenCoords[0], screenCoords[1]],
                        gid: tileGID
                    });

                    // store this rigid sprite
                    this.rigidSprites.push(rigidSprite);
                }
            }
        }
    };

    Tileset.prototype.loadMap = function () {
        //console.log("loading map!");
        var layerCount = this.mapData.layers.length;
        for (var i = 0; i < layerCount; i += 1) {
            var layer = this.mapData.layers[i];

            // the first sub array is buildable objects. The second is climbable
            var createdObjects = [[], []];
            if (layer.type === "objectgroup") {
                this.loadObjectLayer(layer);
            } else if (layer.type === "tilelayer") {
                this.loadTileLayer(layer);
            } else {
                console.log(layer.type);
            }
        }

        for (var i = 0; i < this.tools.length; i++) {
            var key = (this.tools[i][0]);
            var tool = (this.tools[i][1]);

            for (var j = 0; j < this.buildables.length; j++) {
                if (this.buildables[j][0] == key) {
                    //console.log("Found match for key: " + key);
                    tool.buildables.push(this.buildables[j][1]);
                }
            }

            for (var k = 0; k < this.toolYarnBalls.length; k++) {
                if (this.toolYarnBalls[k][0] == key) {
                    tool.setToolYarnBall(this.toolYarnBalls[k][1]);
                }
            }
        }

        this.ranLoadMap = true;

        // return the size of the map
        return [this.mapWidth * this.tileWidth, this.mapHeight * this.tileHeight];
    };

    /*
    * Method: draw
    *
    * Draws all sprites in rigidSprites to the screen
    */
    Tileset.prototype.draw = function (draw2D, offset) {
        var num = this.rigidSprites.length;
        for (var i = 0; i < num; i += 1) {
            var rigidSprite = this.rigidSprites[i];
            var spriteSheet = this.spritesheetForGID(rigidSprite.gid);
            if (rigidSprite.gid != 0 && !rigidSprite.sprite.getTexture() && spriteSheet.mapTexture) {
                this.setTexture(rigidSprite, spriteSheet);
            }
            rigidSprite.draw(draw2D, offset);
        }
    };

    /*
    * Method: getTileCoordinatesForIndex
    *
    * Returns the coordinates in the map texture of the given tile ID (gid).
    */
    Tileset.prototype.getTileCoordinatesForIndex = function (tileGID, spriteSheet) {
        var tileSetIndex = tileGID - spriteSheet.firstGID;
        var tileSetCol = tileSetIndex % spriteSheet.imageCols;
        var tileSetRow = Math.floor(tileSetIndex / spriteSheet.imageCols);

        // We expect [437, 161] for tile [0,0]
        var tileSetX = Math.round(tileSetCol * (this.tileWidth + spriteSheet.spacing) + spriteSheet.margin);
        var tileSetY = Math.round(tileSetRow * (this.tileHeight + spriteSheet.spacing) + spriteSheet.margin);

        return [tileSetX, tileSetY, tileSetX + this.tileWidth, tileSetY + this.tileHeight];
    };

    Tileset.prototype.getScreenCoordinatesForIndex = function (tileIndex) {
        var tileMapCol = tileIndex % this.mapWidth;
        var tileMapRow = Math.floor(tileIndex / this.mapWidth);
        var tileMapX = tileMapCol * this.tileWidth;
        var tileMapY = tileMapRow * this.tileHeight;

        return [tileMapX, tileMapY, tileMapX + this.tileWidth, tileMapY + this.tileHeight];
    };
    Tileset.BASE_MAP_URL = "assets/maps/";
    return Tileset;
})();
/**
* Created by martelly on 5/5/2014.
*/
var Timer = (function () {
    function Timer(fps) {
        this.fps = fps;
        this.sequences = [];
    }
    Timer.prototype.addSequence = function (sequence) {
        this.sequences[sequence.name] = sequence;
    };

    Timer.prototype.removeSequence = function (sequence) {
        delete this.sequences[sequence.name];
    };

    Timer.prototype.update = function () {
        for (var key in this.sequences) {
            this.sequences[key].nextFrame();
        }
    };
    return Timer;
})();

var Sequence = (function () {
    function Sequence(game, name, actions) {
        this.name = name;
        this.game = game;
        this.actions = actions;
        this.currentIndex = 0;
    }
    Sequence.makeSequence = function (game, name, actions) {
        var seq = new Sequence(game, name, actions);
        game.timer.addSequence(seq);
    };

    Sequence.prototype.nextFrame = function () {
        if (this.currentIndex >= this.actions.length) {
            this.game.timer.removeSequence(this);
        } else {
            // run the current action
            this.actions[this.currentIndex].nextFrame();

            // check if it's time to move on to next action
            if (this.actions[this.currentIndex].isComplete()) {
                console.log("Next action index");
                this.currentIndex += 1;
            }
        }
    };
    return Sequence;
})();

/**
*
*/
var SequenceAction = (function () {
    function SequenceAction(game, delay, action) {
        this.action = action;
        this.currentFrame = 0;
        this.totalFrameCount = delay * game.timer.fps;
        this.completed = false;
    }
    SequenceAction.prototype.isComplete = function () {
        return this.completed;
    };

    SequenceAction.prototype.nextFrame = function () {
        if (!this.completed && this.currentFrame > this.totalFrameCount) {
            this.completed = true;
            this.action();
        }
        this.currentFrame += 1;
    };
    return SequenceAction;
})();
/**
* Created by martelly on 4/13/2014.
*/
/// <reference path="interfaces.ts"/>
/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="Timer.ts"/>
var CheckpointManager = (function () {
    function CheckpointManager() {
        this.allCheckpoints = [];
        this.completedCheckpoints = [];
    }
    CheckpointManager.prototype.setGameObject = function (game) {
        this.game = game;
    };

    CheckpointManager.prototype.pushCheckpoint = function (check) {
        this.allCheckpoints.push(check);
        if (check.completed) {
            this.completedCheckpoints.push(check);
        }
    };

    CheckpointManager.prototype.completeCheckpoint = function (check) {
        check.completed = true;
        this.completedCheckpoints.push(check);
    };

    CheckpointManager.prototype.resetPosition = function () {
        if (this.completedCheckpoints.length == 0) {
            return null;
        }
        var lastCheck = this.completedCheckpoints[this.completedCheckpoints.length - 1];
        console.log(lastCheck);
        return lastCheck.body.getPosition();
    };

    CheckpointManager.prototype.removeAllCheckpoints = function () {
        this.allCheckpoints = [];
        this.completedCheckpoints = [];
        this.game.collisionHelp.removeAllCheckpoints();
    };
    return CheckpointManager;
})();

var Checkpoint = (function () {
    function Checkpoint(options) {
        this.body = options.body;
        this.name = options.name;
        this.completed = options.completed == true; // need check since it could be null
        this.checkpointManager = options.checkpointManager;
        this.completedCallback = options.hasOwnProperty("completedCallback") ? options.completedCallback : function () {
        };
    }
    Checkpoint.constructFromTiled = function (obj, tileset, game) {
        var vertices = [[0, 0], [obj.width, 0], [obj.width, obj.height], [0, obj.height]];
        var shapes = [
            game.physicsDevice.createPolygonShape({
                vertices: vertices
            })
        ];
        var body = game.physicsDevice.createRigidBody({
            shapes: shapes,
            type: 'static',
            position: [obj.x, obj.y]
        });
        var name;
        if (obj.properties.hasOwnProperty("checkpointName")) {
            name = String(obj.properties.checkpointName);
        } else {
            name = "Untitled checkpoint";
        }

        var progressCallback = function () {
        };
        if (obj.properties.hasOwnProperty("progress")) {
            progressCallback = function () {
                console.log("progress callback called");
                if (obj.properties.progress == "start") {
                    game.nextState = game.progression.resetToStartState();
                } else if (obj.properties.progress == "next") {
                    game.nextState = game.progression.getNextState();
                } else if (obj.properties.progress == "current") {
                    game.nextState = game.progression.getNewCurrentState();
                } else {
                    console.log("checkpoint behavior undefined for a progress:" + obj.properties.progress);
                }
            };
        }
        var yarnBallCallback = function () {
            progressCallback();
        };
        if (obj.properties.hasOwnProperty("yarn")) {
            console.log("yarn checkpoint");
            yarnBallCallback = function () {
                console.log(obj.properties.yarn);
                if (obj.properties.yarn == "true") {
                    game.progression.addYarnBall(); // will cause animation
                    Sequence.makeSequence(game, "animateYarnBall", [
                        new SequenceAction(game, 0, function () {
                            game.keyboard.toggleKeyboard(false);
                        }),
                        new SequenceAction(game, 4, progressCallback),
                        new SequenceAction(game, 0, function () {
                            game.keyboard.toggleKeyboard(true);
                        })
                    ]);
                } else {
                    console.log("no yarn ball added");
                    progressCallback();
                }
            };
        }

        var allCallbacks = function () {
            progressCallback();
            yarnBallCallback();
        };

        var cp = new Checkpoint({
            body: body,
            name: name,
            checkpointManager: game.checkpointManager,
            completedCallback: yarnBallCallback
        });
        game.collisionHelp.pushCheckpoint(cp);
        game.checkpointManager.pushCheckpoint(cp);
        return null;
    };

    Checkpoint.prototype.playerCollideCallback = function (player) {
        if (!this.completed) {
            this.completed = true;
            this.checkpointManager.completeCheckpoint(this);
            this.completedCallback();
            console.log("yeah! You completed a checkpoint");
        }
    };

    Checkpoint.prototype.getShapes = function () {
        return this.body.shapes;
    };
    return Checkpoint;
})();
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="CollisionHelper.ts"/>
/// <reference path="player.ts"/>
/// <reference path="checkpoint.ts"/>
/// <reference path="Timer.ts"/>
/// <reference path="spawn.ts"/>
var TurbGameState = (function () {
    function TurbGameState(game) {
        this.game = game;
    }
    TurbGameState.prototype.update = function () {
        if (this.game.keyboard.justPressed("M")) {
            var newGain = Math.abs(this.game.bgMusicSource.gain - 1.0);
            console.log("new gain : " + newGain);
            this.game.bgMusicSource.gain = newGain;
            this.game.sfxSource.gain = newGain;
        }

        return;
    };

    TurbGameState.prototype.clearWorld = function () {
        this.game.physicsWorld.clear();
        this.game.checkpointManager.removeAllCheckpoints();
        this.game.collisionHelp.removeAllInteractables();
        this.game.keyboard.resetListeners();
    };
    return TurbGameState;
})();

var ClimbableDefault = (function () {
    function ClimbableDefault() {
        this.isClimbable = true;
    }
    ClimbableDefault.prototype.isClimbableAtObjectPosition = function (collisionUtil, otherShape) {
        return collisionUtil.intersects(this.getClimbableShape(), otherShape);
    };

    ClimbableDefault.prototype.getClimbableShape = function () {
        return this.shape;
    };

    // override this...
    ClimbableDefault.prototype.getTopPosition = function () {
        return 0;
    };
    return ClimbableDefault;
})();
/**
* Created by ethanis on 5/8/14.
*/
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="interfaces.ts" />
var SFXData = (function () {
    function SFXData(fname, game) {
        var _this = this;
        this.fname = fname;
        game.soundDevice.createSound({
            src: "assets/sfx/" + fname,
            uncompress: false,
            onload: function (soundData) {
                if (soundData) {
                    _this.soundData = soundData;
                } else {
                    console.log("NO SOUND DATA...");
                }
            }
        });
    }
    return SFXData;
})();

var SFX = (function () {
    function SFX(game) {
        this.game = game;

        this.walkSFX = new SFXData("jump.wav", game);
        this.jumpSFX = new SFXData("jump.wav", game);
        this.landSFX = new SFXData("jump.wav", game);
        this.knitUpSFX = new SFXData("sewing_machine.wav", game);
        this.knitDownSFX = new SFXData("sewing_machine.wav", game);
        this.collectYarnSFX = new SFXData("sewing_machine.wav", game);
    }
    SFX.prototype.setCurrentFX = function (sound) {
        var data = sound.soundData;
        if (data) {
            if (this.currentSFX != sound || !this.game.sfxSource.playing) {
                this.currentSFX = sound;
                this.game.sfxSource.rewind();
                this.game.sfxSource.play(data);
            }
            if (this.currentSFX == sound && this.game.sfxSource.paused) {
                this.game.sfxSource.resume();
            }
        }
    };
    return SFX;
})();
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="animatedTexture.ts"/>
/// <reference path="masks.ts"/>
/// <reference path="sfx.ts"/>
// a player's sprite is an instance of an animated sprite, which has a
// direction (facing), possibly multiple animated sprite sheets,
// and each sheet has a corresponding cycle time.
// should refactor the player as a state machine...
// this is a mess :'(
var Player = (function () {
    function Player(game, position) {
        var _this = this;
        this.SPEED = 0.2;
        this.JUMP_SPEED = 0.5;
        this.DIST_EPSILON = 0.25;
        this.CLIMB_SPEED = 2;
        this.THRESHOLD_STANDING_SPEED = 0.001;
        this.canClimb = false;
        this.isClimbing = false;
        this.climbableObject = null;
        this.canBuild = false;
        this.rigidSprite = null;
        this.leftBlockingShape = null;
        this.rightBlockingShape = null;
        this.lastTouchedPullable = null;
        this.onGround = false;
        this.groundShape = null;
        this.facing = 1 /* RIGHT */;
        // pulling
        this.canPull = false;
        this.isPulling = false;
        this.pulledObject = null;
        this.standTexture = new AnimatedTexture("assets/player/stand.png", [256, 256], 3, true);
        this.walkTexture = new AnimatedTexture("assets/player/walk.png", [256, 256], 8, true);
        this.jumpTexture = new AnimatedTexture("assets/player/jump.png", [256, 256], 5, false);
        this.climbTexture = new AnimatedTexture("assets/player/climb.png", [256, 256], 6, true);
        this.pullTexture = new AnimatedTexture("assets/player/pull.png", [256, 256], 8, true);
        this.currentTexture = null;
        this.frameDimensions = [256, 256];
        this.animationFrameDurationMS = 100;
        this.animationTimeout = null;
        this.lastClimbPosition = null;
        this.playerDimensions = [128, 128];
        this.playerHitBox = [
            [-20, -46],
            [0, -52],
            [20, -46],
            [20, 58],
            [0, 64],
            [-20, 58]
        ];
        // checks all collisions
        // TODO: combine this and the next function in some nice way
        this.checkCollision = function (arbiter, otherShape) {
            // whenever we hit another shape, check to see if it counts as ground
            // TODO: Wrap this normal test into the stillOnGround function
            var normal = arbiter.getNormal();

            //console.log("Collide! " + normal[0] + ", " + normal[1]);
            if (normal[1] > 0 && normal[1] >= Math.abs(normal[0])) {
                //console.log("On ground is true");
                _this.onGround = true;
                _this.groundShape = otherShape;
            } else if (normal[0] > 0) {
                _this.rightBlockingShape = otherShape;
            } else if (normal[0] < 0) {
                _this.leftBlockingShape = otherShape;
            }
        };
        this.game = game;
        this.collisionUtil = game.collisionHelp.collisionUtils;
        this.mathDevice = game.mathDevice;

        // build the player sprite
        var playerParams = {
            x: position[0],
            y: position[1],
            width: this.playerDimensions[0],
            height: this.playerDimensions[1],
            color: [1.0, 1.0, 1.0, 1.0]
        };
        var playerSprite = Draw2DSprite.create(playerParams);

        var playerShape = game.physicsDevice.createPolygonShape({
            vertices: this.playerHitBox,
            group: 1 /* PLAYER */,
            mask: 13 /* SOLID */
        });
        var playerBody = game.physicsDevice.createRigidBody({
            type: 'dynamic',
            shapes: [playerShape],
            mass: 4,
            linearDrag: 0.001
        });
        var playerRigidSprite = new RigidSprite({
            sprite: playerSprite,
            initialPos: [0, 0],
            body: playerBody
        });

        // next we build a player, including the rigid body, sprite, and managing object
        this.loadTextures(game.graphicsDevice);
        this.animationTimeout = window.setInterval(function () {
            if (_this.currentTexture) {
                _this.currentTexture.updateCurrentFrame();
            }
        }, this.animationFrameDurationMS);

        this.jumpTexture.keyframes = [1, 4];

        this.rigidSprite = playerRigidSprite;
        this.rigidSprite.body.setPosition(position); // should be added to rigidSprite...

        game.physicsWorld.addRigidBody(playerBody);

        // mark the shape as a player
        this.rigidSprite.body.shapes[0].userData = { type: "player", playerObject: this };

        // set up jumping for the player
        this.rigidSprite.body.shapes[0].addEventListener('begin', this.checkCollision, undefined, false);
    }
    // should not have to do this. A little ridiculous.
    Player.prototype.loadTextures = function (graphicsDevice) {
        // import an image to use as the player display and when loading is done set it as the player's texture
        this.standTexture.loadTexture(graphicsDevice);
        this.walkTexture.loadTexture(graphicsDevice);
        this.jumpTexture.loadTexture(graphicsDevice);
        this.climbTexture.loadTexture(graphicsDevice);
        this.pullTexture.loadTexture(graphicsDevice);
        this.setCurrentTexture(this.standTexture);
    };

    // Determine if the player is moving horizontally...
    Player.prototype.isStill = function () {
        return Math.abs(this.rigidSprite.body.getVelocity()[0]) < this.THRESHOLD_STANDING_SPEED;
    };

    // sets the texture used to display the character. If no texture is null, displays a white box
    Player.prototype.setTexture = function (texture) {
        if (this.rigidSprite.sprite != null) {
            this.rigidSprite.sprite.setTexture(texture);
        }
    };

    // only change the currentTexture if it is actually different.
    // if so, reset the texture loop.
    Player.prototype.setCurrentTexture = function (texture) {
        if (texture != this.currentTexture) {
            //            if (texture && this.currentTexture) {
            //                console.log("changing texture from: " + this.currentTexture.textureFile + " to: " + texture.textureFile);
            //            }
            this.currentTexture = texture;
            this.currentTexture.resetLoop();
            this.currentTexture.play();
        }
    };

    Player.prototype.getTextureFrameCount = function () {
        if (this.rigidSprite.sprite != null && this.rigidSprite.sprite.getTexture() != null) {
            return Math.floor(this.rigidSprite.sprite.getTexture().width / this.frameDimensions[0]);
        }
        return 1;
    };

    // only checks collisions with interactables
    Player.prototype.collisionCallback = function (otherObject) {
        // check for climbable and if climbable, set canClimb and save the object
        if (otherObject.hasOwnProperty("isClimbable") && otherObject.isClimbable) {
            this.climbableObject = otherObject;
            this.canClimb = this.climbableObject.isClimbableAtObjectPosition(this.collisionUtil, this.rigidSprite.body.shapes[0]);
        }

        // check for buildable and set canBuild
        if (otherObject.hasOwnProperty("isBuildable") && otherObject.isBuildable) {
            this.canBuild = true;
        }

        if (otherObject.isPullable) {
            this.lastTouchedPullable = otherObject;
        }
    };

    // just calls into sprite
    Player.prototype.setTextureRectangle = function (params) {
        if (this.rigidSprite.sprite != null) {
            this.rigidSprite.sprite.setTextureRectangle(params);
        }
    };

    Player.prototype.getPosition = function () {
        return this.rigidSprite.body.getPosition();
    };

    Player.prototype.setPosition = function (pos) {
        this.rigidSprite.body.setPosition(pos);
    };

    Player.prototype.stopWalking = function () {
        var vel = this.rigidSprite.body.getVelocity();
        this.rigidSprite.body.setVelocity([0, vel[1]]);
    };

    Player.prototype.pull = function (rect) {
        if (!this.pulledObject) {
            this.pulledObject = rect;
            this.isPulling = true;
            rect.isBeingPulled = true;
            //console.log("PULLING!");
        }
    };

    Player.prototype.release = function (rect) {
        if (this.isPulling) {
            rect.isBeingPulled = false;
            this.isPulling = false;
            this.pulledObject = null;
            //console.log("RELEASED!");
        }
    };

    Player.prototype.walkLeft = function () {
        // we should only be allowed to walk if we are on the ground.
        var vel = this.rigidSprite.body.getVelocity();
        var newVel = [-1 * this.SPEED, vel[1]];
        this.rigidSprite.body.setVelocity(newVel);
        if (!this.isPulling) {
            this.facing = 0 /* LEFT */;
        }
    };

    Player.prototype.walkRight = function () {
        var vel = this.rigidSprite.body.getVelocity();
        var newVel = [this.SPEED, vel[1]];
        this.rigidSprite.body.setVelocity(newVel);
        if (!this.isPulling) {
            this.facing = 1 /* RIGHT */;
        }
    };

    Player.prototype.goDown = function () {
        // if we can climb then start climbing. Otherwise, do nothing
        if (this.canClimb) {
            this.isClimbing = true;
            this.climb();
        }
    };

    Player.prototype.goUp = function () {
        // if we can climb then start climbing. Otherwise, do nothing
        if (this.canClimb) {
            this.isClimbing = true;
            this.climb();
        }
    };

    Player.prototype.jumpUp = function () {
        this.game.sfx.setCurrentFX(this.game.sfx.jumpSFX);

        if (this.pulledObject) {
            this.release(this.pulledObject);
        }

        this.isClimbing = false;
        this.lastClimbPosition = null;
        var vel = this.rigidSprite.body.getVelocity();
        this.currentTexture.play();
        this.rigidSprite.body.setVelocity([vel[0], -1 * this.JUMP_SPEED]);
    };

    Player.prototype.stillOnGround = function () {
        // the player can leave the ground without us noticing in the collision detection,
        // so we need to be able to double check that they are still on the ground.
        // That happens here
        var witA = [];
        var witB = [];
        var axis = [];
        if (this.groundShape && this.onGround) {
            try  {
                var dist = this.game.collisionHelp.collisionUtils.signedDistance(this.rigidSprite.body.shapes[0], this.groundShape, witA, witB, axis);
                var isOnGround = (axis[1] >= 0 && axis[1] > axis[0] && dist < this.DIST_EPSILON);

                //            if (!isOnGround){
                //                console.log("not on ground... axes: [" + axis[0] + ", " + axis[1] + "] dist: " + dist);
                //            }
                return isOnGround;
            } catch (error) {
                console.log("uh oh, the shape disappeared before our eyes: " + error.message);
                return this.onGround;
            }
        } else {
            return false;
        }
    };

    Player.prototype.canMoveLeft = function () {
        // one can move left if they are on the ground or if they are climbing or if there is no shape blocking them
        if (this.onGround || this.isClimbing || this.leftBlockingShape == null || this.leftBlockingShape.body == null) {
            return true;
        } else {
            var point = [];
            var normal = [];

            // test for an intersection if we did move in that direction
            var origVel = this.rigidSprite.body.getVelocity();
            var testVel = [-this.SPEED, origVel[1]];
            this.rigidSprite.body.setVelocity(testVel);
            var intersecting = this.game.collisionHelp.collisionUtils.intersects(this.rigidSprite.body.shapes[0], this.leftBlockingShape);
            var sweepHit = this.game.collisionHelp.collisionUtils.sweepTest(this.rigidSprite.body.shapes[0], this.leftBlockingShape, 1000 / 60, point, normal);
            console.log("Left intersecting: " + intersecting + ", sweep: " + sweepHit);

            // move the body back
            this.rigidSprite.body.setVelocity(origVel);

            // you can move left if you aren't currently intersecting and won't in the next movement step left
            return !intersecting && typeof sweepHit == "undefined";
        }
    };

    Player.prototype.canMoveRight = function () {
        // one can move right if they are on the ground or if they are climbing or if there is no shape blocking them
        if (this.onGround || this.isClimbing || this.rightBlockingShape == null || this.rightBlockingShape.body == null) {
            return true;
        } else {
            //console.log("Do have right blocking shape");
            var point = [];
            var normal = [];

            // test for an intersection if we did move in that direction
            var origVel = this.rigidSprite.body.getVelocity();
            var testVel = [this.SPEED, origVel[1]];
            this.rigidSprite.body.setVelocity(testVel);
            var intersecting = this.game.collisionHelp.collisionUtils.intersects(this.rigidSprite.body.shapes[0], this.rightBlockingShape);
            var sweepHit = this.game.collisionHelp.collisionUtils.sweepTest(this.rigidSprite.body.shapes[0], this.rightBlockingShape, 1000 / 60, point, normal);
            console.log("Right intersecting: " + intersecting + ", sweep: " + sweepHit);

            // move the body back
            this.rigidSprite.body.setVelocity(origVel);

            // you can move left if you aren't currently intersecting and won't in the next movement step left
            return !intersecting && typeof sweepHit == "undefined";
        }
    };

    Player.prototype.oppositeFacing = function (direction) {
        return (direction == 0 /* LEFT */) ? 1 /* RIGHT */ : 0 /* LEFT */;
    };

    Player.prototype.flipFacing = function () {
        this.facing = this.oppositeFacing(this.facing);
    };

    Player.prototype.climb = function () {
        // make the player kinematic so they can't fall
        //this.rigidSprite.body.setAsKinematic();
        // calculate the movement direction
        var dir = [0, 0];
        if (this.game.keyboard.keyPressed("LEFT")) {
            dir[0] -= 1;
            this.facing = 0 /* LEFT */;
        }
        if (this.game.keyboard.keyPressed("RIGHT")) {
            dir[0] += 1;
            this.facing = 1 /* RIGHT */;
        }
        if (this.game.keyboard.keyPressed("UP") && !(this.game.keyboard.keyPressed("E") && this.canBuild)) {
            dir[1] -= 1;
        }
        if (this.game.keyboard.keyPressed("DOWN") && !(this.game.keyboard.keyPressed("E") && this.canBuild)) {
            dir[1] += 1;
        }

        if (dir[1] == 0) {
            this.currentTexture.pause();
        } else {
            this.currentTexture.play();
        }

        //        var vectorDir:any = this.mathDevice.v2Build(dir[0], dir[1]);
        //        var normalizedDir:any = this.mathDevice.v2Normalize(vectorDir);
        var vectorLength = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
        if (vectorLength > 0) {
            var normalizedDir = [dir[0] / vectorLength, dir[1] / vectorLength];
            var pos = this.rigidSprite.body.getPosition();
            var nextPos = [pos[0] + (normalizedDir[0] * this.CLIMB_SPEED), pos[1] + (normalizedDir[1] * this.CLIMB_SPEED)];

            // XXX: this is dangerous teleportation! Could break physics engine
            this.rigidSprite.body.setPosition(nextPos);

            // if the player is going to move beyond the top of the climbable, stop them
            // don't know a better way to do this than to just move the object
            var witA = [];
            var witB = [];
            var axis = [];
            var dist = this.collisionUtil.signedDistance(this.climbableObject.getClimbableShape(), this.rigidSprite.body.shapes[0], witA, witB, axis);
            if (!this.climbableObject.isClimbableAtObjectPosition(this.collisionUtil, this.rigidSprite.body.shapes[0]) && axis[1] < 0 && axis[0] * dist < this.DIST_EPSILON) {
                this.rigidSprite.body.setPosition(pos);
            }
        }

        // prevent drift
        var currentPos = this.rigidSprite.body.getPosition();
        if (this.lastClimbPosition != null) {
            currentPos[0] = (dir[0] == 0) ? this.lastClimbPosition[0] : currentPos[0];
            currentPos[1] = (dir[1] == 0) ? this.lastClimbPosition[1] : currentPos[1];
            this.rigidSprite.body.setPosition(currentPos);
        }

        // save current pos
        this.lastClimbPosition = currentPos;
    };

    // consolidate texture updates based on the current player state.
    // call within update(). This is a step towards refactoring the player into a finite state machine.
    Player.prototype.updateTexture = function () {
        if (this.isClimbing) {
            // when player y center ( = their y position) exceeds the top of the climbable object (y position - height),
            // use stand texture instead...
            var showClimbAnimation = this.rigidSprite.body.getPosition()[1] > this.climbableObject.getTopPosition();
            if (showClimbAnimation) {
                this.setCurrentTexture(this.climbTexture);
            } else {
                this.setCurrentTexture(this.standTexture);
            }
        } else {
            if (this.onGround) {
                if (this.isPulling) {
                    this.setCurrentTexture(this.pullTexture);
                } else if (this.canPull) {
                    this.setCurrentTexture(this.pullTexture);
                    this.pullTexture.pause();
                } else if (this.isStill()) {
                    this.setCurrentTexture(this.standTexture);
                } else {
                    this.setCurrentTexture(this.walkTexture);
                }
            } else {
                this.setCurrentTexture(this.jumpTexture);
            }
        }

        if (this.currentTexture.texture) {
            this.setTexture(this.currentTexture.texture);
            this.setTextureRectangle(this.currentTexture.currentFrameRectangle(this.facing));
        }
    };

    Player.prototype.lastTouchedPullableDirection = function () {
        if (this.lastTouchedPullable) {
            var signedDist = this.lastTouchedPullable.body.getPosition()[0] - this.getPosition()[0];
            if (signedDist < 0) {
                return 1 /* RIGHT */;
            }
        }

        // default to returning the opposite of the player's current facing
        // since the pulling sprite is flipped (if no pullables have been encountered yet)
        return 0 /* LEFT */;
    };

    Player.prototype.tryToPull = function () {
        var isStill = this.isStill();

        this.canPull = false;

        if (this.onGround) {
            if (isStill && this.game.keyboard.keyPressed("E") && !this.lastTouchedPullable) {
                this.canPull = true;
            } else if (this.lastTouchedPullable && !this.isPulling) {
                this.pullTexture.play();
                var rectPos = this.lastTouchedPullable.body.getPosition();
                var playerPos = this.getPosition();

                var hDistToPullable = Math.abs(rectPos[0] - playerPos[0]);
                var hDistThreshold = this.playerDimensions[0] / 2 + 10;
                var vDistToPullable = (rectPos[1] - (playerPos[1] + this.playerDimensions[1] / 2 + 16));

                if ((hDistToPullable < hDistThreshold) && vDistToPullable <= 0 && vDistToPullable > -32) {
                    if (isStill) {
                        this.canPull = true;
                    }

                    if (this.game.keyboard.keyPressed("E") && (this.game.keyboard.keyPressed("LEFT") || this.game.keyboard.keyPressed("RIGHT"))) {
                        this.pull(this.lastTouchedPullable);
                    }
                }
            }
        }
    };

    Player.prototype.update = function () {
        // reset rotation just in case
        this.rigidSprite.body.setRotation(0);

        // double check that we are on the ground
        this.onGround = this.stillOnGround();

        //console.log("on ground is " + this.onGround);
        // reset back to last checkpoint when R is pressed
        if (this.game.keyboard.keyPressed("R")) {
            var resetPosition = this.game.checkpointManager.resetPosition();
            if (resetPosition != null) {
                this.rigidSprite.body.setPosition(resetPosition);
            }
        }

        if (!this.game.keyboard.keyPressed("E") && this.pulledObject != null) {
            this.release(this.pulledObject);
        }

        // to be allowed to jump you either have to be climbing or have to be on the ground
        if (this.game.keyboard.keyPressed("SPACE") && (this.isClimbing || this.onGround)) {
            this.rigidSprite.body.setAsDynamic();

            //console.log("JUMPING!");
            this.jumpUp();
        } else if (this.isClimbing) {
            // if we didn't jump and instead are climbing, move around
            this.climb();
        } else if (!this.isClimbing) {
            this.rigidSprite.body.setAsDynamic();

            // handle key presses
            if (this.game.keyboard.keyPressed("LEFT") && this.canMoveLeft()) {
                //console.log("CanMoveLeft");
                this.walkLeft();
            }
            if (this.game.keyboard.keyPressed("RIGHT") && this.canMoveRight()) {
                // verify that pullable is nearby
                //console.log("CanMoveRight");
                this.walkRight();
            }
            if (this.game.keyboard.keyPressed("UP") && !(this.game.keyboard.keyPressed("E") && this.canBuild)) {
                this.goUp();
            }
            if (this.game.keyboard.keyPressed("DOWN") && !(this.game.keyboard.keyPressed("E") && this.canBuild)) {
                this.goDown();
            }
            this.tryToPull();
        }

        // force the player to not fall due to gravity if they are climbing
        if (this.isClimbing) {
            var vel = this.rigidSprite.body.getVelocity();
            this.rigidSprite.body.setVelocity([vel[0], 0]);
        }

        // at the end of every update, erase climbing information.
        // If the player continues to intersect the object, then we'll detect that again before the next update
        if (!this.canClimb) {
            this.isClimbing = false;
            this.lastClimbPosition = null;
        }
        this.canClimb = false;
        this.canBuild = false;

        if (this.isPulling && this.rigidSprite.body) {
            this.pulledObject.body.setVelocity(this.rigidSprite.body.getVelocity());
        }
        if (this.isPulling || this.canPull) {
            this.facing = this.lastTouchedPullableDirection();
        }

        this.updateTexture();
    };

    // draws the player's sprite to the screen
    Player.prototype.draw = function (draw2D, offset) {
        this.rigidSprite.draw(draw2D, offset);
    };
    return Player;
})();
/**
* Created by ethanis on 4/3/14.
*/
// From: https://typescript.codeplex.com/wikipage?title=Mixins%20in%20TypeScript
////////////////////////////////////////
// In your runtime library somewhere
////////////////////////////////////////
var Mixins;
(function (Mixins) {
    function applyMixins(derivedCtor, baseCtors) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
    Mixins.applyMixins = applyMixins;

    // Example of using mixins...
    // Disposable Mixin
    var Disposable = (function () {
        function Disposable() {
        }
        Disposable.prototype.dispose = function () {
            this.isDisposed = true;
        };
        return Disposable;
    })();

    // Activatable Mixin
    var Activatable = (function () {
        function Activatable() {
        }
        Activatable.prototype.activate = function () {
            this.isActive = true;
        };

        Activatable.prototype.deactivate = function () {
            this.isActive = false;
        };
        return Activatable;
    })();

    var SmartObject = (function () {
        function SmartObject() {
            var _this = this;
            // Disposable
            this.isDisposed = false;
            // Activatable
            this.isActive = false;
            setInterval(function () {
                return console.log(_this.isActive + " : " + _this.isDisposed);
            }, 500);
        }
        SmartObject.prototype.interact = function () {
            this.activate();
        };
        return SmartObject;
    })();

    function mixinExample() {
        console.log("Running mixin example.");
        applyMixins(SmartObject, [Disposable, Activatable]);
        var smartObj = new SmartObject();
        setTimeout(function () {
            return smartObj.interact();
        }, 1000);
    }
    Mixins.mixinExample = mixinExample;
})(Mixins || (Mixins = {}));
/**
* Created by martelly on 4/13/2014.
*/
/// <reference path="interfaces.ts"/>
var MenuState = (function (_super) {
    __extends(MenuState, _super);
    function MenuState(game, jsonMap, returnState) {
        if (typeof returnState === "undefined") { returnState = null; }
        _super.call(this, game);
        this.game.keyboard.resetListeners();
        this.game = game;

        this.returnState = returnState;
        this.tileset = new Tileset(jsonMap + ".json", game);
        var viewport = [];
        this.game.draw2D.getViewport(viewport);
    }
    MenuState.prototype.update = function () {
        _super.prototype.update.call(this);
        this.game.graphicsDevice.clear(MenuState.bgColor, 1.0);
        this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);
        if (this.game.keyboard.justPressed("P")) {
            this.game.nextState = this.returnState == null ? this.game.progression.getNextState() : this.returnState;
        }
        if (this.tileset.isLoaded()) {
            if (!this.tileset.ranLoadMap) {
                console.log("Loading menu tileset");
                this.tileset.loadMap();
            }
            this.tileset.draw(this.game.draw2D, [0, 0]);
        }

        this.game.draw2D.end();
    };
    MenuState.bgColor = [0, 0, 0.0, 1.0];
    return MenuState;
})(TurbGameState);
/**
* Created by martelly on 4/28/2014.
*/
var HUD = (function () {
    function HUD(game, yarnNumber) {
        if (typeof yarnNumber === "undefined") { yarnNumber = 5; }
        var _this = this;
        this.game = game;
        this.game.graphicsDevice.createTexture({
            src: ToolYarnBall.TEXTURE_FILE,
            mipmaps: true,
            onload: function (texture) {
                if (texture) {
                    _this.texture = texture;
                } else {
                    console.log("Failed to load HUD asset");
                }
            }
        });
        this.game.graphicsDevice.createTexture({
            src: HUD.ANIMATION_TEXTURE_FILE,
            mipmaps: true,
            onload: function (texture) {
                if (texture) {
                    _this.animTexture = texture;
                } else {
                    console.log("Failed to load animation HUD asset");
                }
            }
        });
        this.textureRect = [0, 0, 64, 64];

        this.numOfYarnBalls = 0;
        this.spritePositions = [];
        var x = HUD.yarnSpacing + HUD.yarnWidth / 2;
        var y = HUD.yarnSpacing + HUD.yarnHeight / 2;

        for (var i = 0; i < yarnNumber; i++) {
            this.spritePositions.push([x, y]);
            x += HUD.yarnSpacing + HUD.yarnWidth;
        }

        this.sprites = [];
        this.spriteStates = [];
        for (var i = 0; i < yarnNumber; i++) {
            var sprite = Draw2DSprite.create({
                width: HUD.yarnWidth,
                height: HUD.yarnHeight,
                x: this.spritePositions[i][0],
                y: this.spritePositions[i][1],
                origin: [HUD.yarnWidth / 2, HUD.yarnHeight / 2],
                color: HUD.greyedOutColor
            });
            this.sprites.push(sprite);
        }

        this.numOfYarnBalls = this.game.progression.totalYarnBalls();
        for (var i = 0; i < this.spritePositions.length; i++) {
            var sprite;
            if (i < this.numOfYarnBalls) {
                this.spriteStates.push("full");
            } else {
                this.spriteStates.push("empty");
            }
        }
    }
    HUD.prototype.animateLastYarn = function () {
        this.numOfYarnBalls = this.game.progression.totalYarnBalls();
        this.refreshStates();
        this.spriteStates[this.numOfYarnBalls - 1] = 0; //animate 1
    };

    HUD.prototype.refreshStates = function () {
        for (var i = 0; i < this.spriteStates.length; i++) {
            if (i < this.numOfYarnBalls) {
                this.spriteStates[i] = "full";
            } else {
                this.spriteStates[i] = "empty";
            }
        }
    };

    HUD.prototype.nextFrame = function () {
        // update states and sprites
        this.sprites = [];
        for (var i = 0; i < this.spriteStates.length; i++) {
            var sprite;
            var state = this.spriteStates[i];
            if (state == "empty" || state == "full") {
                var texture, color;
                if (state == "empty") {
                    color = HUD.greyedOutColor;
                    texture = null;
                } else {
                    color = HUD.collectedColor;
                    texture = this.texture;
                }
                sprite = Draw2DSprite.create({
                    width: HUD.yarnWidth,
                    height: HUD.yarnHeight,
                    x: this.spritePositions[i][0],
                    y: this.spritePositions[i][1],
                    origin: [HUD.yarnWidth / 2, HUD.yarnHeight / 2],
                    color: color,
                    texture: texture,
                    textureRectangle: this.textureRect
                });
            } else {
                // state should be a number
                var textRect;
                textRect = [
                    (Math.floor(state / HUD.pauseBetweenFrames) % HUD.animFrames) * 128, 0,
                    ((Math.floor(state / HUD.pauseBetweenFrames) % HUD.animFrames) + 1) * 128, 128];
                sprite = Draw2DSprite.create({
                    width: HUD.yarnWidth * 2,
                    height: HUD.yarnHeight * 2,
                    x: this.spritePositions[i][0],
                    y: this.spritePositions[i][1],
                    origin: [HUD.yarnWidth, HUD.yarnHeight],
                    color: HUD.collectedColor,
                    texture: this.animTexture,
                    textureRectangle: textRect
                });

                // choose next state
                if (state >= HUD.totalFrames) {
                    this.spriteStates[i] = "full";
                } else {
                    this.spriteStates[i] += 1;
                }
            }
            this.sprites.push(sprite);
        }
    };

    // offset ignored
    HUD.prototype.draw = function (draw2D, offset) {
        if (this.numOfYarnBalls != this.game.progression.totalYarnBalls()) {
            this.animateLastYarn();
            console.log("Time to animate");
        }
        this.nextFrame();
        for (var i = 0; i < this.sprites.length; i++) {
            draw2D.drawSprite(this.sprites[i]);
        }
    };
    HUD.yarnWidth = 50;
    HUD.yarnHeight = 50;
    HUD.yarnSpacing = 30;
    HUD.greyedOutColor = [.2, .2, .2, .8];
    HUD.collectedColor = [1., 1., 1., 1.];
    HUD.TEXTURE_FILE = "assets/goal.png";
    HUD.ANIMATION_TEXTURE_FILE = "assets/goalAnim.png";
    HUD.animFrames = 4;
    HUD.pauseBetweenFrames = 20;
    HUD.totalFrames = 180;
    return HUD;
})();
/**
* Created by martelly on 4/13/2014.
*/
/// <reference path="interfaces.ts"/>
/// <reference path="MenuState.ts"/>
/// <reference path="HUD.ts"/>
var PlayState = (function (_super) {
    __extends(PlayState, _super);
    function PlayState(game, jsonMap) {
        if (typeof jsonMap === "undefined") { jsonMap = "dynamicTest"; }
        var _this = this;
        _super.call(this, game);
        this.mapSize = [Infinity, Infinity];
        _super.prototype.clearWorld.call(this);
        console.log("passed map is " + jsonMap);
        this.game = game;

        // the tileset device manages the tiled maps
        this.defaultTileSet = jsonMap;
        $("#levelNameinput").val(this.defaultTileSet);
        this.tileset = new Tileset(this.defaultTileSet + ".json", game);
        var viewport = [];
        this.game.draw2D.getViewport(viewport);

        // build the player
        this.player = new Player(game, [70, 0]);
        game.collisionHelp.setPlayer(this.player);

        // make the HUD
        this.hud = new HUD(game);

        // make the debug physics device
        this.physicsDebug = Physics2DDebugDraw.create({
            graphicsDevice: this.game.graphicsDevice
        });
        this.physicsDebug.setPhysics2DViewport(viewport);

        $("#levelNameinput").keyup(function (e) {
            // load level when player presses enter
            if (e.keyCode === 13) {
                console.log("loading new level...");
                _this.switchLevel();
            }
        });
    }
    PlayState.prototype.switchLevel = function () {
        var levelName = $("#levelNameinput").val();

        this.tileset.kill(); // kill all interaction with the old tileset
        this.game.nextState = new PlayState(this.game, levelName);
    };

    PlayState.prototype.loadMapIfNecessary = function () {
        if (!this.tileset.ranLoadMap) {
            console.log("Running load map");
            this.mapSize = this.tileset.loadMap();

            // look for a spawn point and move the player if you found one
            if (this.game.hasOwnProperty("spawn") && this.game.spawn != null) {
                console.log("Setting spawn");

                // need to correct for different origins
                // TODO: sort out all the damn origins!
                var loc = this.game.spawn.getLocation();
                loc[0] += 32;
                this.player.setPosition(loc);
            }
        }
    };

    PlayState.prototype.checkOffset = function (offset) {
        if (offset[0] < 0) {
            offset[0] = 0;
        } else if (offset[0] > this.mapSize[0] - width) {
            offset[0] = this.mapSize[0] - width;
        }

        if (offset[1] < 0) {
            offset[1] = 0;
        } else if (offset[1] > this.mapSize[1] - height) {
            offset[1] = this.mapSize[1] - height;
        }
        return offset;
    };

    PlayState.prototype.update = function () {
        _super.prototype.update.call(this);

        // check for debug mode change
        if (this.game.keyboard.justPressed("Q")) {
            this.game.debugMode = !this.game.debugMode;
        }
        if (this.game.keyboard.justPressed("P")) {
            this.game.nextState = new MenuState(this.game, "menuMain", this);
        }
        if (this.game.keyboard.justPressed("I")) {
            this.game.nextState = this.game.progression.getNewCurrentState();
        }

        // simulate a step of the physics by simulating a bunch of small steps until we add up to 1/60 seconds
        var startTime = this.game.physicsWorld.simulatedTime;
        while (this.game.physicsWorld.simulatedTime < startTime + 1 / 60) {
            this.game.physicsWorld.step(1000 / 60); // I think this should go elsewhere... or be wrapped in a test and looped
        }

        this.player.update();
        this.game.collisionHelp.checkCollision();

        // find the offset of all things displayed to screen to keep the player center
        // set this as the viewport
        var offset = [];
        var playerPos = this.player.rigidSprite.body.getPosition();
        offset[0] = playerPos[0] - (width / 2);
        offset[1] = playerPos[1] - (height / 2);
        offset = this.checkOffset(offset);

        var bgColor = [0.25, 0.426, 0.594, 1.0];
        this.game.graphicsDevice.clear(bgColor, 1.0);

        this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);

        if (this.tileset.isLoaded()) {
            this.loadMapIfNecessary();
            this.tileset.draw(draw2D, offset);
        }

        // draw the HUD to the screen
        this.hud.draw(draw2D, offset);

        // draw the player to the screen
        this.player.draw(draw2D, offset);

        this.game.draw2D.end();

        if (this.game.debugMode) {
            // physics2D debug drawing.
            var screenSpacePort = draw2D.getScreenSpaceViewport();
            var physicsPort = [];
            physicsPort[0] = screenSpacePort[0] - offset[0];
            physicsPort[1] = screenSpacePort[1] - offset[1];
            physicsPort[2] = screenSpacePort[2] - offset[0];
            physicsPort[3] = screenSpacePort[3] - offset[1];
            this.physicsDebug.setScreenViewport(physicsPort);
            this.physicsDebug.showRigidBodies = true;
            this.physicsDebug.showContacts = true;
            this.physicsDebug.begin();
            this.physicsDebug.drawWorld(this.game.physicsWorld);
            this.physicsDebug.end();
        }
    };
    return PlayState;
})(TurbGameState);
/**
* Created by martelly on 4/24/2014.
*/
/**
* Basically exactly the same as the menu state except that the button "A" advances
* the scene
*/
var CutsceneState = (function (_super) {
    __extends(CutsceneState, _super);
    function CutsceneState(game, jsonMap) {
        _super.call(this, game);
        _super.prototype.clearWorld.call(this);
        this.game = game;

        this.tileset = new Tileset(jsonMap + ".json", game);
        var viewport = [];
        this.game.draw2D.getViewport(viewport);
    }
    CutsceneState.prototype.update = function () {
        _super.prototype.update.call(this);
        this.game.graphicsDevice.clear(CutsceneState.bgColor, 1.0);
        this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);
        if (this.game.keyboard.justPressed("A")) {
            this.game.nextState = this.game.progression.getNextState();
        }
        if (this.tileset.isLoaded()) {
            if (!this.tileset.ranLoadMap) {
                console.log("Loading menu tileset");
                this.tileset.loadMap();
            }
            this.tileset.draw(this.game.draw2D, [0, 0]);
        }

        this.game.draw2D.end();
    };
    CutsceneState.bgColor = [0.3, 0.4, 0.0, 1.0];
    return CutsceneState;
})(TurbGameState);
/**
* Created by martelly on 4/24/2014.
*/
/// <reference path="interfaces.ts"/>
/// <reference path="CutsceneState.ts"/>
/// <reference path="MenuState.ts"/>
/// <reference path="PlayState.ts"/>
var Progression = (function () {
    function Progression(engine, filename) {
        var _this = this;
        this.entries = {};
        this.collectedYarnBalls = 0;
        this.entries = {};
        this.currentEntry = {
            stateType: "null",
            map: "null",
            nextName: "null"
        };
        this.jsonLoadedCallback = function (jsonData) {
            if (jsonData) {
                var data = JSON.parse(jsonData);
                for (var name in data) {
                    var obj = data[name];
                    if (obj.hasOwnProperty("stateType") && obj.hasOwnProperty("map") && obj.hasOwnProperty("nextName")) {
                        var entry = {
                            stateType: obj.stateType,
                            map: obj.map,
                            nextName: obj.nextName
                        };
                        _this.entries[name] = entry;
                    } else {
                        console.log("entry is malformed" + obj);
                    }
                }
            }
            _this.currentEntry = _this.entries["start"];
        };
        engine.request(Progression.BASE_MAP_URL + filename + ".json", this.jsonLoadedCallback);
    }
    Progression.prototype.setGameObject = function (game) {
        this.game = game;
    };

    Progression.prototype.addYarnBall = function () {
        this.collectedYarnBalls++;
    };

    Progression.prototype.totalYarnBalls = function () {
        return this.collectedYarnBalls;
    };

    Progression.prototype.getNewCurrentState = function () {
        if (this.game == null) {
            console.log("progression game variable not set");
            return null;
        }
        if (this.currentEntry.stateType in window) {
            this.game.checkpointManager.removeAllCheckpoints();
            return new window[this.currentEntry.stateType](this.game, this.currentEntry.map);
        } else {
            console.log("invalid statetype" + this.currentEntry.stateType);
            return null;
        }
    };

    Progression.prototype.getNextState = function () {
        console.log("let's progress to the next state");
        var nextName = this.currentEntry["nextName"];
        if (!(nextName in this.entries)) {
            console.log(nextName + " not found in entries");
        } else {
            this.currentEntry = this.entries[nextName];
        }
        return this.getNewCurrentState();
    };

    Progression.prototype.resetToStartState = function () {
        this.currentEntry = this.entries["start"];
        return this.getNewCurrentState();
    };
    Progression.BASE_MAP_URL = "assets/story/";
    return Progression;
})();
/// <reference path="jslib-modular/canvas.d.ts" />
/// <reference path="jslib-modular/debug.d.ts" />
/// <reference path="jslib-modular/fontmanager.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />
/// <reference path="jslib-modular/vmath.d.ts" />
/// <reference path="scripts/htmlcontrols.d.ts" />
/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="CollisionHelper.ts"/>
/// <reference path="mixins.ts"/>
/// <reference path="chain.ts"/>
/// <reference path="PlayState.ts"/>
/// <reference path="progression.ts"/>
/// <reference path="MenuState.ts"/>
/// <reference path="InpDevWrapper.ts"/>
/// <reference path="masks.ts"/>
/// <reference path="sfx.ts"/>
////////////////////////////////////////////////////////////////////////////////
// Create important objects and set up the game
////////////////////////////////////////////////////////////////////////////////
function objectMask(isSolid) {
    return isSolid ? 13 /* SOLID */ : 0 /* EMPTY */;
}

var width = 1280;
var height = 720;
var fps = 60;
var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
var inputDevice = TurbulenzEngine.createInputDevice({});

// build the physics device to allow 2D constraint physics
var physicsDevice = Physics2DDevice.create();
var physicsWorldParams = {
    gravity: [0, 0.001],
    velocityIterations: 5,
    positionIterations: 5
};

// TODO: Figure out why this function doesn't work!!!
var mathDevice = TurbulenzEngine.createMathDevice({});

var dynamicWorld = physicsDevice.createWorld(physicsWorldParams);
var collisionUtil = physicsDevice.createCollisionUtils();
var collisionHelp = new CollisionHelper(physicsDevice);

// this object draws everything to the screen
var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});
var success = draw2D.configure({
    scaleMode: 'scale',
    viewportRectangle: [0, 0, width, height]
});

var soundDevice = TurbulenzEngine.createSoundDevice({});
var bgMusicSource = soundDevice.createSource({
    looping: true
});
var sfxSource = soundDevice.createSource({
    looping: false
});

var htmlControls = null;

///////////////////////////////////////////////////////////////////////////////
// The Game Object contains all high-level objects that support the game inself.
// Pretty much, put anything in here that you want to easily pass to a number of
// other objects.
///////////////////////////////////////////////////////////////////////////////
var game = {
    engine: TurbulenzEngine,
    mathDevice: mathDevice,
    graphicsDevice: graphicsDevice,
    inputDevice: inputDevice,
    draw2D: draw2D,
    physicsDevice: physicsDevice,
    physicsWorld: dynamicWorld,
    keyboard: new InpDevWrapper(inputDevice, physicsDevice, collisionHelp),
    collisionHelp: collisionHelp,
    checkpointManager: new CheckpointManager(),
    collisionUtil: collisionUtil,
    progression: new Progression(TurbulenzEngine, "draft1Progression"),
    timer: new Timer(fps),
    debugMode: false,
    nextState: null,
    soundDevice: soundDevice,
    bgMusicSource: bgMusicSource,
    sfxSource: sfxSource,
    sfx: null
};

game.sfx = new SFX(game);

game.progression.setGameObject(game);
game.checkpointManager.setGameObject(game);

var currentState = new MenuState(game, "menuStart");

// run the game
function update() {
    this.game.soundDevice.update();

    // update to the next state (can just pass in the same state)
    if (this.game.graphicsDevice.beginFrame()) {
        currentState.update();
        game.timer.update();
        this.game.graphicsDevice.endFrame();
    }
    game.keyboard.update();

    if (game.nextState != null) {
        currentState = game.nextState;
        game.nextState = null;
    }
}

function loadHtmlControls() {
    htmlControls = HTMLControls.create();
    htmlControls.addSliderControl({
        id: "playerJumpSpeedSlider",
        //        value: (player.JUMP_SPEED),
        max: 4,
        min: 0.1,
        step: 0.1,
        fn: function () {
            console.log("CHANGED PLAYER VELOCITY");
            //            player.JUMP_SPEED = this.value;
            //            htmlControls.updateSlider("playerJumpSpeedSlider", player.JUMP_SPEED);
        }
    });

    //    htmlControls.addSliderControl({
    //        id: "dampingSlider",
    //        value: (damping),
    //        max: 2,
    //        min: 0,
    //        step: 0.25,
    //        fn: function () {
    //            damping = this.value;
    //            htmlControls.updateSlider("dampingSlider", damping);
    //            if (elasticConstraints) {
    //                invalidateConstraints();
    //            }
    //        }
    //    });
    htmlControls.register();
}

loadHtmlControls();

TurbulenzEngine.setInterval(update, 1000 / fps);
//Mixins.mixinExample();
//# sourceMappingURL=fibers.js.map
