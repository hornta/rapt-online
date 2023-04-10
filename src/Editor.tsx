import {
	MouseEvent,
	MouseEventHandler,
	WheelEventHandler,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	Editor as EditorClass,
	MODE_DIAGONAL,
	MODE_EMPTY,
	MODE_ENEMIES,
	MODE_GOAL,
	MODE_HELP,
	MODE_SELECT,
	MODE_SIGN,
	MODE_SOLID,
	MODE_START,
	MODE_WALLS_BUTTONS,
} from "./game/editor/editor.js";
import { Vector } from "./game/vector.js";
import { Button } from "./components/Button.js";
import { EnemiesPanel } from "./components/EnemiesPanel.js";
import { ToggleButtonGroup } from "./components/ToggleButtonGroup.js";
import { WallAndButtonsPanel } from "./components/WallAndButtonsPanel.js";
import { ButtonGroup } from "./components/ButtonGroup.js";
import { initGame } from "./game.js";
import { HelpPanel } from "./components/HelpPanel.js";
import { levelDataSchema } from "./schemas.js";
import { User } from "./components/User.js";

function mousePoint(canvas: HTMLCanvasElement, event: MouseEvent | WheelEvent) {
	return new Vector(
		event.pageX - canvas.offsetLeft,
		event.pageY - canvas.offsetTop
	);
}

