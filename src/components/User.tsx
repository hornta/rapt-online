// import { useClerk, useUser } from "@clerk/nextjs";

export const User = () => {
	// const user = useUser();
	// const clerk = useClerk();

	return (
		<div className="text-right pt-2">
			{/* {user.isSignedIn ? (
				<span>
					{user.user.username},{" "}
					<button
						className="text-violet-500 underline font-normal cursor-pointer"
						onClick={() => {
							clerk.signOut();
						}}
					>
						logout
					</button>
				</span>
			) : (
				<>
					<button
						className="text-violet-500 underline font-normal cursor-pointer"
						onClick={() => {
							clerk.openSignIn({ redirectUrl: location.href });
						}}
					>
						Login
					</button>
				</>
			)} */}
		</div>
	);
};
