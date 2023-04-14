export default async function Page({ params }: { params: { userId: string } }) {
	return <>{params.userId}</>;
}
