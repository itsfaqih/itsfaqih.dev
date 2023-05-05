type SectionTitleProps = {
  title: string;
};

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <h2 className="text-lg font-medium text-gray-500 md:text-xl">{title}</h2>
  );
}
