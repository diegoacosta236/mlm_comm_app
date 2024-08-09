import { auth, signOut } from "@/auth";

const SettingsPage = async () => {
  const session = await auth();

  return (
    <div className="p-4">
      {JSON.stringify(session)}
      {/* <div className="flex items-center justify-center w-24 h-10 p-2 bg-slate-600 rounded-md text-white text-lg hover:bg-slate-500 transition-colors duration-200">
        <Link href="/api/auth/signout">Logout</Link>
      </div> */}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          type="submit"
          className="w-24 h-10 p-2 bg-slate-600 rounded-md text-white text-lg hover:bg-slate-500 transition-colors duration-200"
        >
          Logout
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;