const keys: Record<string, boolean> = {};
let keysDown: Record<string, boolean> = {};
let keysUp: Record<string, boolean> = {};

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
