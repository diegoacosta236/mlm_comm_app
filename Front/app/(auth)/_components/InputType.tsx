import { IconType } from 'react-icons';

interface InputTypeProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type: string;
  id: string;
  Icon: IconType;
}

const InputType: React.FC<InputTypeProps> = ({ value, onChange, placeholder, type, id, Icon }) => {
  return (
    <div className="relative group">
      <input value={value} onChange={onChange} placeholder={placeholder} required={true} type={type} id={id} className="border border-gray-200 rounded-md pl-3 pr-10 w-[252px] h-10 outline-gray-400" />
      <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:opacity-0 transition-opacity duration-250" />
    </div>
  );
};

export default InputType;
