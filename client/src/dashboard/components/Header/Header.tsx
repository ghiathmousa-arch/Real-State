interface HeaderProps {
  title: string;
  description: string;
}
const Header = ({title, description}: HeaderProps) => {
  return (
    <div>
      <h1 className="text-[#004a77] text-5xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
    </div>
  ) 
}

export default Header