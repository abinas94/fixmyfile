export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tools-page flex flex-col items-center">
      {children}
    </div>
  );
}
