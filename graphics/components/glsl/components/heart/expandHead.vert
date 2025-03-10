#include <common>

precision highp float;
// Utility functions
attribute vec3 aCenter;
attribute float aRotation;
attribute float aRandom;
attribute vec2 aUv;
attribute float aId;
// Basic
uniform float uTime;

// Ingteraction
uniform float uPosY;
uniform float uShrink;
uniform float uRectWidth;
uniform float uIdle;

uniform vec3 uRayCoords;
uniform sampler2D tWavePropagation;
uniform mat4 tProjectionMatrixCamera;
uniform mat4 tViewMatrixCamera;

uniform float uZoom;
uniform vec2 uShift;

// Physics
uniform float uMotionTime;
uniform float uVel0;
uniform float uGravity;
uniform float uMass;
uniform float uNoise;

// Varyings
varying float view;
varying vec2 vUv;
varying vec3 pos;
varying vec4 vTexCoords;
varying vec4 vWorldPosition;

// Curl noise
#include ../../helpers/curl4.glsl

// Rotation matrix
#include ../../helpers/rotationMatrixX.glsl
#include ../../helpers/rotationMatrixY.glsl
#include ../../helpers/rotationMatrix.glsl

// Noise
#include ../../helpers/noise.glsl