"use client";

import { useLayoutEffect, useRef } from "react";
import { LevelData } from "./schemas";
import { startGame } from "./game/rapt";

export const initGame = (
	canvas: HTMLCanvasElement,
	level: LevelData,
	restartable: boolean
) => {
	try {
		const {
			destroy,
			resize,
			level: gameLevel,
		} = startGame(canvas, level, window.innerWidth, window.innerHeight);

		const resizeHandler = () => {
			resize(window.innerWidth, window.innerHeight);
		};
		const keyDownHandler = (event: KeyboardEvent) => {
			gameLevel.keyDown(event);

			if (restartable) {
				if (event.code === "KeyR") {
					gameLevel.restart();
				}
			}
		};
		const keyUpHandler = (event: KeyboardEvent) => {
			gameLevel.keyUp(event);
		};
		window.addEventListener("resize", resizeHandler);
		document.addEventListener("keydown", keyDownHandler);
		document.addEventListener("keyup", keyUpHandler);
		return () => {
			destroy();
			window.removeEventListener("resize", resizeHandler);
			document.removeEventListener("keydown", keyDownHandler);
			document.removeEventListener("keyup", keyUpHandler);
		};
	} catch (e) {
		console.log(e);
	}
};

interface GameProps {
	level: LevelData;
}

export const Game = ({ level }: GameProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	useLayoutEffect(() => {
		if (canvasRef.current) {
			return initGame(canvasRef.current, level, false);
		}
	}, [level]);

	return <canvas ref={canvasRef}></canvas>;
};
