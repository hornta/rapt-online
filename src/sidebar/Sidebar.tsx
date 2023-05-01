"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
	IconDice,
	IconEdit,
	IconHelp,
	IconHome,
	IconLogin,
	IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { UserButton } from "./UserButton";

export const Sidebar = () => {
	const user = useUser();
	const clerk = useClerk();

	if (!clerk.loaded) {
		return null;
	}

	return (
		<>
			<aside
				className="fixed top-0 left-0 z-40 sm:w-64 h-screen transition-transform translate-x-0"
				aria-label="Sidebar"
			>
				<div className="h-full flex flex-col px-3 py-4 bg-gray-50 dark:bg-gray-800">
					<div className="overflow-y-auto grow">
						<ul className="space-y-2 font-medium">
							<li>
								<Link
									href="/"
									className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<IconHome />
									<span className="ml-3 hidden sm:block">Home</span>
								</Link>
							</li>
							<li>
								<Link
									href="editor"
									className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<IconEdit />
									<span className="flex-1 ml-3 whitespace-nowrap hidden sm:block">
										Level editor
									</span>
									<span className="hidden sm:inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
										Pro
									</span>
								</Link>
							</li>
							<li>
								<Link
									href="random"
									className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<IconDice />
									<span className="hidden sm:block flex-1 ml-3 whitespace-nowrap">
										Play random
									</span>
									<span className="hidden sm:inline-flex items-center justify-center w-3 h-3 p-3 ml-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
										3
									</span>
								</Link>
							</li>
							<li>
								<Link
									href="browse"
									className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<IconSearch />
									<span className="flex-1 ml-3 whitespace-nowrap hidden sm:block">
										Browse levels
									</span>
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<IconHelp />
									<span className="flex-1 ml-3 whitespace-nowrap hidden sm:block">
										Help
									</span>
								</Link>
							</li>
						</ul>
					</div>

					{user.isSignedIn ? (
						<UserButton />
					) : (
						<ul className="space-y-2 font-medium">
							<li>
								<button
									onClick={() => {
										clerk.redirectToSignIn();
									}}
									className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
								>
									<IconLogin />
									<span className="flex-1 ml-3 whitespace-nowrap">Sign In</span>
								</button>
							</li>
						</ul>
					)}
				</div>
			</aside>
		</>
	);
};
