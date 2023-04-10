export const HelpPanel = () => {
	return (
		<div className="text-xs p-2">
			<table className="w-full">
				<tbody>
					<tr>
						<td>Save</td>
						<td className="text-right">Ctrl+S</td>
					</tr>
					<tr>
						<td>Undo</td>
						<td className="text-right">Ctrl+Z</td>
					</tr>
					<tr>
						<td>Redo</td>
						<td className="text-right">Ctrl+Y</td>
					</tr>
					<tr>
						<td>Select all</td>
						<td className="text-right">Ctrl+A</td>
					</tr>
					<tr>
						<td>Delete selection</td>
						<td className="text-right">Backspace</td>
					</tr>
					<tr>
						<td>
							<hr className="my-2" />
						</td>
						<td>
							<hr className="my-2" />
						</td>
					</tr>
					<tr>
						<td>Pan camera</td>
						<td className="text-right">Right-drag</td>
					</tr>
					<tr>
						<td>Zoom camera</td>
						<td className="text-right">Scrollwheel</td>
					</tr>
					<tr>
						<td>Move selection</td>
						<td className="text-right">Left-drag</td>
					</tr>
					<tr>
						<td>
							<hr className="my-2" />
						</td>
						<td>
							<hr className="my-2" />
						</td>
					</tr>
					<tr>
						<td>Edit sign</td>
						<td className="text-right">Double-click</td>
					</tr>
				</tbody>
			</table>
			<hr className="my-2" />
			To change starting direction for Bombers, Jet Streams, Wall Crawlers, and
			Wheeligators, select them and drag the triangle (must be in
			&quot;Select&quot; mode).
		</div>
	);
};
