import { ReactNode, createContext } from "react";

export const ButtonGroupContext = createContext<boolean>(null as any);

interface ButtonGroupProps {
	children?: ReactNode;
}

export const ButtonGroup = ({ children }: ButtonGroupProps) => {
	return (
		<ButtonGroupContext.Provider value={true}>
			<div>{children}</div>
		</ButtonGroupContext.Provider>
	);
};