export const Editor = () => {
	const [button, setButton] = useState("empty");
	const [enemyIndex, setEnemyIndex] = useState(0);
	const [wallAndButtonIndex, setWallAndButtonIndex] = useState(0);
	const [isTesting, setIsTesting] = useState(false);

	const onChangeButton = (button: string) => {
		setButton(button);
	};

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement>(null);

	const editorInstance = useRef<EditorClass>();

	const handleMouseEnter: MouseEventHandler<HTMLCanvasElement> = () => {
		if (!isTesting && editorInstance.current) {
			editorInstance.current.mouseOver();
		}
	};

	const handleMouseLeave: MouseEventHandler<HTMLCanvasElement> = () => {
		if (!isTesting && editorInstance.current) {
			editorInstance.current.mouseOut();
		}
	};

	const handleOnWheel: WheelEventHandler<HTMLCanvasElement> = (event) => {
		if (!isTesting && editorInstance.current && canvasRef.current) {
			editorInstance.current.mouseWheel(
				event.deltaX,
				-event.deltaY / Math.abs(event.deltaY),
				mousePoint(canvasRef.current, event)
			);
		}
	};

	const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (event) => {
		if (!isTesting && canvasRef.current && editorInstance.current) {
			editorInstance.current.mouseDown(
				mousePoint(canvasRef.current, event),
				event.buttons
			);
		}
	};
	const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = (event) => {
		if (!isTesting && canvasRef.current && editorInstance.current) {
			editorInstance.current.mouseUp(mousePoint(canvasRef.current, event));
		}
	};

	const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
		if (!isTesting && canvasRef.current && editorInstance.current) {
			editorInstance.current.mouseMoved(mousePoint(canvasRef.current, event));
		}
	};

	const handleDoubleClick: MouseEventHandler<HTMLCanvasElement> = (event) => {
		if (!isTesting && canvasRef.current && editorInstance.current) {
			editorInstance.current.doubleClick(mousePoint(canvasRef.current, event));
		}
	};

	const handleContextMenu: MouseEventHandler<HTMLCanvasElement> = (event) => {
		event.preventDefault();
	};

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (isTesting) {
				if (e.code === "Escape" && isTesting) {
					setIsTesting(false);
				}
				return;
			}

			if (e.ctrlKey) {
				if (e.code === "KeyZ") {
					if (e.shiftKey) {
						editorInstance.current?.redo();
					} else {
						editorInstance.current?.undo();
					}
					e.preventDefault();
				} else if (e.code === "KeyY") {
					editorInstance.current?.redo();
					e.preventDefault();
				} else if (e.code === "KeyS") {
					e.preventDefault();
					// const cleanIndex = editor.doc.undoStack.getCurrentIndex();
					// ajaxPutLevel(editor.save(), () => {
					// 	editor.doc.undoStack.setCleanIndex(cleanIndex);
					// });
				} else if (e.code === "KeyA") {
					editorInstance.current?.selectAll();
					e.preventDefault();
				}
			} else if (e.code === "Backspace" || e.code === "Delete") {
				editorInstance.current?.deleteSeleciton();
				e.preventDefault();
			}
		};
		const onKeyUp = (event: KeyboardEvent) => {};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("keyup", onKeyUp);
		};
	}, [isTesting]);

	useEffect(() => {
		if (editorInstance.current) {
			window.dispatchEvent(new Event("resize"));
			editorInstance.current.setMode(button);
		}
	}, [button]);

	useEffect(() => {
		editorInstance.current?.setSelectedEnemy(enemyIndex);
	}, [enemyIndex]);

	useEffect(() => {
		editorInstance.current?.setSelectedWall(wallAndButtonIndex);
	}, [wallAndButtonIndex]);

	useEffect(() => {
		if (!isTesting) {
			editorInstance.current?.resize();
		}
	}, [isTesting]);

	useLayoutEffect(() => {
		const canvasEl = canvasRef.current;
		const toolbarEl = toolbarRef.current;
		const containerEl = canvasContainerRef.current;

		if (canvasEl && toolbarEl && containerEl) {
			try {
				let editor = editorInstance.current;
				if (!editor) {
					editorInstance.current = new EditorClass(canvasEl.getContext("2d")!);
					editor = editorInstance.current;
				}
				const resizeHandler = () => {
					const height = window.innerHeight - toolbarEl.offsetHeight;
					containerEl.style.height = height + "px";
					canvasEl.width = canvasEl.parentElement!.clientWidth;
					canvasEl.height = height;
					editor!.resize();
				};

				resizeHandler();
				window.addEventListener("resize", resizeHandler);
				return () => {
					window.removeEventListener("resize", resizeHandler);
				};
			} catch (e) {
				console.log(e);
			}
		}
	}, []);

	useEffect(() => {
		if (isTesting && canvasRef.current && editorInstance.current) {
			return initGame(canvasRef.current, editorInstance.current.toJSON(), true);
		}
	}, [isTesting]);

	return (
		<div className="overflow-hidden">
			<div
				ref={toolbarRef}
				className="flex gap-x-4 flex-wrap border border-b-gray-800 p-4 bg-gradient-to-t from-gray-300 to-gray-200"
			>
				<ToggleButtonGroup
					label="Tiles"
					buttons={[
						{ label: "Empty", value: MODE_EMPTY, disabled: isTesting },
						{ label: "Solid", value: MODE_SOLID, disabled: isTesting },
						{ label: "Diagonal", value: MODE_DIAGONAL, disabled: isTesting },
					]}
					onChange={onChangeButton}
					selected={button}
				></ToggleButtonGroup>
				<ToggleButtonGroup
					label="Players"
					buttons={[
						{ label: "Start", value: MODE_START, disabled: isTesting },
						{ label: "Goal", value: MODE_GOAL, disabled: isTesting },
					]}
					onChange={onChangeButton}
					selected={button}
				></ToggleButtonGroup>
				<ToggleButtonGroup
					label="Objects"
					buttons={[
						{ label: "Enemies", value: MODE_ENEMIES, disabled: isTesting },
						{
							label: "Walls / Buttons",
							value: MODE_WALLS_BUTTONS,
							disabled: isTesting,
						},
						{ label: "Sign", value: MODE_SIGN, disabled: isTesting },
					]}
					onChange={onChangeButton}
					selected={button}
				></ToggleButtonGroup>
				<div>
					<ToggleButtonGroup
						buttons={[
							{ label: "Select", value: MODE_SELECT, disabled: isTesting },
							{
								label: "Help",
								value: MODE_HELP,
								disabled: isTesting,
							},
						]}
						onChange={onChangeButton}
						selected={button}
					></ToggleButtonGroup>
				</div>
				<div className="ml-auto">
					<ButtonGroup>
						<Button
							onClick={() => {
								setIsTesting((prev) => {
									return !prev;
								});
								if (
									document.activeElement !== null &&
									"blur" in document.activeElement &&
									typeof document.activeElement.blur === "function"
								) {
									document.activeElement.blur();
								}
							}}
						>
							{isTesting ? "Stop" : "Test"}
						</Button>
						<Button>Save</Button>
						<Button
							onClick={async () => {
								if (editorInstance.current) {
									const json = await navigator.clipboard.readText();
									try {
										editorInstance.current.fromJSON(
											levelDataSchema.parse(JSON.parse(json))
										);
										alert("Level imported successfully");
									} catch (e) {
										alert(
											"Failed to import. Make sure you have a valid level data in your clipboard."
										);
										console.log(e);
									}
								}
							}}
						>
							Import
						</Button>
						<Button
							onClick={() => {
								navigator.clipboard.writeText(
									JSON.stringify(editorInstance.current?.toJSON(), null, 2)
								);
								alert("Level data was copied to clip board");
							}}
						>
							Export
						</Button>
					</ButtonGroup>
					<User />
				</div>
			</div>
			<div className="flex" ref={canvasContainerRef}>
				<div className="grow overflow-hidden">
					<canvas
						ref={canvasRef}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
						onWheel={handleOnWheel}
						onMouseDown={handleMouseDown}
						onMouseUp={handleMouseUp}
						onMouseMove={handleMouseMove}
						onDoubleClick={handleDoubleClick}
						onContextMenu={handleContextMenu}
					></canvas>
				</div>
				{!isTesting &&
					(button === MODE_ENEMIES ||
						button === MODE_WALLS_BUTTONS ||
						button === MODE_HELP) && (
						<div className="w-[240px] overflow-y-auto max-h-full flex-shrink-0">
							{button === MODE_ENEMIES ? (
								<EnemiesPanel
									onChange={(index) => {
										setEnemyIndex(index);
									}}
									activeIndex={enemyIndex}
								/>
							) : button === MODE_WALLS_BUTTONS ? (
								<WallAndButtonsPanel
									onChange={(index) => {
										setWallAndButtonIndex(index);
									}}
									activeIndex={wallAndButtonIndex}
								/>
							) : (
								<HelpPanel />
							)}
						</div>
					)}
			</div>
		</div>
	);
};
