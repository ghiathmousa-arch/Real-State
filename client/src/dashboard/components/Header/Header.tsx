interface HeaderProps {
  title: string;
  description: string;
}

const Header = ({ title, description }: HeaderProps) => {
  return (
    <div className="mb-6 lg:mb-10 px-4 lg:px-0">
      <h1 className="text-[#004a77] text-2xl sm:text-3xl lg:text-5xl font-bold mb-2">
        {title}
      </h1>
      <p className="text-gray-500 text-xs sm:text-sm">{description}</p>
    </div>
  )
}

// السطر اللي كان ناقص ومسبب المشكلة:
export default Header;