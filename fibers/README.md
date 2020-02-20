Prototype for the CMS.617 video game class.

Install [Turbulenz 0.28.0](https://hub.turbulenz.com/#downloads).

Go to where it was installed (`cd` in terminal).
On Mac OS it is `~/Turbulenz/SDK/0.28.0` by default.

Basically, [follow these directions to try things out](http://docs.turbulenz.com/installing.html#running-a-sample).

```
cd ~/Turbulenz/SDK/0.28.0
source start_env
./start_local.sh
```

Put this project in the turbulenz games devserver directory (or symlink it!), eg:

```
/Users/ethanis/Turbulenz/SDK/0.28.0/devserver/games
```

Now visit [localhost:8070](http://127.0.0.1:8070).

Press the '+' on the left hand side on the web page, and specify `fibers`
as the game directory. Now you can try it! Click `Play -> fibers.debug.html`.

Yay.

[The samples listing](http://127.0.0.1:8070/#/play/samples) has lots of great, self-contained examples.

[Here is a tutorial on tiled map editor](http://gamedevelopment.tutsplus.com/tutorials/introduction-to-tiled-map-editor-a-great-platform-agnostic-tool-for-making-level-maps--gamedev-2838).

# BUILDING THE GAME

Make sure you have [Typescript installed](http://www.typescriptlang.org/#Download).

For now, the build setup is:

```
tsc --sourcemap -w --out build/fibers.js -d fibers.ts
```

You can do this same thing by running:

```
./build.sh
```

Alternatively, WebStorm should automatically rebuild your files if it is setup correctly.
Read their [TypeScript support docs](https://www.jetbrains.com/webstorm/webhelp/typescript-support.html) to learn more.

To make new components, create a new .ts file, then refer to it in the file which depends on it, like this:

```
/// <reference path="player.ts"/>
```

IGNORE THE JAVASCRIPT. I REPEAT, IGNORE THE JAVASCRIPT.
WE ARE WRITING TYPESCRIPT!

Add the following references to the TypeScript file.
They should be specified after the global declarations, but before the TurbulenzEngine.onload function:

```
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/servicedatatypes.d.ts" />
/// <reference path="jslib-modular/services.d.ts" />
/// <reference path="jslib-modular/aabbtree.d.ts" />
/// <reference path="jslib-modular/jsengine_base.d.ts" />
/// <reference path="jslib-modular/jsengine.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />
```

And then in the html file we include the corresponding jslib-modular script files...

#MAKING NEW MAPS

To make a new map, use [Tiled map editor](http://www.mapeditor.org/) to construct it.
Once you're satisfied, export the map as json: `File -> Export As...`.

Place it in `assets/maps/YOUR_MAP_NAME.json`.

###MAKING RIGID BODIES IN MAPS

There are a number of special objects that you can create from tiled. Here's a rough outline of how to make them.

Platforms must have "Platform" as their type and the following Name:Value pairs in the object properties:
* rigidBody:static
* shape:rectangle

Tools must have "Tool" as their type. Each tool can be associated with one other
object in the scene. When intersecting with the tool, the player can build the
other object up and down. You can either tell the tool how to make the other
object, or make the other object yourself in tiled. To tell the program to make
it you must include the following:
* initHeight:<<integer in tiles>>
* maxHeight:<<integer in tiles>>
* minHeight:<<integer in tiles>>
* rotation:<<number in radians>>
* width:<<integer in tiles>>
* isBuildable:<<true or false>>
* isClimbable:<<true or false>>
* isSolid:<<true or false>>
* prebuilt:false

To build the other object yourself, build a rectangle somewhere in the scene and
give it a the property "toolKey" with a value of your choosing. Now give your
tool the following:
* prebuilt:true
* toolKey:<<the same value you gave the rectangle>>

Checkpoints must have "Checkpoint" as their type and the following Name:Value pairs in the object properties:
* "checkpointName":<<some identifying string>>
* press R to go to the last checkpoint that you passed
* Optional: "progress": "start"|"next"|"current"
    * "start" will go back to the very first thing in the progression
    * "next" will go to the next thing in the progression
    * "current" will restart the current state
* Optional: "yarn": "true"|"false"
    * "true" will make it so that you collect an extra yarn ball

Rectangles must have "Rectangle" as their type. Rectangles can be climbable or
not, and buildable or not. Additional options will be added soon. The following
properties must be included:
* isSolid:<<true or false>>
* (optional) maxHeight:<<integer in tiles>> (defaults to the object's height)
* (optional) minHeight:<<integer in tiles>> (defaults to the object's height)
* (optional) rotation:<<number in radians>> (defaults to 0)
* (optional) isBuildable:<<true or false>> (defaults to false)
* (optional) isClimbable:<<true or false>> (defaults to false)
* (optional) isPullable::<<true or false>> (defaults to false)
* (optional) initHeight:<<integer in pixels>> (if included, this will supersede the height of the object as shown in tiled)
* (optional => only if tool prebuilt:true)toolKey:<<the same value you gave the tool you want to control this rectangle>>
* (optional) growSurface:<<left, right, top, or bottom>> (defaults to top)

To add music to a level, create a "Music" object in tiled, and give it attributes:
* trackname: "music/pillow.mp3" (is relative to the assets directory...)
* (optional): isLooping <<true or false>> (defaults to false)
* (optional): delay (number of seconds) (does nothing right now)

Spawn points can be added very simply. Just place a 1 tile x 1 tile (not strictly necessary,
but makes it easier to visualize where the player is going to appear) object in the location
you would like the player to spawn and set its type to "Spawn". That's it!

ToolYarnBall should have "ToolYarnBall" as their type
* toolKey:number which corresponds to which tool it should map to

# Making Menu UI
---Button---
1. Make rectangle object
2. "Type" should be Button
Options 1: Under properties, make sure you assign "nextState" to a type of state: either "MenuState" or "PlayState"
    Optionally (highly suggested) you can assign "stateArgs" and put the name of the next Tiled map to load i.e. "mainMenu"
Options 2: Under properties, assign "progress" to "start", "current", or "next"
    "start" --> Start from the start state in the progression json
    "current" --> remake the current state
    "next" --> Go to the next state in the progression

# Setting a progression
- Progression file is in json format. (Look at testProgression for an example)
- First level of json will be names that are completely up to you. However, there must be at least one name called
    "start" and another called "end". "start" will be the start state of the progression. "end" will determine
    which state should return to the main menu after completion.
- Assigned to each of these names will be a dictionary with the following mappings
    - "stateType" --> the type of state that should be used (e.g. MenuState or PlayState)
    - "map" --> the filename of the map to be loaded (e.g. mainMenu, dynamicTest. Don't include the .json extension)
    - "nextName" --> the name of the state to be moved on to next. The name should be one that is in the top level of
        the json


# MUSIC

[Winter Sunshine EP](http://freemusicarchive.org/music/Evgeny_Grinko/Winter_Sunshine_EP/) by Evgeny Grinko is licensed under a Attribution-NonCommercial-NoDerivatives 2.0 Germany License.

Soundtrack music, "Pillow" and "Byathread," composed by our good friend [Jeffrey Prouty](https://soundcloud.com/user95942475/).
