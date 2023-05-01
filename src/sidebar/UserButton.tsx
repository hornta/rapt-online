import { Popover } from "@/components/Popover";
import { invariant } from "@/invariant";
import { useClerk, useUser } from "@clerk/nextjs";
import { IconSelector } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const UserButton = () => {
	const { user } = useUser();
	invariant(user);
	const clerk = useClerk();

	const [open, setOpen] = useState(false);

	return (
		<Popover
			open={open}
			onChangeOpen={setOpen}
			placement="top-start"
			render={() => {
				return (
					<div className="z-50 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600">
						<div className="px-4 py-3" role="none">
							<p className="text-sm text-gray-900 dark:text-white" role="none">
								{user.username}
							</p>
							{user.primaryEmailAddress && (
								<p
									className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
									role="none"
								>
									{user.primaryEmailAddress.emailAddress}
								</p>
							)}
						</div>
						<ul className="py-1" role="none">
							<li>
								<Link
									href="user/levels"
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem"
								>
									My levels
								</Link>
							</li>
							<li>
								<Link
									href="user/settings"
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem"
								>
									Settings
								</Link>
							</li>
							<li>
								<button
									onClick={() => {
										clerk.signOut();
									}}
									className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
									role="menuitem"
								>
									Sign out
								</button>
							</li>
						</ul>
					</div>
				);
			}}
		>
			<button
				className="rounded-lg p-2 flex hover:bg-gray-100 dark:hover:bg-gray-700 items-center max-w-full mt-3"
				type="button"
				onClick={() => {}}
			>
				<div className="flex items-center grow min-w-0">
					<Image
						src={user.profileImageUrl}
						alt="Bonnie avatar"
						className="rounded-full mr-3 hidden sm:block"
						width={32}
						height={32}
					/>
					<Image
						src={user.profileImageUrl}
						alt="Bonnie avatar"
						className="rounded-full sm:hidden"
						width={24}
						height={24}
					/>
					<div className="text-left truncate hidden sm:block">
						<div className="text-white font-semibold truncate">
							{user.username}
						</div>
						{user.primaryEmailAddress !== null && (
							<div className="text-sm text-gray-400 truncate">
								{user.primaryEmailAddress.emailAddress}
							</div>
						)}
					</div>
				</div>
				<div className="shrink-0 hidden sm:block">
					<IconSelector className="text-gray-400" />
				</div>
			</button>
		</Popover>
	);
};
