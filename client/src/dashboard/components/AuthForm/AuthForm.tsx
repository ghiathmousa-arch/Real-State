import type React from "react"


interface AuthFormProps<T> {
  title: string,
  description: string,
  inputs: Array<{ lable: string, type: string, name: string, pleaceholder?: string }>,
  checkbox?: { lable: string, name: string },
  btn: string

  setData: React.Dispatch<React.SetStateAction<T>>
}

const AuthForm = <T extends object>({ title, description, inputs, checkbox, btn, setData }: AuthFormProps<T>) => {
  
  let data: T

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    data = { ...data, [name] :value}
  }

  const sendData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setData(data)
    console.log(data)
  }

  return (
    <form className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-10" onSubmit={sendData}>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">{title}</h1>
        <p className="text-sm text-gray-400 mt-2">{description}</p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {inputs.map((input, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <label htmlFor={`input-${index}`} className="text-sm font-semibold text-gray-600">
              {input.lable}
            </label>
            <input
              type={input.type}
              name={input.name}
              placeholder={input.pleaceholder}
              id={`input-${index}`}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm text-gray-800 placeholder-gray-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              onChange={handleChange}
            />
          </div>
        ))}

        {checkbox && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              name={checkbox.name}
              id="checkbox"
              className="w-4 h-4 rounded border-gray-300 accent-blue-700 cursor-pointer"
            />
            <label htmlFor="checkbox" className="text-sm text-gray-500 cursor-pointer select-none">
              {checkbox.lable}
            </label>
          </div>
        )}

        <input
          type="submit"
          value={btn}
          className="cursor-pointer w-full h-12 rounded-xl bg-blue-800 hover:bg-blue-900 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all mt-1 shadow-md shadow-blue-200"
        />
      </div>
    </form>
  )
}

export default AuthForm

// onChange={(e) => setData(prev => ({ ...prev, [input.name]: e.target.value }))}
