import { useLayoutEffect, useRef } from "react";
import { LevelData } from "./schemas.js";
import { startGame } from "./game/rapt.js";

interface GameProps {
	level: LevelData;
}

export const Game = ({ level }: GameProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	useLayoutEffect(() => {
		if (canvasRef.current) {
			try {
				const { destroy, resize } = startGame(
					canvasRef.current,
					level,
					window.innerWidth,
					window.innerHeight
				);

				const resizeHandler = () => {
					resize(window.innerWidth, window.innerHeight);
				};
				window.addEventListener("resize", resizeHandler);
				return () => {
					destroy();
					window.removeEventListener("resize", resizeHandler);
				};
			} catch (e) {
				console.log(e);
			}
		}
	}, []);

	return <canvas ref={canvasRef}></canvas>;
};
