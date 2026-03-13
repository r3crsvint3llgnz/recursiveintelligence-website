export default function ContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="ri-content-wrapper">{children}</div>;
}
