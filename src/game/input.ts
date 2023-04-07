import { handleKeyDown, handleKeyUp } from "./actionMappings.js";

const keys: Record<string, boolean> = {};
let keysDown: Record<string, boolean> = {};
let keysUp: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
	if (!keys[e.key]) {
		keysDown[e.key] = true;
	}
	keys[e.key] = true;

	handleKeyDown(e.key);
});

window.addEventListener("keyup", (e) => {
	keys[e.key] = false;
	keysUp[e.key] = true;
	handleKeyUp(e.key);
});

window.addEventListener("contextmenu", (e) => {
	e.preventDefault();
});

export const updateInput = () => {
	keysDown = {};
	keysUp = {};
};

export const getKeyDown = (key: string) => {
	return Boolean(keys[key]);
};

export const getKeyPressed = (key: string) => {
	return Boolean(keysDown[key]);
};

export const getKeyReleased = (key: string) => {
	return Boolean(keysUp[key]);
};
