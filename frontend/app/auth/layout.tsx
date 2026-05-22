export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-5 py-12 text-slate-900 sm:px-8">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
