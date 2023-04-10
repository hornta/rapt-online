const sectionClass = "bg-gray-300 p-2";

interface SectionLabelProps {
	children: string;
	description?: string;
}

export const SectionLabel = ({ children, description }: SectionLabelProps) => {
	return (
		<div className={sectionClass}>
			<div className="text-center text-sm text-gray-700">{children}</div>
			{description && (
				<div className="text-xs text-gray-500">{description}</div>
			)}
		</div>
	);
};
