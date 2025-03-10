"use client";

import { SaveLevelModal } from "@/app/editor/SaveLevelModal";
import { Button } from "@/components/Button";
import { ButtonGroup } from "@/components/ButtonGroup";
import { EnemiesPanel } from "@/components/EnemiesPanel";
import { HelpPanel } from "@/components/HelpPanel";
import { ToggleButtonGroup } from "@/components/ToggleButtonGroup";
import { WallAndButtonsPanel } from "@/components/WallAndButtonsPanel";
import { initGame } from "@/game";
import {
	MODE_EMPTY,
	MODE_SOLID,
	MODE_DIAGONAL,
	MODE_START,
	MODE_GOAL,
	MODE_ENEMIES,
	MODE_WALLS_BUTTONS,
	MODE_SIGN,
	MODE_SELECT,
	MODE_HELP,
} from "@/game/editor/editor";
import {
	useState,
	useRef,
	useEffect,
	useLayoutEffect,
	MouseEventHandler,
	WheelEventHandler,
	WheelEvent,
	MouseEvent,
	useMemo,
} from "react";
import { Editor as EditorClass } from "@/game/editor/editor";
import { Vector } from "@/game/vector";
import { useUser } from "@clerk/nextjs";
import { ExportLevelModal } from "./ExportLevelModal";
import { ImportLevelModal } from "./ImportLevelModal";
import { ConfirmModal } from "@/components/Modal";
import { debounce } from "@/utils/debounce";
import { LevelData, levelDataSchema } from "@/schemas";

function mousePoint(
	canvas: HTMLCanvasElement,
	event:
		| MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
		| WheelEvent<HTMLCanvasElement>
) {
	const { left, top } = canvas.getBoundingClientRect();
	return new Vector(event.pageX - left, event.pageY - top);
}

const LOCAL_STORAGE_KEY = "work_in_progress_level";

export const Editor = () => {
	const [button, setButton] = useState("empty");
	const [enemyIndex, setEnemyIndex] = useState(0);
	const [wallAndButtonIndex, setWallAndButtonIndex] = useState(0);
	const [isTesting, setIsTesting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isExport, setExport] = useState(false);
	const [isImport, setImport] = useState(false);
	const [clear, setClear] = useState(false);

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

	const user = useUser();

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof Element) {
				if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
					return;
				}
			}

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
					if (!user.isSignedIn) {
						alert("You must be signed in to save the level");
					}
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
	}, [isTesting, user.isSignedIn]);

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
					let initialLevel: LevelData | undefined = undefined;
					const savedLevel = localStorage.getItem(LOCAL_STORAGE_KEY);
					try {
						if (savedLevel !== null) {
							initialLevel = levelDataSchema.parse(JSON.parse(savedLevel));
						}
					} catch {
						//
					}
					editorInstance.current = new EditorClass(
						canvasEl.getContext("2d")!,
						initialLevel
					);
					editor = editorInstance.current;
				}
				const resizeHandler = () => {
					const height = window.innerHeight - toolbarEl.offsetHeight;
					containerEl.style.height = height + "px";
					canvasEl.width = canvasEl.parentElement!.clientWidth;
					canvasEl.height = height;
					editor!.resize();
				};

				const saveToLocalStorage = debounce(() => {
					if (editor) {
						localStorage.setItem(
							LOCAL_STORAGE_KEY,
							JSON.stringify(editor.toJSON())
						);
					}
				}, 500);

				const onUpdateListener = () => {
					saveToLocalStorage();
				};

				editor.addListener("update", onUpdateListener);

				resizeHandler();
				window.addEventListener("resize", resizeHandler);
				return () => {
					window.removeEventListener("resize", resizeHandler);
					editor?.removeListener("update", onUpdateListener);
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

	const levelDataExport = useMemo(() => {
		if (isExport && editorInstance.current) {
			return editorInstance.current.toJSON();
		} else {
			return null;
		}
	}, [isExport]);

	return (
		<div className="overflow-hidden absolute top-0 bottom-0 left-0 right-0">
			<SaveLevelModal
				open={isSaving}
				onClose={() => {
					setIsSaving(false);
				}}
				getLevelData={() => {
					if (editorInstance.current) {
						return editorInstance.current.toJSON();
					}
					return null;
				}}
			/>
			<ExportLevelModal
				open={isExport}
				levelData={levelDataExport}
				onClose={() => {
					setExport(false);
				}}
			/>
			<ImportLevelModal
				open={isImport}
				onClose={() => {
					setImport(false);
				}}
				onImport={(levelData) => {
					if (editorInstance.current) {
						editorInstance.current.fromJSON(levelData);
					}
				}}
			/>
			<ConfirmModal
				open={clear}
				title="Clear level"
				description="Are you sure you want to clear?"
				destructive
				onClose={() => {
					setClear(false);
				}}
				confirmButtonLabel="Clear"
				onConfirm={() => {
					if (editorInstance.current) {
						editorInstance.current.clear();
						setClear(false);
					}
				}}
			/>
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
				<div className="ml-auto text-right">
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
							{isTesting ? "Stop" : "Play test"}
						</Button>
						<Button
							onClick={() => {
								setIsSaving(true);
							}}
							disabled={isTesting}
						>
							Save
						</Button>
						<Button
							onClick={() => {
								setClear(true);
							}}
							disabled={isTesting}
						>
							Clear
						</Button>
						<Button
							onClick={() => {
								setImport(true);
							}}
							disabled={isTesting}
						>
							Import
						</Button>
						<Button
							onClick={() => {
								setExport(true);
							}}
							disabled={isTesting}
						>
							Export
						</Button>
					</ButtonGroup>
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
